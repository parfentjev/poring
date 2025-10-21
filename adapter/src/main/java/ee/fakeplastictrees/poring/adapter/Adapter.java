package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.adapter.exceptions.AdapterConnectionException;
import ee.fakeplastictrees.poring.adapter.utils.MessageParser;
import ee.fakeplastictrees.poring.shared.config.AdapterConfig;
import ee.fakeplastictrees.poring.shared.models.WorkerMessage;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqManager;
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
  private final RabbitMqManager rabbitMqManager;

  private Socket socket;
  private BufferedReader reader;
  private PrintWriter writer;

  public Adapter(AdapterConfig config, RabbitMqManager rabbitMqManager) {
    this.config = config;
    this.rabbitMqManager = rabbitMqManager;
  }

  public void run() throws AdapterConnectionException {
    try {
      var socketFactory = SSLSocketFactory.getDefault();
      socket = socketFactory.createSocket(config.getHost(), config.getPort());
      reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      writer = new PrintWriter(socket.getOutputStream(), true);

      new Thread(this::listen).start();
    } catch (IOException | IllegalArgumentException e) {
      throw new AdapterConnectionException("failed to connect", e);
    }

    rabbitMqManager
        .getConsumer(RabbitMqManager.QUEUE_TO_ADAPTER, WorkerMessage.class)
        .start(this::handleWorkerMessage);

    send("NICK {}", config.getNickname());
    send("USER poring 0 * :https://codeberg.org/parfentjev/poring");

    for (var channel : config.getChannels()) {
      send("JOIN {}", channel);
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

    logger.info("disconnected");
    reconnect();
  }

  private void reconnect() {
    try {
      Thread.sleep(Duration.ofSeconds(10));
      run();
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

    var messageDto = MessageParser.parse(message);
    if (messageDto.command().equals("PING")) {
      send("PONG {}", messageDto.text());
    }

    rabbitMqManager.publish(RabbitMqManager.QUEUE_TO_WORKER, messageDto);
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

  private void handleWorkerMessage(WorkerMessage workerMessage) {
    send(workerMessage.message());
  }
}
