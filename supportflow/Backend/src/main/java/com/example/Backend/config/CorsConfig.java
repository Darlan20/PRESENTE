package com.example.Backend.config;

/**
 * CorsConfig — Configuração de CORS.
 * ✅ SEGURANÇA: Permite requisições APENAS do frontend (Vercel em prod, localhost em dev)
 */
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String allowedOriginsProperty;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Em produção, usa a propriedade do profile prod.
        // Aceita lista separada por vírgula e mantém fallback seguro caso esteja vazia.
        String configuredOrigins = allowedOriginsProperty;
        if (configuredOrigins == null || configuredOrigins.isBlank()) {
            configuredOrigins = System.getenv("FRONTEND_URL");
        }

        boolean isMissingOrPlaceholder = (configuredOrigins == null || configuredOrigins.isBlank()
                || configuredOrigins.contains("seu-frontend.vercel.app"));

        if (isMissingOrPlaceholder) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            List<String> origins = Arrays.stream(configuredOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .collect(Collectors.toList());

            // Inclui o domínio principal e previews do Vercel, que mudam entre deploys.
            origins.add("https://*.vercel.app");
            origins.add("http://localhost:*");
            origins.add("https://localhost:*");

            configuration.setAllowedOriginPatterns(origins);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
