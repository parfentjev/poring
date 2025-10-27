package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.EventFactory;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqConsumer;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqEventPublisher;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqTopology;
import java.util.function.Consumer;
import org.apache.logging.log4j.message.ParameterizedMessage;

public abstract class AbstractHandler {
  protected final RabbitMqClient rabbitMqClient;
  protected final RabbitMqEventPublisher<WorkerEvent> eventPublisher;

  protected AbstractHandler(
      RabbitMqClient rabbitMqClient, RabbitMqEventPublisher<WorkerEvent> eventPublisher) {
    this.rabbitMqClient = rabbitMqClient;
    this.eventPublisher = eventPublisher;
  }

  protected RabbitMqConsumer<AdapterEvent> declareConsumer(
      String command, Consumer<AdapterEvent> consumer) {
    var exchangeConsumer =
        rabbitMqClient.getExchangeConsumer(
            RabbitMqTopology.EXCHANGE_IRC_MESSAGES.getName(), command, AdapterEvent.class);
    exchangeConsumer.startExchangeConsumer(consumer);

    return exchangeConsumer;
  }

  protected void send(String message, Object... args) {
    send(new ParameterizedMessage(message, args).getFormattedMessage());
  }

  protected void send(String message) {
    eventPublisher.publish(EventFactory.workerEvent(message));
  }
}
