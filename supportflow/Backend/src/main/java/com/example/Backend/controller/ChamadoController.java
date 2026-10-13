package com.example.Backend.controller;

/**
 * ChamadoController — Controller REST para chamados (tickets).
 * Endpoints:
 *   GET    /api/chamados         → lista todos (técnico/gestor)
 *   GET    /api/chamados/meus    → lista apenas do usuário logado
 *   POST   /api/chamados         → cria novo chamado
 *   PUT    /api/chamados/{id}    → atualiza status/prioridade
 *   DELETE /api/chamados/{id}    → remove chamado (gestor)
 */
import com.example.Backend.model.Chamado;
import com.example.Backend.dto.ChamadoCreateRequest;
import com.example.Backend.service.ChamadoService;
import com.example.Backend.service.JwtService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;
    private final JwtService jwtService;

    public ChamadoController(ChamadoService chamadoService, JwtService jwtService) {
        this.chamadoService = chamadoService;
        this.jwtService = jwtService;
    }

    // Lista todos os chamados (técnico e gestor)
    // Observação: o dashboard não tem paginação de verdade (filtra tudo no
    // client), então aqui retornamos a lista completa ordenada por data de
    // criação (mais recentes primeiro). Antes isso usava um Page com
    // tamanho fixo de 10 e sem ordenação, o que fazia chamados novos
    // ficarem de fora da "janela" retornada e sumirem para gestor/técnico.
    @GetMapping
    public ResponseEntity<List<Chamado>> listarTodos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(chamadoService.listarTodos());
    }

    // Lista apenas os chamados do usuário logado (pelo email extraído do JWT)
    @GetMapping("/meus")
    public ResponseEntity<List<Chamado>> listarMeus(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        return ResponseEntity.ok(chamadoService.listarPorEmail(email));
    }

    // Cria novo chamado — os dados de solicitante/email vêm do token JWT
    @PostMapping
    public ResponseEntity<Chamado> criar(
            @RequestBody ChamadoCreateRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        
        // Mapear request para entidade Chamado
        Chamado chamado = new Chamado();
        chamado.setTitulo(request.getTitulo());
        chamado.setDescricao(request.getDescricao());
        chamado.setSolicitante(request.getSolicitante());
        chamado.setEmail(email);
        chamado.setSetor(request.getSetor());
        chamado.setBloco(request.getBloco());
        chamado.setSala(request.getSala());
        chamado.setAndar(request.getAndar());
        chamado.setUnidade(request.getUnidade());
        chamado.setTemplateId(request.getTemplateId());
        chamado.setTemplateIndex(request.getTemplateIndex());
        
        Chamado criado = chamadoService.criar(
            chamado,
            request.getAttachmentBase64(),
            request.getAttachmentName(),
            request.getAttachmentContentType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping("/{id}/anexo")
    public ResponseEntity<Resource> baixarAnexo(@PathVariable Long id) {
        return chamadoService.obterAnexo(id)
                .map(anexo -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentDisposition(ContentDisposition.inline()
                            .filename(anexo.fileName() == null ? "anexo" : anexo.fileName())
                            .build());
                    headers.setContentType(MediaType.parseMediaType(
                            anexo.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : anexo.contentType()));
                    return new ResponseEntity<>(anexo.resource(), headers, HttpStatus.OK);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Atualiza status e/ou prioridade de um chamado
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Chamado chamado) {
        return chamadoService.atualizar(id, chamado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Remove um chamado (somente gestor deve chamar este endpoint)
    // Mover para lixeira (soft-delete). Recebe Authorization para registrar quem deletou.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> moverParaLixeira(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String deletedBy = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            deletedBy = jwtService.extractUsername(token);
        }

        if (chamadoService.moverParaLixo(id, deletedBy)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Lista lixeira (chamados excluídos)
    // Mesma observação do listarTodos: ordena por data de exclusão (mais
    // recentes primeiro) para não deixar itens de fora da página retornada.
    @GetMapping("/trash")
    public ResponseEntity<Page<Chamado>> listarLixeira(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "deletedAt"));
        return ResponseEntity.ok(chamadoService.listarLixoPaginado(pageable));
    }

    // Recuperar chamado da lixeira
    @PutMapping("/{id}/recover")
    public ResponseEntity<?> recuperar(@PathVariable Long id) {
        if (chamadoService.recuperarDeLixo(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Excluir permanentemente (hard delete)
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> deletarPermanentemente(@PathVariable Long id) {
        if (chamadoService.deletar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
