package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import ee.fakeplastictrees.poring.shared.config.RabbitMqConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqClientConnectionException;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class RabbitMqClient {
  private final Logger logger = LogManager.getLogger(RabbitMqClient.class);

  private final RabbitMqConfig config;
  private Connection connection;
  private Channel channel;

  public RabbitMqClient(RabbitMqConfig config) {
    this.config = config;
  }

  public void connect() throws RabbitMqClientConnectionException {
    var factory = new ConnectionFactory();
    factory.setHost(config.getHost());
    factory.setPort(config.getPort());
    factory.setUsername(config.getUsername());
    factory.setPassword(config.getPassword());

    try {
      connection = factory.newConnection();
      channel = connection.createChannel();
    } catch (IOException | TimeoutException e) {
      throw new RabbitMqClientConnectionException("failed to connect", e);
    }

    declareTopology();
  }

  private void declareTopology() throws RabbitMqClientConnectionException {
    try {
      var exchangeName = RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName();
      channel.exchangeDeclare(exchangeName, "topic", false, false, null);

      var queueName = RabbitMqTopology.QUEUE_TO_ADAPTER.getName();
      channel.queueDeclare(queueName, false, false, false, null);
    } catch (IOException e) {
      throw new RabbitMqClientConnectionException("failed to declare topology", null);
    }
  }

  public void disconnect() {
    try {
      channel.close();
      connection.close();
    } catch (IOException | TimeoutException e) {
      logger.error("failed to close connection", e);
    }
  }

  public <T> void publish(String exchange, String routingKey, T message) {
    try {
      var json = JsonParser.toJson(message);
      channel.basicPublish(exchange, routingKey, null, json.getBytes(StandardCharsets.UTF_8));
    } catch (IOException e) {
      logger.error("failed to publish", e);
    }
  }

  public <T> RabbitMqConsumer<T> getQueueConsumer(String queue, Class<T> messageClass) {
    return new RabbitMqConsumer<>(channel, null, null, queue, messageClass);
  }

  public <T> RabbitMqConsumer<T> getExchangeConsumer(
      String exchange, String routingKey, Class<T> messageClass) {
    return new RabbitMqConsumer<>(channel, exchange, routingKey, null, messageClass);
  }

  public <T> RabbitMqEventPublisher<T> getPublisher(String exchange, String queue) {
    return new RabbitMqEventPublisher<>(this, exchange, queue);
  }
}
