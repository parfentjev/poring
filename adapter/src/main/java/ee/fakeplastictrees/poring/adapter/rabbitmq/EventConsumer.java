package ee.fakeplastictrees.poring.adapter.rabbitmq;

import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqException;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

public class EventConsumer {
  private final RabbitMqClient rabbitMqClient;

  public EventConsumer(RabbitMqClient rabbitMqClient) {
    this.rabbitMqClient = rabbitMqClient;
  }

  public void start(Consumer<WorkerEvent> consumer) {
    try {
      rabbitMqClient.basicConsume(
          RabbitMqTopology.QUEUE_TO_ADAPTER.getName(),
          true,
          (_, delivery) -> {
            var message =
                JsonParser.toObject(
                    new String(delivery.getBody(), StandardCharsets.UTF_8), WorkerEvent.class);

            consumer.accept(message);
          },
          System.out::println);
    } catch (IOException e) {
      throw new RabbitMqException("failed to start a consumer", e);
    }
  }
}
