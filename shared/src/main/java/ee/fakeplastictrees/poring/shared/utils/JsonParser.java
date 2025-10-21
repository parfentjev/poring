package ee.fakeplastictrees.poring.shared.utils;

import com.google.gson.Gson;

public class JsonParser {
  private static final Gson gson = new Gson();

  public static <T> String toJson(T body) {
    return gson.toJson(body);
  }

  public static <T> T toObject(String json, Class<T> tClass) {
    return gson.fromJson(json, tClass);
  }
}
