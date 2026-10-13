package com.example.Backend.service;

/**
 * EmailService — Serviço para envio de emails via SMTP.
 * Configurável via variáveis de ambiente.
 */
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.logging.Logger;

@Service
public class EmailService {
    
    private static final Logger logger = Logger.getLogger(EmailService.class.getName());
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.from:noreply@supportflow.com}")
    private String fromEmail;
    
    @Value("${spring.mail.from-name:Support Flow}")
    private String fromName;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Envia um email simples.
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            logger.info("Email enviado para: " + to + " com assunto: " + subject);
        } catch (Exception e) {
            logger.severe("Erro ao enviar email: " + e.getMessage());
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Envia um email de teste.
     */
    public void sendTestEmail(String to) {
        String subject = "Support Flow - Email de Teste";
        String body = "Este é um email de teste do sistema Support Flow.\n\n" +
                      "Se você recebeu este email, significa que sua configuração de SMTP está funcionando corretamente.";
        sendEmail(to, subject, body);
    }
    
    /**
     * Envia um email com token de recuperação de senha.
     */
    public void sendPasswordRecoveryEmail(String to, String token, String recoveryUrl) {
        String subject = "Support Flow - Recuperação de Senha";
        String body = "Você solicitou a recuperação de sua senha.\n\n" +
                      "Código de recuperação (token): " + token + "\n\n" +
                      "Ou clique no link abaixo:\n" +
                      recoveryUrl + "\n\n" +
                      "Este link expira em 1 hora.\n" +
                      "Se você não solicitou isso, ignore este email.";
        sendEmail(to, subject, body);
    }
}
