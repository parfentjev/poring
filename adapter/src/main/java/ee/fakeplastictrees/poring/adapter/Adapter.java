package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.adapter.exceptions.AdapterConnectionException;
import ee.fakeplastictrees.poring.adapter.utils.MessageParser;
import ee.fakeplastictrees.poring.shared.config.AdapterConfig;
import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.ConnectionState;
import ee.fakeplastictrees.poring.shared.models.EventFactory;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqEventPublisher;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;
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
  private final RabbitMqClient rabbitMqClient;
  private final RabbitMqEventPublisher<AdapterEvent> eventPublisher;

  private Socket socket;
  private BufferedReader reader;
  private PrintWriter writer;

  public Adapter(AdapterConfig config, RabbitMqClient rabbitMqClient) {
    this.config = config;
    this.rabbitMqClient = rabbitMqClient;

    this.eventPublisher =
        rabbitMqClient.getPublisher(RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName(), null);

    this.rabbitMqClient
        .getQueueConsumer(RabbitMqTopology.QUEUE_TO_ADAPTER.getName(), WorkerEvent.class)
        .startQueueConsumer(this::consumeWorkerEvent);
  }

  public void start() throws AdapterConnectionException {
    try {
      var socketFactory = SSLSocketFactory.getDefault();
      socket = socketFactory.createSocket(config.getHost(), config.getPort());
      reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      writer = new PrintWriter(socket.getOutputStream(), true);

      var adapterEvent = EventFactory.adapterEventConnectionState(ConnectionState.CONNECTING);
      eventPublisher.publish("PORING", adapterEvent);

      new Thread(this::listen).start();
    } catch (IOException | IllegalArgumentException e) {
      throw new AdapterConnectionException("failed to connect", e);
    }
  }

  private void listen() {
    try {
      for (String rawMessage; (rawMessage = reader.readLine()) != null; ) {
        handleRawMessage(rawMessage);
      }
    } catch (IOException e) {
      logger.info("socket reader closed");
    }

    var adapterEvent = EventFactory.adapterEventConnectionState(ConnectionState.DISCONNECTED);
    eventPublisher.publish("PORING", adapterEvent);
    reconnect();
  }

  private void reconnect() {
    // disable reconnect for now to track crashes and other unexpected conditions
    var disableReconnect = true;
    if (disableReconnect) {
      rabbitMqClient.disconnect();
      System.exit(1);

      return;
    }

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
    eventPublisher.publish(ircMessage.getCommand(), adapterEvent);
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
}
