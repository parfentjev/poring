package ee.fakeplastictrees.poring.shared.config.worker;

import ee.fakeplastictrees.poring.shared.config.AbstractConfig;
import ee.fakeplastictrees.poring.shared.config.rabbitmq.RabbitMqConfig;

public class WorkerConfig extends AbstractConfig<WorkerConfig> {
  private final RabbitMqConfig rabbitMq = new RabbitMqConfig();
  private final UserConfig userConfig = new UserConfig();
  private final SASLConfig saslConfig = new SASLConfig();

  public WorkerConfig() {}

  public RabbitMqConfig getRabbitMq() {
    return rabbitMq;
  }

  public UserConfig getUserConfig() {
    return userConfig;
  }

  public SASLConfig getSaslConfig() {
    return saslConfig;
  }
}
