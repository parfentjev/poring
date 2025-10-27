package ee.fakeplastictrees.poring.shared.models;

import java.util.List;

public record IRCMessage(String prefix, String command, List<String> params, String text) {}
