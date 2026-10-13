package com.example.Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // id do chamado (pode ser string vindo do Mongo-like front)
    private String chamadoId;

    private boolean closed = false;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Message> messages = new ArrayList<>();

    public Chat() {}

    public Chat(String chamadoId) {
        this.chamadoId = chamadoId;
    }

    public Long getId() { return id; }
    public String getChamadoId() { return chamadoId; }
    public void setChamadoId(String chamadoId) { this.chamadoId = chamadoId; }
    public boolean isClosed() { return closed; }
    public void setClosed(boolean closed) { this.closed = closed; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}
