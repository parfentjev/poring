package ee.fakeplastictrees.poring.worker;

import ee.fakeplastictrees.poring.shared.config.worker.WorkerConfig;
import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.worker.handlers.AuthenticationHandler;
import ee.fakeplastictrees.poring.worker.handlers.EventHandler;
import ee.fakeplastictrees.poring.worker.rabbitmq.EventConsumer;
import ee.fakeplastictrees.poring.worker.rabbitmq.EventPublisher;
import java.util.LinkedList;

public class Worker {
  private final WorkerConfig config;
  private final EventConsumer consumer;
  private final EventPublisher publisher;
  private final LinkedList<EventHandler> handlers;

  public Worker(WorkerConfig config, RabbitMqClient rabbitMqClient) {
    this.config = config;
    this.consumer = new EventConsumer(rabbitMqClient);
    this.publisher = new EventPublisher(rabbitMqClient);
    this.handlers = new LinkedList<>();
  }

  public void start() {
    registerHandler(
        new AuthenticationHandler(publisher, config.getUserConfig(), config.getSaslConfig()));

    consumer.start(this::consume);
  }

  private void consume(String command, AdapterEvent event) {
    handlers.stream()
        .filter(handler -> handler.getExpectedCommands().contains(command))
        .forEach(handler -> handler.handle(command, event));
  }

  private void registerHandler(EventHandler handler) {
    handlers.add(handler);
  }
}
