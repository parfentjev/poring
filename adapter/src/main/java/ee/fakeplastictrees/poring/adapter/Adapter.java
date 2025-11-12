package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.adapter.exceptions.AdapterConnectionException;
import ee.fakeplastictrees.poring.adapter.rabbitmq.EventConsumer;
import ee.fakeplastictrees.poring.adapter.rabbitmq.EventPublisher;
import ee.fakeplastictrees.poring.shared.config.adapter.AdapterConfig;
import ee.fakeplastictrees.poring.shared.models.ConnectionState;
import ee.fakeplastictrees.poring.shared.models.EventFactory;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.time.Duration;
import javax.net.ssl.SSLSocketFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ParameterizedMessage;

public class Adapter {
  private final Logger logger = LogManager.getLogger(Adapter.class);

  private final AdapterConfig config;
  private final EventPublisher publisher;

  private Socket socket;
  private BufferedReader reader;
  private PrintWriter writer;

  public Adapter(AdapterConfig config, RabbitMqClient rabbitMqClient) {
    this.config = config;
    this.publisher = new EventPublisher(rabbitMqClient);

    new EventConsumer(rabbitMqClient).start(this::consumeWorkerEvent);
  }

  public void start() throws AdapterConnectionException {
    try {
      var socketFactory = SSLSocketFactory.getDefault();
      socket = socketFactory.createSocket(config.getHost(), config.getPort());

      // prevent half-open connections
      var socketTimeout = (int) Duration.ofMinutes(10).toMillis();
      socket.setSoTimeout(socketTimeout);

      reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      writer = new PrintWriter(socket.getOutputStream(), true);

      var adapterEvent = EventFactory.adapterEventConnectionState(ConnectionState.CONNECTING);
      publisher.publish("PORING", adapterEvent);

      new Thread(this::listen).start();
    } catch (IOException | IllegalArgumentException e) {
      throw new AdapterConnectionException("failed to connect", e);
    }
  }

  private void listen() {
    try {
      for (var rawMessage = ""; (rawMessage = reader.readLine()) != null; ) {
        handleRawMessage(rawMessage);
      }
    } catch (IOException e) {
      logger.info("socket reader exception", e);
      closeSocket();
    }

    var adapterEvent = EventFactory.adapterEventConnectionState(ConnectionState.DISCONNECTED);
    publisher.publish("PORING", adapterEvent);
    reconnect();
  }

  private void reconnect() {
    try {
      Thread.sleep(Duration.ofSeconds(10));
      start();
    } catch (AdapterConnectionException e) {
      logger.info("failed to reconnect", e);
      reconnect();
    } catch (InterruptedException e) {
      logger.info("you thought you'd never see this one", e);
      reconnect();
    }
  }

  private void handleRawMessage(String message) {
    logger.info("=> {}", message);

    var ircMessage = MessageParser.parse(message);
    if (ircMessage.getCommand().equals("PING")) {
      send("PONG {}", ircMessage.getText());
    }

    var adapterEvent = EventFactory.adapterEventIrcMessage(ircMessage);
    publisher.publish(ircMessage.getCommand(), adapterEvent);
  }

  public void send(String message, Object... params) {
    send(new ParameterizedMessage(message, params).getFormattedMessage());
  }

  public void send(String message) {
    if (socket.isClosed()) {
      return;
    }

    logger.info("<= {}", message);
    writer.println(message);
  }

  private void consumeWorkerEvent(WorkerEvent event) {
    if (event.getIrcMessage() == null) {
      return;
    }

    send(event.getIrcMessage());
  }

  private void closeSocket() {
    try {
      socket.close();
    } catch (IOException e) {
      logger.info("failed to close socket", e);
    }
  }
}
