package ee.fakeplastictrees.poring.shared.rabbitmq;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import ee.fakeplastictrees.poring.shared.config.RabbitMqConfig;

public class RabbitMqManager {
    private static final String QUEUE_TO_ADAPTER = "to_adapter";
    private static final String EXCHANGE_TO_WORKER = "to_worker";

    private RabbitMqConfig config;
    private Connection connection;
    private Channel channel;

    public RabbitMqManager(RabbitMqConfig config) {
        this.config = config;
    }

    public void connect() throws RabbitMqManagerConnectionException {
        var factory = new ConnectionFactory();
        factory.setHost(config.getHost());
        factory.setPort(config.getPort());
        factory.setUsername(config.getUsername());
        factory.setPassword(config.getPassword());

        try {
            connection = factory.newConnection();
            channel = connection.createChannel();
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("failed to connect", e);
        }

        setUp();
    }

    private void setUp() throws RabbitMqManagerConnectionException {
        try {
            channel.exchangeDeclare(EXCHANGE_TO_WORKER, "topic", false, false, null);
            channel.queueDeclare(QUEUE_TO_ADAPTER, false, false, false, null);
        } catch (IOException e) {
            throw new RabbitMqManagerConnectionException("failed to declare exchanges", null);
        }
    }

    public void disconnect() throws RabbitMqManagerConnectionException {
        try {
            channel.close();
            connection.close();
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("failed to close connection", e);
        }
    }
}
