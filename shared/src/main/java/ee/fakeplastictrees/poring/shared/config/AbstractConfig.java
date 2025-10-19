package ee.fakeplastictrees.poring.shared.config;

import java.lang.reflect.Field;
import java.text.MessageFormat;

public abstract class AbstractConfig<T extends AbstractConfig<T>> {
    protected String getString(String key) {
        return System.getenv(key);
    }

    protected Integer getInteger(String key) {
        var stringValue = System.getenv(key);
        if (stringValue == null || stringValue.isBlank()) {
            return null;
        }

        return Integer.parseInt(stringValue);
    }

    protected void validateConfig(T config) {
        for (var field : config.getClass().getDeclaredFields()) {
            if (isFieldNull(config, field)) {
                var message = "undefined field {0} in {1}";
                var fieldName = field.getName();
                var className = config.getClass().getSimpleName();

                throw new ConfigException(MessageFormat.format(message, fieldName, className));
            }
        }
    }

    private boolean isFieldNull(T config, Field field) {
        try {
            field.setAccessible(true);

            return field.get(config) == null;
        } catch (IllegalArgumentException | IllegalAccessException e) {
            return true;
        }
    }
}
