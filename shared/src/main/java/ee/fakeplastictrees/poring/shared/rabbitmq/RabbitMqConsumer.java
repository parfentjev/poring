package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.Channel;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqConsumerException;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

public class RabbitMqConsumer<T> {
  private final Channel channel;
  private final String exchange;
  private final String routingKey;
  private String queue;
  private final Class<T> messageClass;
  private String consumerTag;

  public RabbitMqConsumer(
      Channel channel, String exchange, String routingKey, String queue, Class<T> messageClass) {
    this.channel = channel;
    this.exchange = exchange;
    this.routingKey = routingKey;
    this.queue = queue;
    this.messageClass = messageClass;
  }

  public void startExchangeConsumer(Consumer<T> handler) {
    try {
      queue = channel.queueDeclare().getQueue();
      channel.queueBind(queue, exchange, routingKey);

      startQueueConsumer(handler);
    } catch (Exception e) {
      throw new RabbitMqConsumerException("failed to bind queue to exchange", e);
    }
  }

  public void startQueueConsumer(Consumer<T> handler) {
    try {
      consumerTag =
          channel.basicConsume(
              queue,
              true,
              (tag, delivery) -> {
                var message =
                    JsonParser.toObject(
                        new String(delivery.getBody(), StandardCharsets.UTF_8), messageClass);

                handler.accept(message);
              },
              System.out::println);
    } catch (Exception e) {
      throw new RabbitMqConsumerException("failed to create queue consumer", e);
    }
  }

  public void cancel() {
    try {
      channel.basicCancel(consumerTag);
    } catch (IOException e) {
      throw new RabbitMqConsumerException("failed to cancel consumer", e);
    }
  }
}
