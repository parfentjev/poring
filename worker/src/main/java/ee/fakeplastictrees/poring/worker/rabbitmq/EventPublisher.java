package ee.fakeplastictrees.poring.worker.rabbitmq;

import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;

public class EventPublisher {
  private final RabbitMqClient rabbitMqClient;

  public EventPublisher(RabbitMqClient rabbitMqClient) {
    this.rabbitMqClient = rabbitMqClient;
  }

  public void publish(WorkerEvent event) {
    rabbitMqClient.publish("", RabbitMqTopology.QUEUE_TO_ADAPTER.getName(), event);
  }
}
