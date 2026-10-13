package com.example.Backend.repository;

/**
 * UsuarioPreferenciasRepository — Repositório JPA para a entidade UsuarioPreferencias.
 */
import com.example.Backend.model.UsuarioPreferencias;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioPreferenciasRepository extends JpaRepository<UsuarioPreferencias, Long> {
    Optional<UsuarioPreferencias> findByUsuarioId(Long usuarioId);
}
