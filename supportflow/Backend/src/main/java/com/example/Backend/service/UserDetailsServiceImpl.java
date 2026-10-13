package com.example.Backend.service;

/**
 * UserDetailsServiceImpl — Implementação do UserDetailsService do Spring Security.
 * Carrega o usuário pelo email para autenticação.
 */
import com.example.Backend.model.Usuario;
import com.example.Backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service // Serviço para carregar detalhes do usuário para autenticação
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    
    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    // Carrega os detalhes do usuário pelo email para autenticação
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String emailNormalizado = email == null ? "" : email.trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(usuario.getTipo())
                .build();
    }
}