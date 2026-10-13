package com.example.Backend.dto;

/**
 * ResetarSenhaRequest — DTO para requisição de reset de senha.
 * Contém o token de recuperação e a nova senha.
 */
public class ResetarSenhaRequest {
    private String token;
    private String novaSenha;
    
    public ResetarSenhaRequest() {}
    
    public ResetarSenhaRequest(String token, String novaSenha) {
        this.token = token;
        this.novaSenha = novaSenha;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNovaSenha() {
        return novaSenha;
    }
    
    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
}
