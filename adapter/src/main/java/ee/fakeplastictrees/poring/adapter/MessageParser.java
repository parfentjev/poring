package ee.fakeplastictrees.poring.adapter;

import java.util.ArrayList;
import java.util.Arrays;

public class MessageParser {
    public static MessageDto parse(String message) {
        var tokens = message.trim().split(" ");
        var cursor = 0;
        var params = new ArrayList<String>();

        String prefix = null;
        String command = null;
        String text = null;

        if (tokens[0].startsWith(":")) {
            prefix = tokens[cursor++].substring(1);
        }

        command = tokens[cursor++];

        for (; cursor < tokens.length; cursor++) {
            var token = tokens[cursor];

            if (token.startsWith(":")) {
                var textTokens = Arrays.copyOfRange(tokens, cursor, tokens.length);
                text = String.join(" ", textTokens).substring(1);

                break;
            }

            params.add(token);
        }

        return new MessageDto(prefix, command, params, text);
    }
}
