package ee.fakeplastictrees.poring.worker.handlers;

import ee.fakeplastictrees.poring.shared.config.worker.WorkerConfig;
import ee.fakeplastictrees.poring.shared.rabbitmq.RabbitMqClient;

public class HandlerConfiguration {
    private RabbitMqClient rabbitMqClient;
    private WorkerConfig workerConfig;
}
