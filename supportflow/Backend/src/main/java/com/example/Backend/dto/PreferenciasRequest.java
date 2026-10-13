package com.example.Backend.dto;

/**
 * PreferenciasRequest — DTO para requisição de atualização de preferências do usuário.
 */
public class PreferenciasRequest {
    private Boolean notifEmail;
    private Boolean notifSistema;
    private Boolean notifChamados;
    private String idioma;
    private String tema;
    
    public PreferenciasRequest() {}
    
    public PreferenciasRequest(Boolean notifEmail, Boolean notifSistema, Boolean notifChamados, 
                              String idioma, String tema) {
        this.notifEmail = notifEmail;
        this.notifSistema = notifSistema;
        this.notifChamados = notifChamados;
        this.idioma = idioma;
        this.tema = tema;
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
}
