package ee.fakeplastictrees.poring.shared.rabbitmq.exception;

public class RabbitMqManagerConnectionException extends Exception {
    public RabbitMqManagerConnectionException(String message, Throwable t) {
        super(message, t);
    }
}
