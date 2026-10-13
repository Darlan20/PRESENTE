package com.example.Backend.service;

/**
 * UsuarioPreferenciasService — Serviço para gerenciar preferências do usuário.
 */
import com.example.Backend.dto.PreferenciasRequest;
import com.example.Backend.model.Usuario;
import com.example.Backend.model.UsuarioPreferencias;
import com.example.Backend.repository.UsuarioPreferenciasRepository;
import com.example.Backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UsuarioPreferenciasService {
    
    private final UsuarioPreferenciasRepository preferencesRepository;
    private final UsuarioRepository usuarioRepository;
    
    public UsuarioPreferenciasService(UsuarioPreferenciasRepository preferencesRepository,
                                      UsuarioRepository usuarioRepository) {
        this.preferencesRepository = preferencesRepository;
        this.usuarioRepository = usuarioRepository;
    }
    
    @Transactional
    public UsuarioPreferencias buscarPreferencias(Long usuarioId) {
        Optional<UsuarioPreferencias> prefs = preferencesRepository.findByUsuarioId(usuarioId);
        
        if (prefs.isPresent()) {
            return prefs.get();
        }
        
        // Se não existem preferências, cria com valores padrão
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        if (usuario.isPresent()) {
            UsuarioPreferencias novasPrefs = new UsuarioPreferencias();
            novasPrefs.setUsuario(usuario.get());
            novasPrefs.setNotifEmail(true);
            novasPrefs.setNotifSistema(true);
            novasPrefs.setNotifChamados(true);
            novasPrefs.setIdioma("pt-BR");
            novasPrefs.setTema("light");
            
            return preferencesRepository.save(novasPrefs);
        }
        
        throw new RuntimeException("Usuário não encontrado");
    }
    
    @Transactional
    public UsuarioPreferencias atualizarPreferencias(Long usuarioId, PreferenciasRequest request) {
        UsuarioPreferencias prefs = buscarPreferencias(usuarioId);
        
        if (request.getNotifEmail() != null) {
            prefs.setNotifEmail(request.getNotifEmail());
        }
        if (request.getNotifSistema() != null) {
            prefs.setNotifSistema(request.getNotifSistema());
        }
        if (request.getNotifChamados() != null) {
            prefs.setNotifChamados(request.getNotifChamados());
        }
        if (request.getIdioma() != null && !request.getIdioma().isBlank()) {
            prefs.setIdioma(request.getIdioma());
        }
        if (request.getTema() != null && !request.getTema().isBlank()) {
            prefs.setTema(request.getTema());
        }
        
        return preferencesRepository.save(prefs);
    }
}
