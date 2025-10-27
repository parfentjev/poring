package ee.fakeplastictrees.poring.shared.config;

public class AdapterConfig extends AbstractConfig<AdapterConfig> {
  private final String host = getString("IRC_HOST", true);
  private final Integer port = getInteger("IRC_PORT", true);

  AdapterConfig() {}

  public String getHost() {
    return host;
  }

  public Integer getPort() {
    return port;
  }
}
