package ee.fakeplastictrees.poring.shared.config;

import java.util.Objects;
import java.util.Optional;

public class Config {
    private static Config instance;

    private final RabbitMq rabbitMq;

    private Config() {
        rabbitMq = new RabbitMq();
    }

    public static Config getInstance() {
        if (instance == null) {
            instance = new Config();
        }

        return instance;
    }

    public RabbitMq getRabbitMq() {
        return rabbitMq;
    }

    public class RabbitMq {
        public final String HOST;
        public final Integer PORT;
        public final String USERNAME;
        public final String PASSWORD;

        RabbitMq() {
            HOST = System.getenv("RABBITMQ_HOST");

            var portAsString = Optional.ofNullable(System.getenv("RABBITMQ_PORT")).orElse("5672");
            PORT = Integer.parseInt(portAsString);

            USERNAME = System.getenv("RABBITMQ_USERNAME");
            PASSWORD = System.getenv("RABBITMQ_PASSWORD");
        }

        public boolean isValid() {
            return Objects.nonNull(HOST) && Objects.nonNull(PORT) && Objects.nonNull(USERNAME)
                    && Objects.nonNull(PASSWORD);
        }
    }
}
