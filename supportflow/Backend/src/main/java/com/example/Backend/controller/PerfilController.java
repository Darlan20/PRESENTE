package com.example.Backend.controller;

import com.example.Backend.dto.PreferenciasRequest;
import com.example.Backend.dto.TrocarSenhaRequest;
import com.example.Backend.model.Usuario;
import com.example.Backend.model.UsuarioPreferencias;
import com.example.Backend.service.JwtService;
import com.example.Backend.service.UsuarioService;
import com.example.Backend.service.UsuarioPreferenciasService;
import com.example.Backend.service.RefreshTokenBlacklistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final UsuarioPreferenciasService preferencesService;
    private final RefreshTokenBlacklistService blacklistService;

    public PerfilController(UsuarioService usuarioService, JwtService jwtService, 
                           UsuarioPreferenciasService preferencesService,
                           RefreshTokenBlacklistService blacklistService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.preferencesService = preferencesService;
        this.blacklistService = blacklistService;
    }

    private Map<String, Object> toMap(Usuario u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",                u.getId());
        map.put("nome",              u.getNome());
        map.put("email",             u.getEmail());
        map.put("tipo",              u.getTipo());
        map.put("fotoUrl",           u.getFotoUrl());
        map.put("setorAtendimento",  u.getSetorAtendimento());
        return map;
    }

    private String emailFromHeader(String authHeader) {
        return jwtService.extractUsername(authHeader.substring(7));
    }

    @GetMapping
    public ResponseEntity<?> buscarPerfil(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            return ResponseEntity.ok(toMap(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao buscar perfil");
        }
    }

    @PutMapping
    public ResponseEntity<?> atualizarPerfil(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> dados) {
        try {
            Usuario atual = usuarioService.buscarPorEmail(emailFromHeader(authHeader));

            Usuario atualizado = usuarioService.atualizarPerfil(
                atual.getId(),
                dados.get("nome"),
                dados.get("fotoUrl"),
                dados.get("setorAtendimento")   // novo parâmetro
            );

            return ResponseEntity.ok(toMap(atualizado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao atualizar perfil: " + e.getMessage());
        }
    }

    @PostMapping("/trocar-senha")
    public ResponseEntity<?> trocarSenha(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody TrocarSenhaRequest request) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            usuarioService.trocarSenha(usuario.getId(), request.getSenhaAtual(), request.getNovaSenha());

            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Senha alterada com sucesso!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao trocar senha");
        }
    }

    @GetMapping("/preferencias")
    public ResponseEntity<?> buscarPreferencias(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            UsuarioPreferencias prefs = preferencesService.buscarPreferencias(usuario.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifEmail", prefs.getNotifEmail());
            response.put("notifSistema", prefs.getNotifSistema());
            response.put("notifChamados", prefs.getNotifChamados());
            response.put("idioma", prefs.getIdioma());
            response.put("tema", prefs.getTema());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao buscar preferências: " + e.getMessage());
        }
    }

    @PutMapping("/preferencias")
    public ResponseEntity<?> atualizarPreferencias(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PreferenciasRequest request) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            UsuarioPreferencias atualizado = preferencesService.atualizarPreferencias(usuario.getId(), request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifEmail", atualizado.getNotifEmail());
            response.put("notifSistema", atualizado.getNotifSistema());
            response.put("notifChamados", atualizado.getNotifChamados());
            response.put("idioma", atualizado.getIdioma());
            response.put("tema", atualizado.getTema());
            response.put("mensagem", "Preferências atualizadas com sucesso!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao atualizar preferências: " + e.getMessage());
        }
    }

    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            blacklistService.revokeAllUserTokens(usuario.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Logout realizado em todas as sessões!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao fazer logout: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deletarConta(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuario = usuarioService.buscarPorEmail(emailFromHeader(authHeader));
            usuarioService.deletarUsuario(usuario.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Conta deletada com sucesso. Desculpamos por você sair!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao deletar conta: " + e.getMessage());
        }
    }
}