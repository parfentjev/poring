package ee.fakeplastictrees.poring.shared.models;

import java.util.List;

public class IRCMessage {
  private final String prefix;
  private final String command;
  private final List<String> params;
  private final String text;
  private final String raw;

  public IRCMessage(String prefix, String command, List<String> params, String text, String raw) {
    this.prefix = prefix;
    this.command = command;
    this.params = params;
    this.text = text;
    this.raw = raw;
  }

  public String getPrefix() {
    return prefix;
  }

  public String getCommand() {
    return command;
  }

  public List<String> getParams() {
    return params;
  }

  public String getText() {
    return text;
  }

  public String getRaw() {
    return raw;
  }
}
