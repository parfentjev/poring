package ee.fakeplastictrees.poring.shared.rabbitmq;

public enum RabbitMqTopology {
  EXCHANGE_IRC_MESSAGES("poring.irc.messages"),
  QUEUE_TO_ADAPTER("poring.to.adapter");

  private final String name;

  RabbitMqTopology(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }
}
