package ee.fakeplastictrees.poring.shared.config;

public class RabbitMqConfig extends AbstractConfig<RabbitMqConfig> {
    public final String HOST = getString("RABBITMQ_HOST");
    public final Integer PORT = getInteger("RABBITMQ_PORT");
    public final String USERNAME = getString("RABBITMQ_USERNAME");
    public final String PASSWORD = getString("RABBITMQ_PASSWORD");

    RabbitMqConfig() {
        validateConfig(this);
    }
}
