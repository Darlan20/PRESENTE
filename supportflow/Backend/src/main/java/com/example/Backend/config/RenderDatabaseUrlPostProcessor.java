package com.example.Backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * RenderDatabaseUrlPostProcessor
 *
 * Render Blueprints (fromDatabase.connectionString) fornece URLs no formato:
 *   postgresql://user:password@host:port/database
 *
 * O Spring/JDBC espera algo como:
 *   jdbc:postgresql://host:port/database?sslmode=require
 *
 * Este post-processor converte automaticamente antes do DataSource/JPA iniciar.
 */
public class RenderDatabaseUrlPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(RenderDatabaseUrlPostProcessor.class);

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                // Preferir a URL do datasource já resolvida
                environment.getProperty("spring.datasource.url"),
                // Fallback: env vars comuns
                System.getenv("SPRING_DATASOURCE_URL"),
                System.getenv("DATABASE_URL")
        );

        if (isBlank(raw)) {
            return;
        }

        String trimmed = raw.trim();

        // Já está em formato JDBC
        if (trimmed.toLowerCase(Locale.ROOT).startsWith("jdbc:")) {
            return;
        }

        // Só tratar URLs estilo Render (postgres/postgresql)
        String lower = trimmed.toLowerCase(Locale.ROOT);
        if (!lower.startsWith("postgresql://") && !lower.startsWith("postgres://")) {
            return;
        }

        try {
            URI uri = URI.create(trimmed);

            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String db = uri.getPath();
            if (db != null && db.startsWith("/")) {
                db = db.substring(1);
            }

            if (isBlank(host) || isBlank(db)) {
                logger.warn("SPRING_DATASOURCE_URL/DATABASE_URL tem formato inesperado.");
                return;
            }

            // Querystring opcional (raramente presente). Garantir sslmode.
            String query = uri.getQuery();
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db;

            if (isBlank(query)) {
                jdbcUrl += "?sslmode=require";
            } else {
                String qLower = query.toLowerCase(Locale.ROOT);
                if (qLower.contains("sslmode=")) {
                    jdbcUrl += "?" + query;
                } else {
                    jdbcUrl += "?" + query + "&sslmode=require";
                }
            }

            String userInfo = uri.getUserInfo();
            String parsedUser = null;
            String parsedPass = null;
            if (!isBlank(userInfo)) {
                int idx = userInfo.indexOf(':');
                if (idx >= 0) {
                    parsedUser = userInfo.substring(0, idx);
                    parsedPass = userInfo.substring(idx + 1);
                } else {
                    parsedUser = userInfo;
                }
            }

            Map<String, Object> overrides = new HashMap<>();
            overrides.put("spring.datasource.url", jdbcUrl);
            overrides.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

            // Só sobrescrever username/password quando estão ausentes ou estão no fallback do H2.
            String currentUser = environment.getProperty("spring.datasource.username");
            String currentPass = environment.getProperty("spring.datasource.password");

            if ((isBlank(currentUser) || "sa".equalsIgnoreCase(currentUser)) && !isBlank(parsedUser)) {
                overrides.put("spring.datasource.username", parsedUser);
            }
            if (isBlank(currentPass) && !isBlank(parsedPass)) {
                overrides.put("spring.datasource.password", parsedPass);
            }

            environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseUrlOverrides", overrides));
            logger.info("Render DB URL detectada; convertida para JDBC (spring.datasource.url). Host={} Port={} Db={}", host, port, db);
        } catch (Exception ex) {
            logger.warn("Falha ao converter SPRING_DATASOURCE_URL/DATABASE_URL para JDBC: {}", ex.getMessage());
        }
    }

    @Override
    public int getOrder() {
        // Rodar cedo (antes dos auto-configs que criam DataSource/JPA)
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (!isBlank(v)) return v;
        }
        return null;
    }

    private static boolean isBlank(String v) {
        return v == null || v.trim().isEmpty();
    }
}
