package com.example.Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            // FIX: HandshakeInterceptor copia o token JWT do parâmetro de query
            // para os atributos da sessão WebSocket.
            //
            // Por quê isso resolve o 401 na reabertura?
            // SockJS realiza o upgrade HTTP → WebSocket usando a sessão HTTP existente.
            // Quando o ChatPanel fecha e abre novamente, o Spring Security pode ter
            // invalidado essa sessão (proteção de session fixation por padrão).
            // Com backends JWT (stateless), o token chega como query param:
            //   /ws?token=eyJ...
            // e o interceptor o repassa para o canal STOMP, onde o
            // ChannelInterceptor (se configurado no SecurityConfig) pode validá-lo.
            //
            // Se o backend ainda usa sessão HTTP (cookie-based), este interceptor
            // é inofensivo — a sessão existente é usada normalmente.
            .addInterceptors(new HandshakeInterceptor() {
                @Override
                public boolean beforeHandshake(
                        ServerHttpRequest request,
                        ServerHttpResponse response,
                        WebSocketHandler wsHandler,
                        Map<String, Object> attributes) {

                    if (request instanceof ServletServerHttpRequest servletRequest) {
                        String token = servletRequest
                                .getServletRequest()
                                .getParameter("token");
                        if (token != null && !token.isBlank()) {
                            // Disponibiliza o token para o ChannelInterceptor no SecurityConfig
                            attributes.put("token", token);
                        }
                    }
                    return true; // sempre permite o handshake; autenticação é feita depois
                }

                @Override
                public void afterHandshake(
                        ServerHttpRequest request,
                        ServerHttpResponse response,
                        WebSocketHandler wsHandler,
                        Exception exception) {
                    // nada necessário aqui
                }
            })
            .withSockJS();
    }
}