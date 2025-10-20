package ee.fakeplastictrees.poring.adapter;

import ee.fakeplastictrees.poring.shared.config.ApplicationConfig;

public class Application {
    public static void main(String[] args) throws AdapterConnectionException {
        var config = new ApplicationConfig();
        var adapter = new Adapter(config.getAdapter());
        adapter.connect();
    }
}
