package com.example.Backend.service;

/**
 * UsuarioService — Serviço de negócio para usuários.
 * Contém lógica de registro, busca, perfil, trocar senha e recuperação de senha.
 */
import com.example.Backend.model.Usuario;
import com.example.Backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public Usuario salvarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    
    public boolean existePorEmail(String email) {
        String emailNormalizado = email == null ? "" : email.trim().toLowerCase();
        return usuarioRepository.findByEmailIgnoreCase(emailNormalizado).isPresent();
    }
    
    public Usuario buscarPorEmail(String email) {
        String emailNormalizado = email == null ? "" : email.trim().toLowerCase();
        return usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public java.util.List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public void deletar(Long id) {
        usuarioRepository.deleteById(id);
    }

    // Métodos de perfil
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Usuario atualizarPerfil(Long id, String nome, String fotoUrl, String setorAtendimento) {
        Usuario usuario = buscarPorId(id);
        if (nome != null && !nome.trim().isEmpty()) {
            usuario.setNome(nome);
        }
        if (fotoUrl != null) {
            usuario.setFotoUrl(fotoUrl);
        }
        if (setorAtendimento != null) {
            usuario.setSetorAtendimento(setorAtendimento.trim());
        }
        return usuarioRepository.save(usuario);
    }

    // ✅ Validação de força de senha
    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        // Exigir: Maiúscula, minúscula, número, caractere especial, 8+ chars
        String regex = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(regex);
    }

    // Troca de senha
    public void trocarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(id);
        
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new RuntimeException("Senha atual está incorreta");
        }
        
        if (senhaAtual.equals(novaSenha)) {
            throw new RuntimeException("Nova senha deve ser diferente da atual");
        }

        // ✅ Validar força da nova senha
        if (!isStrongPassword(novaSenha)) {
            throw new RuntimeException("Senha fraca! Requer: Maiúscula, minúscula, número, caractere especial (@$!%*?&), mínimo 8 caracteres");
        }
        
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    // Recuperação de senha
    public String gerarTokenRecuperacao(String email) {
        Usuario usuario = buscarPorEmail(email);
        String token = UUID.randomUUID().toString();
        
        usuario.setResetToken(token);
        usuario.setTokenExpiration(LocalDateTime.now().plusHours(24)); // Válido por 24h
        
        usuarioRepository.save(usuario);
        return token;
    }

    public void resetarSenha(String token, String novaSenha) {
        Usuario usuario = usuarioRepository.findByResetToken(token)
            .orElseThrow(() -> new RuntimeException("Token inválido ou expirado"));
        
        if (usuario.getTokenExpiration() == null || LocalDateTime.now().isAfter(usuario.getTokenExpiration())) {
            throw new RuntimeException("Token expirado");
        }

        // ✅ Validar força da nova senha
        if (!isStrongPassword(novaSenha)) {
            throw new RuntimeException("Senha fraca! Requer: Maiúscula, minúscula, número, caractere especial (@$!%*?&), mínimo 8 caracteres");
        }
        
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);
        usuario.setTokenExpiration(null);
        
        usuarioRepository.save(usuario);
    }

    public void deletarUsuario(Long id) {
        Usuario usuario = buscarPorId(id);
        // TODO: Considerar exclusão em cascata de:
        // - Chamados criados pelo usuário
        // - Mensagens do usuário
        // - Preferências do usuário
        usuarioRepository.deleteById(id);
    }
}