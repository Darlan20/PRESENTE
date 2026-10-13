package com.example.Backend.controller;

import com.example.Backend.model.Attachment;
import com.example.Backend.model.Chat;
import com.example.Backend.model.Message;
import com.example.Backend.repository.ChatRepository;
import com.example.Backend.repository.MessageRepository;
import com.example.Backend.service.ChatService;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final Path uploadsDir = Paths.get("uploads");

    public ChatController(ChatService chatService,
                          ChatRepository chatRepository,
                          MessageRepository messageRepository) {
        this.chatService       = chatService;
        this.chatRepository    = chatRepository;
        this.messageRepository = messageRepository;
        try { Files.createDirectories(uploadsDir); } catch (Exception ignored) {}
    }

    // FIX: este endpoint é chamado toda vez que o ChatPanel abre.
    // O ChatService.getOrCreateByChamado agora é @Transactional, protegendo
    // contra race condition quando usuário e técnico abrem o chat simultâneamente.
    @GetMapping("/by-chamado/{chamadoId}")
    public Chat getOrCreateByChamado(@PathVariable String chamadoId) {
        return chatService.getOrCreateByChamado(chamadoId);
    }

    // FIX: ChatService.listMessages agora é @Transactional(readOnly = true),
    // evitando LazyInitializationException ao serializar Message.attachments.
    // A serialização de Message também não causa mais loop infinito porque
    // Message.chat tem @JsonIgnore.
    @GetMapping("/{chatId}/messages")
    public List<Message> listMessages(@PathVariable Long chatId) {
        // Valida existência do chat antes de listar — retorna 404 limpo
        // em vez de lista vazia quando o chatId é inválido.
        if (!chatRepository.existsById(chatId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Chat não encontrado: " + chatId);
        }
        return chatService.listMessages(chatId);
    }

    @PostMapping(value = "/{chatId}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Message> postMessage(
            @PathVariable Long chatId,
            @RequestParam String senderId,
            @RequestParam String senderName,
            @RequestParam(required = false) String content,
            @RequestPart(required = false) MultipartFile[] files) throws Exception {

        // FIX: validação de senderId — o ChatPanel.jsx agora garante que user.id
        // existe antes de enviar, mas o backend valida igualmente para segurança.
        if (senderId == null || senderId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "senderId é obrigatório.");
        }

        // Rejeita mensagens sem conteúdo E sem anexos
        boolean semConteudo = (content == null || content.isBlank());
        boolean semArquivos = (files == null || files.length == 0);
        if (semConteudo && semArquivos) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "A mensagem precisa ter conteúdo ou pelo menos um anexo.");
        }

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Chat não encontrado: " + chatId));

        if (chat.isClosed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Este chat foi encerrado e não aceita novas mensagens.");
        }

        Message m = new Message();
        m.setChat(chat);
        m.setSenderId(senderId.trim());
        m.setSenderName(senderName != null ? senderName.trim() : "Usuário");
        m.setContent(content);
        m.setCreatedAt(Instant.now());

        if (files != null && files.length > 0) {
            List<Attachment> atts = new ArrayList<>();
            for (MultipartFile f : files) {
                if (f.isEmpty()) continue; // ignora arquivos vazios

                // UUID evita colisão de nomes e path traversal
                String filename = UUID.randomUUID() + "-" + f.getOriginalFilename();
                Files.copy(f.getInputStream(), uploadsDir.resolve(filename));

                Attachment a = new Attachment();
                a.setFilename(f.getOriginalFilename());
                a.setUrl("/api/chats/uploads/" + filename);
                a.setMessage(m);
                atts.add(a);
            }
            m.setAttachments(atts);
        }

        // saveMessage salva no banco E faz broadcast via STOMP para /topic/chats/{id}.
        // O broadcast só funciona corretamente agora que Message.chat tem @JsonIgnore
        // — sem isso, o Jackson lançava exception silenciosa dentro do convertAndSend
        // e nenhum outro usuário recebia a mensagem em tempo real.
        return ResponseEntity.ok(chatService.saveMessage(m));
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<?> serveFile(@PathVariable String filename) throws MalformedURLException {
        Path file = uploadsDir.resolve(filename).normalize();

        // Segurança: impede path traversal (ex: filename = "../../application.properties")
        if (!file.startsWith(uploadsDir.toAbsolutePath())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caminho inválido.");
        }

        UrlResource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        }

        String contentType = "application/octet-stream";
        try { contentType = Files.probeContentType(file); } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                    contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/{chatId}/close")
    public Chat closeChat(@PathVariable Long chatId) {
        return chatService.closeChat(chatId);
    }
}