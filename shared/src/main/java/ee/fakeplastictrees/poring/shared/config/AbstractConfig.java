package ee.fakeplastictrees.poring.shared.config;

public abstract class AbstractConfig<T extends AbstractConfig<T>> {
    protected String getString(String key, boolean required) {
        return getEnv(key, required);
    }

    protected Integer getInteger(String key, boolean required) {
        return Integer.parseInt(getEnv(key, required));
    }

    private String getEnv(String key, boolean required) {
        var value = System.getenv(key);
        if ((value == null || value.isBlank()) && required) {
            throw new ConfigException(key + "is undefined");
        }

        return value;
    }
}
