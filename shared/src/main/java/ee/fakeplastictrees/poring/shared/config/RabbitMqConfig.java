package ee.fakeplastictrees.poring.shared.config;

public class RabbitMqConfig extends AbstractConfig<RabbitMqConfig> {
    private final String host = getString("RABBITMQ_HOST");
    private final Integer port = getInteger("RABBITMQ_PORT");
    private final String username = getString("RABBITMQ_USERNAME");
    private final String password = getString("RABBITMQ_PASSWORD");

    RabbitMqConfig() {
        validateConfig(this);
    }

    public String getHost() {
        return host;
    }

    public Integer getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}
