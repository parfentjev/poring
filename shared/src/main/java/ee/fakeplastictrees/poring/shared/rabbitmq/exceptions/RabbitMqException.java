package ee.fakeplastictrees.poring.shared.rabbitmq.exceptions;

public class RabbitMqException extends RuntimeException {
  public RabbitMqException(String message, Throwable t) {
    super(message, t);
  }
}
