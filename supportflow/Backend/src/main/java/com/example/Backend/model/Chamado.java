package com.example.Backend.model;

/**
 * Chamado — Entidade JPA que representa um ticket de suporte.
 * Campos: id, titulo, descricao, categoria, prioridade, status,
 *         solicitante (nome), email, setor, sala, andar, unidade,
 *         setorAtendimento, slaHoras, triagemJustificativa,
 *         tecnicoResponsavelId, tecnicoResponsavelNome,
 *         createdAt, updatedAt.
 */
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "chamado")
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private String categoria;

    private String prioridade; // baixa, média, alta, urgente

    private String status; // aberto, em-andamento, resolvido

    private String solicitante; // nome do solicitante

    private String email; // email do solicitante

    private String setor;

    private String bloco;

    private String sala;

    private String andar;

    private String unidade;

    private String setorAtendimento;

    // Técnico responsável (atribuição automática)
    private Long tecnicoResponsavelId;
    private String tecnicoResponsavelNome;

    private Integer slaHoras;

    @Column(columnDefinition = "TEXT")
    private String triagemJustificativa;

    // Rastreamento de template usado no formulário
    private String templateId;
    private Integer templateIndex;

    private String attachmentName;
    private String attachmentPath;
    private String attachmentContentType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    // Soft-delete / lixeira
    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    private boolean isDeleted = false;

    private LocalDateTime deletedAt;

    private String deletedBy; // email ou identificador do usuário que deletou

    private static final ZoneId TIME_ZONE = ZoneId.of("America/Sao_Paulo");

    public Chamado() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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

    public String getSetorAtendimento() { return setorAtendimento; }
    public void setSetorAtendimento(String setorAtendimento) { this.setorAtendimento = setorAtendimento; }

    public Long getTecnicoResponsavelId() { return tecnicoResponsavelId; }
    public void setTecnicoResponsavelId(Long tecnicoResponsavelId) { this.tecnicoResponsavelId = tecnicoResponsavelId; }

    public String getTecnicoResponsavelNome() { return tecnicoResponsavelNome; }
    public void setTecnicoResponsavelNome(String tecnicoResponsavelNome) { this.tecnicoResponsavelNome = tecnicoResponsavelNome; }

    public Integer getSlaHoras() { return slaHoras; }
    public void setSlaHoras(Integer slaHoras) { this.slaHoras = slaHoras; }

    public String getTriagemJustificativa() { return triagemJustificativa; }
    public void setTriagemJustificativa(String triagemJustificativa) { this.triagemJustificativa = triagemJustificativa; }

    public String getTemplateId() { return templateId; }
    public void setTemplateId(String templateId) { this.templateId = templateId; }

    public Integer getTemplateIndex() { return templateIndex; }
    public void setTemplateIndex(Integer templateIndex) { this.templateIndex = templateIndex; }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public String getAttachmentContentType() { return attachmentContentType; }
    public void setAttachmentContentType(String attachmentContentType) { this.attachmentContentType = attachmentContentType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now(TIME_ZONE);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now(TIME_ZONE);
    }
}
