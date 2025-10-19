package ee.fakeplastictrees.poring.shared.rabbitmq;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import ee.fakeplastictrees.poring.shared.config.Config;
import ee.fakeplastictrees.poring.shared.rabbitmq.exception.RabbitMqManagerConnectionException;
import ee.fakeplastictrees.poring.shared.rabbitmq.exception.RabbitMqManagerException;

public class RabbitMqManager {
    private static final Logger LOGGER = LogManager.getLogger();

    private static final String QUEUE_TO_ADAPTER = "to_adapter";
    private static final String EXCHANGE_TO_WORKER = "to_worker";

    private Config.RabbitMq config;
    private Connection connection;
    private Channel channel;

    public RabbitMqManager(Config.RabbitMq config) {
        if (!config.isValid()) {
            throw new RabbitMqManagerException("config isn't valid");
        }

        this.config = config;
    }

    public void connect() throws RabbitMqManagerConnectionException {
        var factory = new ConnectionFactory();
        factory.setHost(config.HOST);
        factory.setPort(config.PORT);
        factory.setUsername(config.USERNAME);
        factory.setPassword(config.PASSWORD);

        try {
            connection = factory.newConnection();
            channel = connection.createChannel();

            LOGGER.info("connected to rabbitmq");
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("failed to connect", e);
        }

        setUp();
    }

    private void setUp() throws RabbitMqManagerConnectionException {
        try {
            channel.exchangeDeclare(EXCHANGE_TO_WORKER, "topic", false, false, null);
            channel.queueDeclare(QUEUE_TO_ADAPTER, false, false, false, null);

            LOGGER.info("declared exchange and queue");
        } catch (IOException e) {
            throw new RabbitMqManagerConnectionException("failed to declare exchanges", null);
        }
    }

    public void disconnect() throws RabbitMqManagerConnectionException {
        try {
            channel.close();
            connection.close();

            LOGGER.info("disconnected from rabbitmq");
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("failed to close connection", e);
        }
    }
}
