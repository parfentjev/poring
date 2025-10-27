package ee.fakeplastictrees.poring.worker;

import ee.fakeplastictrees.poring.shared.config.WorkerConfig;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqEventPublisher;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;
import ee.fakeplastictrees.poring.worker.handlers.ConnectionHandler;

public class Worker {
  private final WorkerConfig config;
  private final RabbitMqClient rabbitMqClient;
  private final RabbitMqEventPublisher<WorkerEvent> eventPublisher;

  public Worker(WorkerConfig config, RabbitMqClient rabbitMqClient) {
    this.config = config;
    this.rabbitMqClient = rabbitMqClient;
    this.eventPublisher =
        rabbitMqClient.getPublisher(null, RabbitMqTopology.QUEUE_TO_ADAPTER.getName());
  }

  public void start() {
    new ConnectionHandler(config, rabbitMqClient, eventPublisher).start();
  }
}
