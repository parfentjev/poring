package ee.fakeplastictrees.poring.worker.rabbitmq;

import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqException;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.function.BiConsumer;

public class EventConsumer {
  private final RabbitMqClient rabbitMqClient;

  public EventConsumer(RabbitMqClient rabbitMqClient) {
    this.rabbitMqClient = rabbitMqClient;
  }

  public void start(BiConsumer<String, AdapterEvent> consumer) {
    try {
      var queue = rabbitMqClient.getChannel().queueDeclare().getQueue();
      var allCommandsWildcard = "#";

      rabbitMqClient
          .getChannel()
          .queueBind(queue, RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName(), allCommandsWildcard);

      rabbitMqClient
          .getChannel()
          .basicConsume(
              queue,
              true,
              (_, delivery) -> {
                var message =
                    JsonParser.toObject(
                        new String(delivery.getBody(), StandardCharsets.UTF_8), AdapterEvent.class);

                consumer.accept(delivery.getEnvelope().getRoutingKey(), message);
              },
              System.out::println);
    } catch (IOException e) {
      throw new RabbitMqException("failed to start a consumer", e);
    }
  }
}
