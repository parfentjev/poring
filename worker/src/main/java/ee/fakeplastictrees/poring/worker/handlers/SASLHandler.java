package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.WorkerEvent;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqConsumer;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqEventPublisher;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class SASLHandler extends AbstractHandler {
  private final String username;
  private final String password;
  private final Runnable onSuccess;
  private final List<RabbitMqConsumer<AdapterEvent>> consumers = new ArrayList<>();

  public SASLHandler(
      RabbitMqClient rabbitMqClient,
      RabbitMqEventPublisher<WorkerEvent> eventPublisher,
      String username,
      String password,
      Runnable onSuccess) {
    super(rabbitMqClient, eventPublisher);

    this.username = username;
    this.password = password;
    this.onSuccess = onSuccess;
  }

  public void start() {
    consumers.add(declareConsumer("CAP", this::capConsumer));
    send("CAP REQ :sasl");
  }

  private void capConsumer(AdapterEvent event) {
    var saslAcknowledged =
        event.getIrcMessage().getParams().size() == 2
            && event.getIrcMessage().getParams().getLast().equals("ACK")
            && event.getIrcMessage().getText().equals("sasl");

    if (saslAcknowledged) {
      consumers.add(declareConsumer("AUTHENTICATE", this::authConsumer));
      send("AUTHENTICATE PLAIN");
    } else {
      resetAuthenticationFlow();
    }
  }

  private void authConsumer(AdapterEvent event) {
    var credentialsRequested =
        !event.getIrcMessage().getParams().isEmpty()
            && event.getIrcMessage().getParams().getFirst().equals("+");

    if (credentialsRequested) {
      consumers.add(declareConsumer("903", this::successConsumer));

      var credentials = String.format("%c%s%c%s", '\0', username, '\0', password);
      var encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
      send("AUTHENTICATE {}", encodedCredentials);
    } else {
      resetAuthenticationFlow();
    }
  }

  private void successConsumer(AdapterEvent event) {
    onSuccess.run();
    resetAuthenticationFlow();
  }

  private void resetAuthenticationFlow() {
    consumers.forEach(RabbitMqConsumer::cancel);
  }
}
