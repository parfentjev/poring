package ee.fakeplastictrees.poring.shared.rabbitmq;

public class RabbitMqManagerException extends RuntimeException {
    RabbitMqManagerException(String message) {
        super(message);
    }
}
