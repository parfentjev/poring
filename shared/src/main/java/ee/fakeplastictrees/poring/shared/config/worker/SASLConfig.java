package ee.fakeplastictrees.poring.shared.config.worker;

import ee.fakeplastictrees.poring.shared.config.AbstractConfig;

public class SASLConfig extends AbstractConfig<SASLConfig> {
  private final Boolean saslEnabled = getBoolean("IRC_SASL_ENABLED", false);
  private final String saslUsername = getString("IRC_SASL_USERNAME", false);
  private final String saslPassword = getString("IRC_SASL_PASSWORD", false);

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
