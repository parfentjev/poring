package ee.fakeplastictrees.poring.worker;

import ee.fakeplastictrees.poring.shared.config.ApplicationConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqClientConnectionException;

public class Application {
  static void main() throws RabbitMqClientConnectionException {
    var config = new ApplicationConfig();

    var rabbitMqClient = new RabbitMqClient(config.getRabbitMq());
    rabbitMqClient.connect();

    var worker = new Worker(config.getWorker(), rabbitMqClient);
    worker.start();
  }
}
