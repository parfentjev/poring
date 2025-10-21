package ee.fakeplastictrees.poring.shared.config;

public class AdapterConfig extends AbstractConfig<AdapterConfig> {
  private final String host = getString("IRC_HOST", true);
  private final Integer port = getInteger("IRC_PORT", true);
  private final String nickname = getString("IRC_NICKNAME", true);
  private final String channels = getString("IRC_CHANNELS", false);

  AdapterConfig() {}

  public String getHost() {
    return host;
  }

  public Integer getPort() {
    return port;
  }

  public String getNickname() {
    return nickname;
  }

  public String[] getChannels() {
    if (channels == null) {
      return new String[] {};
    }

    return channels.split(",");
  }
}
