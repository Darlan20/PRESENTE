package com.example.Backend.repository;

/**
 * ChamadoRepository — Repositório JPA para a entidade Chamado.
 */
import com.example.Backend.model.Chamado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChamadoRepository extends JpaRepository<Chamado, Long> {
    List<Chamado> findByEmailIgnoreCase(String email);
    List<Chamado> findAllByOrderByCreatedAtDesc();

    // Active (not deleted)
    List<Chamado> findAllByIsDeletedFalseOrderByCreatedAtDesc();
    org.springframework.data.domain.Page<Chamado> findAllByIsDeletedFalse(org.springframework.data.domain.Pageable pageable);
    List<Chamado> findByEmailIgnoreCaseAndIsDeletedFalse(String email);

    // Deleted (trash)
    List<Chamado> findAllByIsDeletedTrueOrderByDeletedAtDesc();
    org.springframework.data.domain.Page<Chamado> findAllByIsDeletedTrue(org.springframework.data.domain.Pageable pageable);
}
