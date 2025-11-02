package ee.fakeplastictrees.poring.shared.utils;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

public class JsonParser {
  private static final Gson gson = new Gson();

  public static <T> String toJson(T body) {
    return gson.toJson(body);
  }

  public static <T> T toObject(String json, Class<T> tClass) throws JsonSyntaxException {
    return gson.fromJson(json, tClass);
  }
}
