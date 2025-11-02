package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.*;
import ee.fakeplastictrees.poring.shared.config.rabbitmq.RabbitMqConfig;
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
    try {
      connection = getConnectionFactory().newConnection();
      connection.addShutdownListener(
          exception -> logger.info("rabbitmq connection is closed: {}", exception.getMessage()));
      channel = connection.createChannel();
    } catch (IOException | TimeoutException e) {
      throw new RabbitMqClientConnectionException("failed to connect", e);
    }

    declareTopology();
  }

  private ConnectionFactory getConnectionFactory() {
    var factory = new ConnectionFactory();
    factory.setHost(config.getHost());
    factory.setPort(config.getPort());
    factory.setUsername(config.getUsername());
    factory.setPassword(config.getPassword());
    factory.setAutomaticRecoveryEnabled(true);
    factory.setNetworkRecoveryInterval(5000);
    factory.setTopologyRecoveryEnabled(true);

    return factory;
  }

  private void declareTopology() throws RabbitMqClientConnectionException {
    try {
      var exchangeName = RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName();
      channel.exchangeDeclare(exchangeName, "topic", false, false, null);

      var queueName = RabbitMqTopology.QUEUE_TO_ADAPTER.getName();
      channel.queueDeclare(queueName, false, false, false, null);
    } catch (IOException e) {
      throw new RabbitMqClientConnectionException("failed to declare topology", e);
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

  public String basicConsume(
      String queue, boolean autoAck, DeliverCallback deliverCallback, CancelCallback cancelCallback)
      throws IOException {
    return channel.basicConsume(queue, autoAck, deliverCallback, cancelCallback);
  }

  public AMQP.Queue.DeclareOk queueDeclare() throws IOException {
    return channel.queueDeclare();
  }

  public AMQP.Queue.BindOk queueBind(String queue, String exchange, String routingKey)
      throws IOException {
    return channel.queueBind(queue, exchange, routingKey);
  }
}
