package com.example.Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Message message;

    public Attachment() {}

    public Long getId() { return id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }
}
