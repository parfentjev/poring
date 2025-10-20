package ee.fakeplastictrees.poring.adapter;

import java.util.List;

public record MessageDto(String prefix, String command, List<String> params, String text) {

}
