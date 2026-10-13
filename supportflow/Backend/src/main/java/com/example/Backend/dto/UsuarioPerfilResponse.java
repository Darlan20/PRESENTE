package com.example.Backend.dto;

/**
 * UsuarioPerfilResponse — DTO para resposta de perfil do usuário.
 * Retorna dados completos do perfil sem expor a senha.
 */
public class UsuarioPerfilResponse {
    private Long id;
    private String nome;
    private String email;
    private String tipo;
    private String fotoUrl;
    
    public UsuarioPerfilResponse() {}
    
    public UsuarioPerfilResponse(Long id, String nome, String email, String tipo, String fotoUrl) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.fotoUrl = fotoUrl;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public String getFotoUrl() {
        return fotoUrl;
    }
    
    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }
}
