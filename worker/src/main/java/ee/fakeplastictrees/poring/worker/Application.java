package ee.fakeplastictrees.poring.worker;

import ee.fakeplastictrees.poring.shared.config.worker.WorkerConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqClientConnectionException;

public class Application {
  static void main() throws RabbitMqClientConnectionException {
    var config = new WorkerConfig();

    var rabbitMqClient = new RabbitMqClient(config.getRabbitMq());
    rabbitMqClient.connect();

    var worker = new Worker(config, rabbitMqClient);
    worker.start();
  }
}
