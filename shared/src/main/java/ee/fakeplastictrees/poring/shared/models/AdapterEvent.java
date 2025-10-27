package ee.fakeplastictrees.poring.shared.models;

public class AdapterEvent {
  private IRCMessage ircMessage;
  private ConnectionState connectionState;

  public IRCMessage getIrcMessage() {
    return ircMessage;
  }

  public void setIrcMessage(IRCMessage ircMessage) {
    this.ircMessage = ircMessage;
  }

  public ConnectionState getConnectionState() {
    return connectionState;
  }

  public void setConnectionState(ConnectionState connectionState) {
    this.connectionState = connectionState;
  }
}
