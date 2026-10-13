package com.example.Backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * RoundRobinEstadoSetor — guarda o último técnico atribuído por setorAtendimento
 * para permitir distribuição round-robin persistida.
 */
@Entity
@Table(
        name = "round_robin_estado_setor",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_rr_setor", columnNames = {"setor_atendimento"})
        }
)
public class RoundRobinEstadoSetor {

    private static final ZoneId TIME_ZONE = ZoneId.of("America/Sao_Paulo");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setor_atendimento", nullable = false)
    private String setorAtendimento;

    @Column(name = "ultimo_tecnico_id")
    private Long ultimoTecnicoId;

    private LocalDateTime updatedAt;

    public RoundRobinEstadoSetor() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSetorAtendimento() {
        return setorAtendimento;
    }

    public void setSetorAtendimento(String setorAtendimento) {
        this.setorAtendimento = setorAtendimento;
    }

    public Long getUltimoTecnicoId() {
        return ultimoTecnicoId;
    }

    public void setUltimoTecnicoId(Long ultimoTecnicoId) {
        this.ultimoTecnicoId = ultimoTecnicoId;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now(TIME_ZONE);
    }
}
