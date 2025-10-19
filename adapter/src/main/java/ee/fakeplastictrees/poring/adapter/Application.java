package ee.fakeplastictrees.poring.adapter;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import ee.fakeplastictrees.poring.shared.config.ApplicationConfig;

public class Application {
    private static Logger logger = LogManager.getLogger();

    public static void main(String[] args) {
        logger.info("starting adapter");

        var config = new ApplicationConfig();
        System.out.println(config.getRabbitMq().getHost());
    }
}
