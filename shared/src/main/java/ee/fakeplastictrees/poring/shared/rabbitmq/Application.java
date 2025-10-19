package ee.fakeplastictrees.poring.shared.rabbitmq;

import ee.fakeplastictrees.poring.shared.rabbitmq.exception.RabbitMqManagerConnectionException;

public class Application {
    public static void main(String[] args) {
        var host = System.getenv("RABBITMQ_HOST");
        var port = Integer.parseInt(System.getenv("RABBITMQ_PORT"));
        var username = System.getenv("RABBITMQ_USERNAME");
        var password = System.getenv("RABBITMQ_PASSWORD");

        var manager = new RabbitMqManager(host, port, username, password);
        try {
            manager.connect();
            manager.disconnect();
        } catch (RabbitMqManagerConnectionException e) {
            e.printStackTrace();
        }
    }
}
