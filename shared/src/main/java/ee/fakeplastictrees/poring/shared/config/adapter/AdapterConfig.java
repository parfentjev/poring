package ee.fakeplastictrees.poring.shared.config.adapter;

import ee.fakeplastictrees.poring.shared.config.AbstractConfig;
import ee.fakeplastictrees.poring.shared.config.rabbitmq.RabbitMqConfig;

public class AdapterConfig extends AbstractConfig<AdapterConfig> {
  private final RabbitMqConfig rabbitMq = new RabbitMqConfig();
  private final String host = getString("IRC_HOST", true);
  private final Integer port = getInteger("IRC_PORT", true);

  public AdapterConfig() {}

  public RabbitMqConfig getRabbitMq() {
    return rabbitMq;
  }

  public String getHost() {
    return host;
  }

  public Integer getPort() {
    return port;
  }
}
