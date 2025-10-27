package ee.fakeplastictrees.poring.shared.config;

public class WorkerConfig extends AbstractConfig<WorkerConfig> {
  private final String nickname = getString("IRC_NICKNAME", true);
  private final String channels = getString("IRC_CHANNELS", false);
  private final Boolean saslEnabled = getBoolean("IRC_SASL_ENABLED", false);
  private final String saslUsername = getString("IRC_SASL_USERNAME", false);
  private final String saslPassword = getString("IRC_SASL_PASSWORD", false);

  WorkerConfig() {}

  public String getNickname() {
    return nickname;
  }

  public String[] getChannels() {
    if (channels == null) {
      return new String[] {};
    }

    return channels.split(",");
  }

  public Boolean getSaslEnabled() {
    return saslEnabled;
  }

  public String getSaslUsername() {
    return saslUsername;
  }

  public String getSaslPassword() {
    return saslPassword;
  }
}
