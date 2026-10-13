package com.example.Backend.dto;

/**
 * UsuarioResponse — DTO de resposta com dados do usuário.
 * Retornado após login/registro (sem expor a senha).
 */
public class UsuarioResponse {
    private Long id;
    private String nome;
    private String email;
    private String tipo;
    private String setorAtendimento;
    
    public UsuarioResponse() {}
    
    public UsuarioResponse(Long id, String nome, String email, String tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
    }

    public UsuarioResponse(Long id, String nome, String email, String tipo, String setorAtendimento) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.setorAtendimento = setorAtendimento;
    }
    
    // Getters and Setters
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

    public String getSetorAtendimento() {
        return setorAtendimento;
    }

    public void setSetorAtendimento(String setorAtendimento) {
        this.setorAtendimento = setorAtendimento;
    }
}