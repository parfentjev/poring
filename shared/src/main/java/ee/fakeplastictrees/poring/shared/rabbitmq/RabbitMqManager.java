package ee.fakeplastictrees.poring.shared.rabbitmq;

import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Channel;
import ee.fakeplastictrees.poring.shared.rabbitmq.exception.RabbitMqManagerConnectionException;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.rabbitmq.client.Connection;

public class RabbitMqManager {
    private final Logger logger = LogManager.getLogger();

    private final String host;
    private final int port;
    private final String username;
    private final String password;

    private Connection connection;
    private Channel channel;

    public RabbitMqManager(String host, int port, String username, String password) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    public void connect() throws RabbitMqManagerConnectionException {
        var factory = new ConnectionFactory();
        factory.setHost(host);
        factory.setPort(port);
        factory.setUsername(username);
        factory.setPassword(password);

        try {
            connection = factory.newConnection();
            channel = connection.createChannel();

            logger.info("connected to rabbitmq");
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("Failed to connect.", e);
        }
    }

    public void disconnect() throws RabbitMqManagerConnectionException {
        try {
            channel.close();
            connection.close();

            logger.info("disconnected from rabbitmq");
        } catch (IOException | TimeoutException e) {
            throw new RabbitMqManagerConnectionException("Failed to close connection.", e);
        }
    }
}
