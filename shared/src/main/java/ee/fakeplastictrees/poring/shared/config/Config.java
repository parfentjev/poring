package ee.fakeplastictrees.poring.shared.config;

import java.lang.reflect.Field;
import java.text.MessageFormat;

public class Config {
    private static Config instance;

    private final Adapter adapter;
    private final Worker worker;
    private final RabbitMq rabbitMq;

    private Config() {
        adapter = new Adapter();
        worker = new Worker();
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

    public class Adapter {
        // todo
    }

    public class Worker {
        // todo
    }

    public class RabbitMq {
        public final String HOST = getString("RABBITMQ_HOST");
        public final Integer PORT = getInteger("RABBITMQ_PORT");
        public final String USERNAME = getString("RABBITMQ_USERNAME");
        public final String PASSWORD = getString("RABBITMQ_PASSWORD");

        RabbitMq() {
            validateConfig(this);
        }
    }

    protected String getString(String key) {
        return System.getenv(key);
    }

    protected Integer getInteger(String key) {
        var stringValue = System.getenv("RABBITMQ_PORT");
        if (stringValue == null || stringValue.isBlank()) {
            return null;
        }

        return Integer.parseInt(stringValue);
    }

    protected <T> void validateConfig(T config) {
        for (var field : config.getClass().getDeclaredFields()) {
            if (isFieldNull(config, field)) {
                var message = "undefined field {0} in {1}";
                var fieldName = field.getName();
                var className = config.getClass().getSimpleName();

                throw new ConfigException(MessageFormat.format(message, fieldName, className));
            }
        }
    }

    private <T> boolean isFieldNull(T config, Field field) {
        try {
            field.setAccessible(true);

            return field.get(config) == null;
        } catch (IllegalArgumentException | IllegalAccessException e) {
            return true;
        }
    }
}
