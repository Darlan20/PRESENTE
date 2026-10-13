package com.example.Backend.dto;

/**
 * TrocarSenhaRequest — DTO para requisição de troca de senha.
 * Contém a senha atual e a nova senha.
 */
public class TrocarSenhaRequest {
    private String senhaAtual;
    private String novaSenha;
    
    public TrocarSenhaRequest() {}
    
    public TrocarSenhaRequest(String senhaAtual, String novaSenha) {
        this.senhaAtual = senhaAtual;
        this.novaSenha = novaSenha;
    }
    
    public String getSenhaAtual() {
        return senhaAtual;
    }
    
    public void setSenhaAtual(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }
    
    public String getNovaSenha() {
        return novaSenha;
    }
    
    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
}
