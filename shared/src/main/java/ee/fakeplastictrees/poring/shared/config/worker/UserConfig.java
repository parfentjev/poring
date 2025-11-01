package ee.fakeplastictrees.poring.shared.config.worker;

import ee.fakeplastictrees.poring.shared.config.AbstractConfig;

public class UserConfig extends AbstractConfig<UserConfig> {
  private final String nickname = getString("IRC_NICKNAME", true);
  private final String channels = getString("IRC_CHANNELS", false);

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
