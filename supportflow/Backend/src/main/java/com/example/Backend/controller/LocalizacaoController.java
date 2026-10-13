package com.example.Backend.controller;

import com.example.Backend.model.LocalizacaoCatalogo;
import com.example.Backend.service.LocalizacaoCatalogoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localizacoes")
public class LocalizacaoController {

    private final LocalizacaoCatalogoService service;

    public LocalizacaoController(LocalizacaoCatalogoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<LocalizacaoCatalogo>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody LocalizacaoCatalogo localizacao) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(localizacao));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody LocalizacaoCatalogo localizacao) {
        try {
            return service.atualizar(id, localizacao)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return service.deletar(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/setor/{setorAtual}")
    public ResponseEntity<?> renomearSetor(@PathVariable String setorAtual, @RequestBody LocalizacaoCatalogo localizacao) {
        try {
            return service.renomearSetor(setorAtual, localizacao.getSetor())
                    ? ResponseEntity.ok().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/setor/{setor}")
    public ResponseEntity<Void> deletarSetor(@PathVariable String setor) {
        return service.deletarSetorCompleto(setor) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}