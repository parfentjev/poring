package ee.fakeplastictrees.poring.shared.models;

public class EventFactory {
  public static AdapterEvent adapterEventIrcMessage(IRCMessage ircMessage) {
    var adapterEvent = new AdapterEvent();
    adapterEvent.setIrcMessage(ircMessage);

    return adapterEvent;
  }

  public static AdapterEvent adapterEventConnectionState(ConnectionState connectionState) {
    var adapterEvent = new AdapterEvent();
    adapterEvent.setConnectionState(connectionState);

    return adapterEvent;
  }

  public static WorkerEvent workerEvent(String message) {
    var workerEvent = new WorkerEvent();
    workerEvent.setIrcMessage(message);

    return workerEvent;
  }
}
