package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.adapter.exceptions.AdapterConnectionException;
import ee.fakeplastictrees.poring.shared.config.adapter.AdapterConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.exceptions.RabbitMqClientConnectionException;

public class Application {
  static void main() throws RabbitMqClientConnectionException, AdapterConnectionException {
    var config = new AdapterConfig();

    var rabbitMqClient = new RabbitMqClient(config.getRabbitMq());
    rabbitMqClient.connect();

    var adapter = new Adapter(config, rabbitMqClient);
    adapter.start();
  }
}
