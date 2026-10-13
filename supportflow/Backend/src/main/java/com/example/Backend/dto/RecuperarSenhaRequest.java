package com.example.Backend.dto;

/**
 * RecuperarSenhaRequest — DTO para requisição de recuperação de senha.
 * Contém apenas o email para gerar token de reset.
 */
public class RecuperarSenhaRequest {
    private String email;
    
    public RecuperarSenhaRequest() {}
    
    public RecuperarSenhaRequest(String email) {
        this.email = email;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
