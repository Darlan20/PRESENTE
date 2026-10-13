package com.example.Backend.model;

/**
 * UsuarioPreferencias — Entidade JPA para armazenar preferências do usuário.
 * Campos: notificações por email, notificações do sistema, atualizações de chamados, idioma.
 */
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_preferencias")
public class UsuarioPreferencias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true, nullable = false)
    private Usuario usuario;
    
    private Boolean notifEmail = true;      // Notificações por e-mail
    private Boolean notifSistema = true;    // Notificações do sistema
    private Boolean notifChamados = true;   // Atualizações de chamados
    private String idioma = "pt-BR";        // Idioma da interface
    private String tema = "light";          // Tema: light ou dark
    
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    
    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Boolean getNotifEmail() {
        return notifEmail;
    }
    
    public void setNotifEmail(Boolean notifEmail) {
        this.notifEmail = notifEmail;
    }
    
    public Boolean getNotifSistema() {
        return notifSistema;
    }
    
    public void setNotifSistema(Boolean notifSistema) {
        this.notifSistema = notifSistema;
    }
    
    public Boolean getNotifChamados() {
        return notifChamados;
    }
    
    public void setNotifChamados(Boolean notifChamados) {
        this.notifChamados = notifChamados;
    }
    
    public String getIdioma() {
        return idioma;
    }
    
    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }
    
    public String getTema() {
        return tema;
    }
    
    public void setTema(String tema) {
        this.tema = tema;
    }
    
    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
    
    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
    
    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
    
    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
