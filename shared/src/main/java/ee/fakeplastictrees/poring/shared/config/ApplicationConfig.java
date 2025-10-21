package ee.fakeplastictrees.poring.shared.config;

public class ApplicationConfig {
  private final AdapterConfig adapter;
  private final WorkerConfig worker;
  private final RabbitMqConfig rabbitMq;

  public ApplicationConfig() {
    adapter = new AdapterConfig();
    worker = new WorkerConfig();
    rabbitMq = new RabbitMqConfig();
  }

  public AdapterConfig getAdapter() {
    return adapter;
  }

  public WorkerConfig getWorker() {
    return worker;
  }

  public RabbitMqConfig getRabbitMq() {
    return rabbitMq;
  }
}
