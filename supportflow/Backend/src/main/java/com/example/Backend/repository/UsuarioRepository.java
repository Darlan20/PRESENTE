package com.example.Backend.repository;

/**
 * UsuarioRepository — Repositório JPA para a entidade Usuario.
 * Fornece métodos de consulta ao banco de dados (findByEmail, findByResetToken, etc.).
 */
import com.example.Backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    Optional<Usuario> findByResetToken(String resetToken);

    List<Usuario> findByTipoIgnoreCase(String tipo);
}