package ee.fakeplastictrees.poring.shared.rabbitmq;

import ee.fakeplastictrees.poring.shared.config.Config;
import ee.fakeplastictrees.poring.shared.rabbitmq.exception.RabbitMqManagerConnectionException;

public class Application {
    public static void main(String[] args) {
        var config = Config.getInstance();

        var manager = new RabbitMqManager(config.getRabbitMq());
        try {
            manager.connect();
            manager.disconnect();
        } catch (RabbitMqManagerConnectionException e) {
            e.printStackTrace();
        }
    }
}
