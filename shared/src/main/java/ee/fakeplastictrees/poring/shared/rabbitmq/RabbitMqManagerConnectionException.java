package ee.fakeplastictrees.poring.shared.rabbitmq;

public class RabbitMqManagerConnectionException extends Exception {
    RabbitMqManagerConnectionException(String message, Throwable t) {
        super(message, t);
    }
}
