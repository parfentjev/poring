package ee.fakeplastictrees.poring.shared.rabbitmq.exception;

public class RabbitMqManagerException extends RuntimeException {
    public RabbitMqManagerException(String message) {
        super(message);
    }
}
