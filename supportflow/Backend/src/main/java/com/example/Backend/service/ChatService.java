package com.example.Backend.service;

import com.example.Backend.model.Chat;
import com.example.Backend.model.Message;
import com.example.Backend.repository.ChatRepository;
import com.example.Backend.repository.MessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRepository chatRepository,
                       MessageRepository messageRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.chatRepository     = chatRepository;
        this.messageRepository  = messageRepository;
        this.messagingTemplate  = messagingTemplate;
    }

    // FIX: @Transactional garante que findByChamadoId + save() estejam na mesma
    // sessão Hibernate. Sem isso, dois requests simultâneos (usuário e técnico
    // abrindo o chat ao mesmo tempo) podem tentar criar o mesmo chat e causar
    // constraint violation (chamadoId é unique).
    @Transactional
    public Chat getOrCreateByChamado(String chamadoId) {
        return chatRepository.findByChamadoId(chamadoId)
                .orElseGet(() -> chatRepository.save(new Chat(chamadoId)));
    }

    // FIX: readOnly = true abre sessão Hibernate suficiente para inicializar
    // relações LAZY (attachments) durante a serialização do Jackson.
    // Sem isso: LazyInitializationException ao serializar Message.attachments
    // fora de sessão → 500 silencioso no GET /chats/{id}/messages.
    @Transactional(readOnly = true)
    public List<Message> listMessages(Long chatId) {
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
    }

    // FIX principal do broadcast STOMP:
    // messagingTemplate.convertAndSend tenta serializar o objeto Message com Jackson.
    // Se Message.chat não tiver @JsonIgnore, Jackson entra em loop
    // Message → Chat → List<Message> → Message... e lança exception internamente.
    // Essa exception é engolida pelo Spring Messaging — nenhum log aparece,
    // o broadcast simplesmente não acontece, e o outro lado nunca recebe a mensagem.
    // O @JsonIgnore em Message.java é o fix real; este método não precisa mudar.
    @Transactional
    public Message saveMessage(Message msg) {
        Message saved = messageRepository.save(msg);
        messagingTemplate.convertAndSend(
            "/topic/chats/" + saved.getChat().getId(), saved
        );
        return saved;
    }

    @Transactional
    public Chat closeChat(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat não encontrado: " + chatId));
        chat.setClosed(true);
        return chatRepository.save(chat);
    }
}