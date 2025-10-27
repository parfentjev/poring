package ee.fakeplastictrees.poring.shared.rabbitmq;

public class RabbitMqEventPublisher<T> {
  private final RabbitMqClient client;
  private final String exchange;
  private final String queue;

  public RabbitMqEventPublisher(RabbitMqClient client, String exchange, String queue) {
    this.client = client;
    this.exchange = exchange;
    this.queue = queue;
  }

  public void publish(T event) {
    client.publish("", queue, event);
  }

  public void publish(String routingKey, T event) {
    client.publish(exchange, routingKey, event);
  }
}
