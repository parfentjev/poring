package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.adapter.exceptions.AdapterConnectionException;
import ee.fakeplastictrees.poring.shared.config.ApplicationConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqManager;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqManagerConnectionException;

public class Application {
  static void main() throws RabbitMqManagerConnectionException, AdapterConnectionException {
    var config = new ApplicationConfig();

    var rabbitMqManager = new RabbitMqManager(config.getRabbitMq());
    rabbitMqManager.connect();

    var adapter = new Adapter(config.getAdapter(), rabbitMqManager);
    adapter.run();
  }
}
