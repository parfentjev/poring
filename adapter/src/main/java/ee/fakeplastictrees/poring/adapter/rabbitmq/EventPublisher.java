package ee.fakeplastictrees.poring.adapter.rabbitmq;

import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;

public class EventPublisher {
  private final RabbitMqClient rabbitMqClient;

  public EventPublisher(RabbitMqClient rabbitMqClient) {
    this.rabbitMqClient = rabbitMqClient;
  }

  public void publish(String command, AdapterEvent event) {
    rabbitMqClient.publish(RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName(), command, event);
  }
}
