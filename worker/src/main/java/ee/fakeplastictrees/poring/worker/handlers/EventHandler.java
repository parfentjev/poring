package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.EventFactory;
import ee.fakeplastictrees.poring.worker.rabbitmq.EventPublisher;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import org.apache.logging.log4j.message.ParameterizedMessage;

public abstract class EventHandler {
  private final EventPublisher publisher;
  private final Map<String, Consumer<AdapterEvent>> consumers;

  protected EventHandler(EventPublisher publisher) {
    this.publisher = publisher;
    this.consumers = new HashMap<>();
  }

  protected void on(String command, Consumer<AdapterEvent> consumer) {
    consumers.put(command, consumer);
  }

  public Set<String> getExpectedCommands() {
    return consumers.keySet();
  }

  public void handle(String command, AdapterEvent event) {
    var consumer = consumers.get(command);
    if (consumer != null) {
      consumer.accept(event);
    }
  }

  protected void publish(String message, Object... args) {
    if (args.length > 0) {
      message = new ParameterizedMessage(message, args).getFormattedMessage();
    }

    publisher.publish(EventFactory.workerEvent(message));
  }
}
