package ee.fakeplastictrees.poring.shared.rabbitmq.exceptions;

public class RabbitMqClientException extends RuntimeException {
  RabbitMqClientException(String message) {
    super(message);
  }
}
