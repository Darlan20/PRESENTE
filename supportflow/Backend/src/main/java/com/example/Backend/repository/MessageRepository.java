package com.example.Backend.repository;

import com.example.Backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @EntityGraph(attributePaths = {"attachments"})
    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);
}
