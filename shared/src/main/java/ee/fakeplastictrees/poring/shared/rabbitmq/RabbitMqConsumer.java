package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.Channel;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

public class RabbitMqConsumer<T> {
  private final Channel channel;
  private final String queue;
  private final Class<T> messageClass;

  public RabbitMqConsumer(Channel channel, String queue, Class<T> messageClass) {
    this.channel = channel;
    this.queue = queue;
    this.messageClass = messageClass;
  }

  public void start(Consumer<T> handler) {
    try {
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
      throw new RuntimeException(e);
    }
  }
}
