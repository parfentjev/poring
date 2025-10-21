package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import ee.fakeplastictrees.poring.shared.config.RabbitMqConfig;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class RabbitMqManager {
  private final Logger logger = LogManager.getLogger(RabbitMqManager.class);

  public static final String QUEUE_TO_ADAPTER = "to_adapter";
  public static final String QUEUE_TO_WORKER = "to_worker";

  private final RabbitMqConfig config;
  private Connection connection;
  private Channel channel;

  public RabbitMqManager(RabbitMqConfig config) {
    this.config = config;
  }

  public void connect() throws RabbitMqManagerConnectionException {
    var factory = new ConnectionFactory();
    factory.setHost(config.getHost());
    factory.setPort(config.getPort());
    factory.setUsername(config.getUsername());
    factory.setPassword(config.getPassword());

    try {
      connection = factory.newConnection();
      channel = connection.createChannel();
    } catch (IOException | TimeoutException e) {
      throw new RabbitMqManagerConnectionException("failed to connect", e);
    }

    setUp();
  }

  private void setUp() throws RabbitMqManagerConnectionException {
    try {
      channel.queueDeclare(QUEUE_TO_ADAPTER, false, false, false, null);
      channel.queueDeclare(QUEUE_TO_WORKER, false, false, false, null);
    } catch (IOException e) {
      throw new RabbitMqManagerConnectionException("failed to declare exchanges", null);
    }
  }

  public void disconnect() throws RabbitMqManagerConnectionException {
    try {
      channel.close();
      connection.close();
    } catch (IOException | TimeoutException e) {
      throw new RabbitMqManagerConnectionException("failed to close connection", e);
    }
  }

  public <T> void publish(String queue, T message) {
    try {
      var json = JsonParser.toJson(message);
      channel.basicPublish("", queue, null, json.getBytes(StandardCharsets.UTF_8));
    } catch (IOException e) {
      logger.error("failed to publish message", e);
    }
  }

  public <T> RabbitMqConsumer<T> getConsumer(String queue, Class<T> messageClass) {
    return new RabbitMqConsumer<>(channel, queue, messageClass);
  }
}
