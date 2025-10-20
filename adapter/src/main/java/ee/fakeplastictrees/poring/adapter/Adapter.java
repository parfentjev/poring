package ee.fakeplastictrees.poring.adapter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import javax.net.ssl.SSLSocketFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.message.ParameterizedMessage;
import ee.fakeplastictrees.poring.shared.config.AdapterConfig;

public class Adapter {
    private final Logger logger = LogManager.getLogger(Adapter.class);

    private final AdapterConfig config;

    private Socket socket;
    private BufferedReader reader;
    private PrintWriter writer;

    public Adapter(AdapterConfig config) {
        this.config = config;
    }

    public void connect() throws AdapterConnectionException {
        try {
            var socketFactory = SSLSocketFactory.getDefault();
            socket = socketFactory.createSocket(config.getHost(), config.getPort());
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            writer = new PrintWriter(socket.getOutputStream(), true);

            new Thread(this::listen, "listener").start();
        } catch (IOException | IllegalArgumentException e) {
            throw new AdapterConnectionException("failed to connect", e);
        }

        send("NICK {}", config.getNickname());
        send("USER poring 0 * :https://codeberg.org/parfentjev/poring");

        for (var channel : config.getChannels()) {
            send("JOIN {}", channel);
        }
    }

    private void listen() {
        try {
            for (String line; (line = reader.readLine()) != null;) {
                handle(line);
            }
        } catch (IOException e) {
            logger.info("socket reader closed");
        }

        logger.info("disconnected");
        // reconnect();
    }

    private void handle(String line) {
        logger.info("=> {}", line);

        var messageDto = MessageParser.parse(line);
        if (messageDto.command().equals("PING")) {
            send("PONG {}", messageDto.text());
        }
    }

    public void send(String message, Object... params) {
        send(new ParameterizedMessage(message, params).getFormattedMessage());
    }

    public void send(String message) {
        logger.info("<= {}", message);
        writer.println(message);
    }
}
