package com.example.number_extractor;

import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.exporter.HTTPServer;
import io.prometheus.client.hotspot.DefaultExports;

public class MetricsServer {
    public static void start() throws Exception {
        DefaultExports.initialize();
        HTTPServer server = new HTTPServer(50054);
    }
}
