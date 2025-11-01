package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.config.worker.SASLConfig;
import ee.fakeplastictrees.poring.shared.config.worker.UserConfig;
import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.models.ConnectionState;
import ee.fakeplastictrees.poring.worker.rabbitmq.EventPublisher;
import java.util.Base64;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class AuthenticationHandler extends EventHandler {
  private final Logger logger = LogManager.getLogger(AuthenticationHandler.class);

  private final UserConfig userConfig;
  private final SASLConfig saslConfig;

  public AuthenticationHandler(
      EventPublisher publisher, UserConfig userConfig, SASLConfig saslConfig) {
    super(publisher);

    this.userConfig = userConfig;
    this.saslConfig = saslConfig;

    on("PORING", this::connectionHandler);
  }

  private void connectionHandler(AdapterEvent event) {
    if (event.getConnectionState() == ConnectionState.CONNECTING) {
      startAuthentication();
    }
  }

  private void startAuthentication() {
    if (saslConfig.getSaslEnabled()) {
      on("CAP", this::capConsumer);
      publish("CAP REQ :sasl");
    }

    publish("NICK {}", userConfig.getNickname());
    publish("USER poring 0 0 :https://codeberg.org/parfentjev/poring");
    if (!saslConfig.getSaslEnabled()) {
      joinChannels();
    }
  }

  private void capConsumer(AdapterEvent event) {
    var rawMessage = event.getIrcMessage().getRaw();
    if (!rawMessage.endsWith("CAP * ACK :sasl")) {
      logger.info("unexpected cap response: {}", rawMessage);
    }

    on("AUTHENTICATE", this::authConsumer);
    publish("AUTHENTICATE PLAIN");
  }

  private void authConsumer(AdapterEvent event) {
    var rawMessage = event.getIrcMessage().getRaw();
    if (!rawMessage.equals("AUTHENTICATE +")) {
      logger.info("unexpected auth response: {}", rawMessage);
    }

    on("903", this::successConsumer);

    var credentials =
        String.format(
            "%c%s%c%s", '\0', saslConfig.getSaslUsername(), '\0', saslConfig.getSaslPassword());
    var authString = Base64.getEncoder().encodeToString(credentials.getBytes());
    publish("AUTHENTICATE {}", authString);
  }

  private void successConsumer(AdapterEvent event) {
    publish("CAP END");
    joinChannels();
  }

  private void joinChannels() {
    for (var channel : userConfig.getChannels()) {
      publish("JOIN {}", channel);
    }
  }
}
