package ee.fakeplastictrees.poring.worker.handlers;

import com.google.gson.JsonSyntaxException;
import ee.fakeplastictrees.poring.shared.models.AdapterEvent;
import ee.fakeplastictrees.poring.shared.utils.JsonParser;
import ee.fakeplastictrees.poring.worker.rabbitmq.EventPublisher;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class CeeksHandler extends EventHandler {
  public CeeksHandler(EventPublisher publisher) {
    super(publisher);

    on("PRIVMSG", this::handleMessage);
  }

  private void handleMessage(AdapterEvent event) {
    var text = event.getIrcMessage().getText();
    if (text.trim().equalsIgnoreCase("!ceeks")) {
      var response = fetchRaweCeek();
      var recipient = event.getIrcMessage().getParams().getFirst();

      if (response == null) {
        return;
      }

      var timeUntil =
          response.countdowns().stream().filter(c -> c.type().equals("CEEKS")).findFirst();

      if (timeUntil.isEmpty()) {
        logger.error("CEEKS not found in: {}", response);
        return;
      }

      publish(
          "PRIVMSG {} :{} begins in {} 🎉",
          recipient,
          response.summary(),
          timeUntil.get().value());
    }
  }

  private ResponseBody fetchRaweCeek() {
    try (var client = HttpClient.newHttpClient()) {
      var response =
          client.send(
              HttpRequest.newBuilder()
                  .uri(URI.create("https://www.raweceek.eu/api/next-session"))
                  .GET()
                  .build(),
              HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() != 200) {
        logger.error("raweceek returned {}", response.statusCode());
        return null;
      }

      return JsonParser.toObject(response.body(), ResponseBody.class);
    } catch (IOException | InterruptedException | JsonSyntaxException e) {
      logger.error("http request failed", e);
      return null;
    }
  }

  private record ResponseBody(
      String summary,
      String location,
      String startTime,
      Boolean thisWeek,
      List<Countdown> countdowns) {}

  private record Countdown(String type, String value) {}
}
