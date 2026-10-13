package com.example.Backend.service;

/**
 * JwtService — Serviço de geração e validação de tokens JWT.
 * ✅ SEGURANÇA: Access token (30min) + Refresh token (7 dias)
 */
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service // Serviço para manipulação de JWT (tokens)
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}") // Default secret key (512-bit)
    private String secretKeyString; // chave secreta padrão

    @Value("${jwt.refresh-secret}") // Refresh secret (512-bit)
    private String refreshSecretString; // chave secreta para refresh token

    // Compatibilidade temporária: aceita tokens antigos (chave legada) durante migração.
    @Value("${jwt.legacy-secret:}")
    private String legacySecretKeyString;

    @Value("${jwt.legacy-refresh-secret:}")
    private String legacyRefreshSecretString;
    
    // ✅ 30 minutos para access token (curta duração)
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30;
    
    // ✅ 7 dias para refresh token (longa duração)
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7;

    // ✅ Diagnóstico de chaves JWT no startup
    @PostConstruct
    public void logKeyDiagnostics() {
        int accessBits = estimateConfiguredBits(secretKeyString);
        int refreshBits = estimateConfiguredBits(refreshSecretString);
        int legacyAccessBits = estimateConfiguredBits(legacySecretKeyString);
        int legacyRefreshBits = estimateConfiguredBits(legacyRefreshSecretString);

        log.info("=== JWT KEY DIAGNOSTICS ===");
        log.info("ACCESS  secret length : {} chars ~ {} bits ({}) — {}",
            safeLength(secretKeyString), accessBits, detectEncoding(secretKeyString),
            accessBits >= 512 ? "✅ OK (512-bit)" : "❌ INVÁLIDO (< 512-bit)");
        log.info("REFRESH secret length : {} chars ~ {} bits ({}) — {}",
            safeLength(refreshSecretString), refreshBits, detectEncoding(refreshSecretString),
            refreshBits >= 512 ? "✅ OK (512-bit)" : "❌ INVÁLIDO (< 512-bit)");
        log.info("LEGACY ACCESS  secret length : {} chars ~ {} bits ({})",
            safeLength(legacySecretKeyString), legacyAccessBits, detectEncoding(legacySecretKeyString));
        log.info("LEGACY REFRESH secret length : {} chars ~ {} bits ({})",
            safeLength(legacyRefreshSecretString), legacyRefreshBits, detectEncoding(legacyRefreshSecretString));

        log.info("===========================" );
    }

    // ✅ Gera Access Token (30 minutos)
    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessToken(new HashMap<>(), userDetails);
    }

    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return generateTokenWithKey(extraClaims, userDetails, getSignInKey(), ACCESS_TOKEN_EXPIRATION);
    }

    // ✅ Gera Refresh Token (7 dias)
    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(new HashMap<>(), userDetails);
    }

    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return generateTokenWithKey(extraClaims, userDetails, getRefreshSignInKey(), REFRESH_TOKEN_EXPIRATION);
    }

    // ✅ Método genérico para gerar tokens
    private String generateTokenWithKey(Map<String, Object> extraClaims, UserDetails userDetails, 
                                       SecretKey key, long expirationTime) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    // ✅ Manter compatibilidade com código antigo (usar access token por padrão)
    @Deprecated
    public String generateToken(UserDetails userDetails) {
        return generateAccessToken(userDetails);
    }

    @Deprecated
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return generateAccessToken(extraClaims, userDetails);
    }
    // Valida se o token é válido para o usuário
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    // Extrai todas as claims do token
    private Claims extractAllClaims(String token) {
        return parseClaimsWithFallback(token, getSignInKey(), getLegacySignInKey());
    }

    // Obtém a chave secreta para assinatura do token de acesso
    private SecretKey getSignInKey() {
        return decodeSecretKey(secretKeyString);
    }

    // ✅ Obtém a chave secreta para assinatura do refresh token
    private SecretKey getRefreshSignInKey() {
        return decodeSecretKey(refreshSecretString);
    }

    private SecretKey getLegacySignInKey() {
        return decodeOptionalSecretKey(legacySecretKeyString);
    }

    private SecretKey getLegacyRefreshSignInKey() {
        return decodeOptionalSecretKey(legacyRefreshSecretString);
    }

    // ✅ Valida refresh token com chave específica
    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsernameFromRefreshToken(token);
            return (username.equals(userDetails.getUsername())) && !isRefreshTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // ✅ Extrai username do refresh token
    public String extractUsernameFromRefreshToken(String token) {
        return extractClaimFromRefreshToken(token, Claims::getSubject);
    }

    // ✅ Extrai claim do refresh token
    public <T> T extractClaimFromRefreshToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaimsFromRefreshToken(token);
        return claimsResolver.apply(claims);
    }

    // ✅ Valida se refresh token está expirado
    private boolean isRefreshTokenExpired(String token) {
        return extractRefreshTokenExpiration(token).before(new Date());
    }

    // ✅ Extrai data de expiração do refresh token
    private Date extractRefreshTokenExpiration(String token) {
        return extractClaimFromRefreshToken(token, Claims::getExpiration);
    }

    // ✅ Extrai todas as claims do refresh token
    private Claims extractAllClaimsFromRefreshToken(String token) {
        return parseClaimsWithFallback(token, getRefreshSignInKey(), getLegacyRefreshSignInKey());
    }

    private Claims parseClaimsWithFallback(String token, SecretKey primaryKey, SecretKey fallbackKey) {
        try {
            return Jwts.parser()
                    .verifyWith(primaryKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception primaryEx) {
            if (fallbackKey == null) {
                throw primaryEx;
            }
            return Jwts.parser()
                    .verifyWith(fallbackKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }
    }

    private SecretKey decodeOptionalSecretKey(String configuredValue) {
        String raw = configuredValue == null ? "" : configuredValue.trim();
        if (raw.isEmpty()) {
            return null;
        }
        return decodeSecretKey(raw);
    }

   private SecretKey decodeSecretKey(String configuredValue) {
    String raw = configuredValue == null ? "" : configuredValue.trim();
    byte[] keyBytes = isHex(raw) ? hexToBytes(raw) : Decoders.BASE64.decode(raw);
    return Keys.hmacShaKeyFor(keyBytes);
}

// Decodificação hex manual (Decoders.HEX não existe no jjwt)
private byte[] hexToBytes(String hex) {
    int len = hex.length();
    byte[] data = new byte[len / 2];
    for (int i = 0; i < len; i += 2) {
        data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                             + Character.digit(hex.charAt(i + 1), 16));
    }
    return data;
}

    private boolean isHex(String value) {
        return value != null && value.matches("^[0-9a-fA-F]+$") && value.length() % 2 == 0;
    }

    private String detectEncoding(String value) {
        if (value == null || value.isBlank()) return "empty";
        return isHex(value.trim()) ? "hex" : "base64";
    }

    private int estimateConfiguredBits(String value) {
        if (value == null || value.isBlank()) return 0;
        String raw = value.trim();
        if (isHex(raw)) {
            return raw.length() * 4;
        }
        return raw.length() * 6;
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }

    private String safePrefix(String value) {
        if (value == null || value.isBlank()) return "empty";
        String raw = value.trim();
        return raw.substring(0, Math.min(8, raw.length()));
    }
}