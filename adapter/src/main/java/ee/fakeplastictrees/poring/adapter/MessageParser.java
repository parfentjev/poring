package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.shared.models.IRCMessage;
import java.util.ArrayList;
import java.util.Arrays;

public class MessageParser {
  public static IRCMessage parse(String rawMessage) {
    var tokens = rawMessage.trim().split(" ");
    var cursor = 0;
    var params = new ArrayList<String>();

    String prefix = null;
    String text = null;

    if (tokens[0].startsWith(":")) {
      prefix = tokens[cursor++].substring(1);
    }

    var command = tokens[cursor++];

    for (; cursor < tokens.length; cursor++) {
      var token = tokens[cursor];

      if (token.startsWith(":")) {
        var textTokens = Arrays.copyOfRange(tokens, cursor, tokens.length);
        text = String.join(" ", textTokens).substring(1);

        break;
      }

      params.add(token);
    }

    return new IRCMessage(prefix, command, params, text, rawMessage);
  }
}
