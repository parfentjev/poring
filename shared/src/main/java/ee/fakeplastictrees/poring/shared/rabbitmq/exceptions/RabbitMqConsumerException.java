package ee.fakeplastictrees.poring.shared.rabbitmq.exceptions;

public class RabbitMqConsumerException extends RuntimeException {
  public RabbitMqConsumerException(String message, Throwable t) {
    super(message, t);
  }
}
