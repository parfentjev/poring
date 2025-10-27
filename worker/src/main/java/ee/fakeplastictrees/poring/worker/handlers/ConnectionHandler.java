package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.config.WorkerConfig;
import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.ConnectionState;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqEventPublisher;

public class ConnectionHandler extends AbstractHandler {
  private final WorkerConfig config;

  public ConnectionHandler(
      WorkerConfig config,
      RabbitMqClient rabbitMqClient,
      RabbitMqEventPublisher<WorkerEvent> eventPublisher) {
    super(rabbitMqClient, eventPublisher);

    this.config = config;
  }

  public void start() {
    declareConsumer("PORING", this::handlePoringCommand);
  }

  private void handlePoringCommand(AdapterEvent event) {
    if (event.connectionState() == ConnectionState.CONNECTING) {
      if (config.getSaslEnabled()) {
        new SASLHandler(
                rabbitMqClient,
                eventPublisher,
                config.getSaslUsername(),
                config.getSaslPassword(),
                this::joinChannels)
            .start();
      } else {
        // todo
      }

      send("NICK {}", config.getNickname());
      send("USER poring 0 0 :https://codeberg.org/parfentjev/poring");
    }
  }

  private void joinChannels() {
    for (var channel : config.getChannels()) {
      send("JOIN {}", channel);
    }
  }
}
