package com.example.Backend.model;

/**
 * Usuario — Entidade JPA que representa um usuário do sistema.
 * Campos: id, nome, email, senha, tipo (USUARIO, TECNICO, GESTOR), fotoUrl, resetToken, tokenExpiration.
 */
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String email;
    private String senha;
    private String tipo; // "USUARIO", "TECNICO", "GESTOR"
    // Para técnicos: setor (fila) que atende. Ex.: "Infraestrutura", "Service Desk".
    // Pode ficar nulo/blank caso não esteja configurado.
    private String setorAtendimento;
    private String fotoUrl; // URL da foto de perfil
    private String resetToken; // Token para recuperação de senha
    private LocalDateTime tokenExpiration; // Data de expiração do token
    
    public Usuario() {}
    
    public Usuario(Long id, String nome, String email, String senha, String tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.tipo = tipo;
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
    
    public String getSenha() {
        return senha;
    }
    
    public void setSenha(String senha) {
        this.senha = senha;
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

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public LocalDateTime getTokenExpiration() {
        return tokenExpiration;
    }

    public void setTokenExpiration(LocalDateTime tokenExpiration) {
        this.tokenExpiration = tokenExpiration;
    }
}