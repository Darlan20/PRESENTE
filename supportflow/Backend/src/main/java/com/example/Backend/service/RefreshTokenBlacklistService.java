package com.example.Backend.service;

/**
 * RefreshTokenBlacklistService — Gerencia tokens invalidados (logout-all).
 * Mantém um cache em memória de tokens revogados com validade.
 */
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RefreshTokenBlacklistService {
    
    // Token -> expiração (remove tokens expirados ao consultar)
    private final Map<String, LocalDateTime> blacklist = new ConcurrentHashMap<>();
    
    /**
     * Adiciona um token à blacklist
     */
    public void addToBlacklist(String token, LocalDateTime expiresAt) {
        if (token != null && !token.isBlank()) {
            blacklist.put(token, expiresAt);
        }
    }
    
    /**
     * Verifica se um token está na blacklist (e não expirou ainda)
     */
    public boolean isBlacklisted(String token) {
        if (token == null || !blacklist.containsKey(token)) {
            return false;
        }
        
        LocalDateTime expiresAt = blacklist.get(token);
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) {
            // Token expirou, remover da blacklist
            blacklist.remove(token);
            return false;
        }
        
        return true;
    }
    
    /**
     * Revoga todos os refresh tokens de um usuário
     * Para simplificar, mantemos um registro por usuário
     */
    private final Map<Long, LocalDateTime> userLogoutTimes = new ConcurrentHashMap<>();
    
    /**
     * Registra logout de todos os tokens do usuário
     */
    public void revokeAllUserTokens(Long userId) {
        userLogoutTimes.put(userId, LocalDateTime.now());
    }
    
    /**
     * Verifica se um token foi gerado antes do logout-all
     */
    public boolean isTokenRevokedByLogoutAll(Long userId, LocalDateTime tokenIssuedAt) {
        LocalDateTime logoutTime = userLogoutTimes.get(userId);
        if (logoutTime == null) {
            return false;
        }
        // Token é inválido se foi emitido ANTES do logout-all
        return tokenIssuedAt.isBefore(logoutTime);
    }
    
    /**
     * Limpa tokens expirados da blacklist (housekeeping)
     */
    public void cleanupExpiredTokens() {
        blacklist.entrySet().removeIf(entry -> 
            entry.getValue() != null && LocalDateTime.now().isAfter(entry.getValue())
        );
    }
}
