package ee.fakeplastictrees.poring.shared.model;

import java.util.List;

public record ServerMessage(String prefix, String command, List<String> params, String text) {}
