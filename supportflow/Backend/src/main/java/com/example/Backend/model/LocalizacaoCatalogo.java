package com.example.Backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "localizacao_catalogo")
public class LocalizacaoCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String setor;
    private String bloco;
    private String sala;

    public LocalizacaoCatalogo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSetor() { return setor; }
    public void setSetor(String setor) { this.setor = setor; }

    public String getBloco() { return bloco; }
    public void setBloco(String bloco) { this.bloco = bloco; }

    public String getSala() { return sala; }
    public void setSala(String sala) { this.sala = sala; }
}