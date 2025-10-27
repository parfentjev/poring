package ee.fakeplastictrees.poring.shared.rabbitmq.exceptions;

public class RabbitMqClientConnectionException extends Exception {
  public RabbitMqClientConnectionException(String message, Throwable t) {
    super(message, t);
  }
}
