package com.example.Backend.controller;

/**
 * UsuarioController — Gerenciamento de usuários (apenas GESTOR).
 * GET  /api/usuarios        → lista todos os usuários
 * DELETE /api/usuarios/{id} → remove um usuário
 */
import com.example.Backend.dto.UsuarioResponse;
import com.example.Backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        List<UsuarioResponse> usuarios = usuarioService.listarTodos().stream()
            .map(u -> new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getTipo(), u.getSetorAtendimento()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
