package com.example.Backend.dto;

/**
 * ChamadoCreateRequest — DTO para criar novo chamado
 * Inclui campos para rastreamento de template
 */
public class ChamadoCreateRequest {
    private String titulo;
    private String descricao;
    private String solicitante;
    private String email;
    private String setor;
    private String bloco;
    private String sala;
    private String andar;
    private String unidade;
    private String templateId;
    private Integer templateIndex;
    private String attachmentBase64;
    private String attachmentName;
    private String attachmentContentType;

    public ChamadoCreateRequest() {}

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getSolicitante() { return solicitante; }
    public void setSolicitante(String solicitante) { this.solicitante = solicitante; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSetor() { return setor; }
    public void setSetor(String setor) { this.setor = setor; }

    public String getBloco() { return bloco; }
    public void setBloco(String bloco) { this.bloco = bloco; }

    public String getSala() { return sala; }
    public void setSala(String sala) { this.sala = sala; }

    public String getAndar() { return andar; }
    public void setAndar(String andar) { this.andar = andar; }

    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }

    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }

    public Integer getTemplateIndex() { return templateIndex; }
    public void setTemplateIndex(Integer templateIndex) { this.templateIndex = templateIndex; }

    public String getAttachmentBase64() { return attachmentBase64; }
    public void setAttachmentBase64(String attachmentBase64) { this.attachmentBase64 = attachmentBase64; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentContentType() { return attachmentContentType; }
    public void setAttachmentContentType(String attachmentContentType) { this.attachmentContentType = attachmentContentType; }
}
