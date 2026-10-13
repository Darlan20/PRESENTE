package com.example.Backend.controller;

/**
 * AuthController — Controller de autenticação.
 * Endpoints: POST /api/auth/login, POST /api/auth/registrar, POST /api/auth/recuperar-senha, POST /api/auth/resetar-senha, GET /api/auth/teste.
 */
import com.example.Backend.dto.LoginRequest;
import com.example.Backend.dto.UsuarioResponse;
import com.example.Backend.dto.RecuperarSenhaRequest;
import com.example.Backend.dto.ResetarSenhaRequest;
import com.example.Backend.model.Usuario;
import com.example.Backend.service.JwtService;
import com.example.Backend.service.UsuarioService;
import com.example.Backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Rota base para autenticação
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    // Construtor manual
    public AuthController(UsuarioService usuarioService, 
                         PasswordEncoder passwordEncoder,
                         JwtService jwtService,
                         UserDetailsService userDetailsService,
                         EmailService emailService) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    @PostMapping("/registrar") // Endpoint de registro
    public ResponseEntity<String> registrar(@RequestBody Usuario usuario) {
        String emailNormalizado = usuario.getEmail() == null ? "" : usuario.getEmail().trim().toLowerCase();
        usuario.setEmail(emailNormalizado);

        if (usuarioService.existePorEmail(usuario.getEmail())) {
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }

        // ✅ Validar força de senha antes de salvar
        if (!isStrongPassword(usuario.getSenha())) {
            return ResponseEntity.badRequest()
                .body("Senha fraca! Requer: Maiúscula, minúscula, número, caractere especial (@$!%*?&), mínimo 8 caracteres");
        }

        // Hash da senha antes de salvar (esconde a senha)
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuarioService.salvarUsuario(usuario);
        return ResponseEntity.ok("Usuário criado com sucesso!");
    }

    @PostMapping("/login") 
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String emailNormalizado = loginRequest.getEmail() == null ? "" : loginRequest.getEmail().trim().toLowerCase();

            // Busca o usuário pelo email
            Usuario usuario = usuarioService.buscarPorEmail(emailNormalizado);

            // Verifica a senha com BCrypt
            if (!passwordEncoder.matches(loginRequest.getSenha(), usuario.getSenha())) {
                return ResponseEntity.badRequest().body("Credenciais inválidas");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(emailNormalizado);
            
            // ✅ Gerar Access Token (30 min) + Refresh Token (7 dias)
            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // Montar resposta com tokens e dados do usuário
            Map<String, Object> response = new HashMap<>();
            response.put("token", accessToken);           // Access token (compatibilidade com frontend)
            response.put("accessToken", accessToken);     // Access token (explícito)
            response.put("refreshToken", refreshToken);   // Refresh token (novo)
            response.put("usuario", new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                usuario.getSetorAtendimento()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Credenciais inválidas");
        }
    }

    // ✅ Endpoint para renovar access token usando refresh token
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Refresh token ausente");
            }

            String refreshToken = authHeader.substring(7);
            
            // ✅ Extrair username com tratamento de erro isolado
            String email;
            try {
                email = jwtService.extractUsernameFromRefreshToken(refreshToken);
            } catch (Exception e) {
                log.warn("Refresh token inválido — falha ao extrair claims: {}", e.getClass().getSimpleName());
                return ResponseEntity.status(401).body("Refresh token inválido");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (!jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
                return ResponseEntity.status(401).body("Refresh token inválido ou expirado");
            }

            String newAccessToken = jwtService.generateAccessToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("token", newAccessToken);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro inesperado no refresh-token", e);
            return ResponseEntity.status(500).body("Erro interno");
        }
    }

    // Recuperação de senha - Gera token
    @PostMapping("/recuperar-senha")
    public ResponseEntity<?> recuperarSenha(@RequestBody RecuperarSenhaRequest request) {
        try {
            String token = usuarioService.gerarTokenRecuperacao(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Verifique seu email para recuperar a senha");
            response.put("token", token); // Em produção, enviar por email em vez de retornar aqui
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Email não encontrado");
        }
    }

    // Reset de senha - Consome o token
    @PostMapping("/resetar-senha")
    public ResponseEntity<?> resetarSenha(@RequestBody ResetarSenhaRequest request) {
        try {
            usuarioService.resetarSenha(request.getToken(), request.getNovaSenha());
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Senha alterada com sucesso!");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Validação de força de senha
    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        // Exigir: Maiúscula, minúscula, número, caractere especial, 8+ chars
        String regex = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(regex);
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> enviarEmail(@RequestBody Map<String, String> request) {
        try {
            String para = request.get("para");
            String assunto = request.get("assunto");
            String corpo = request.get("corpo");
            
            if (para == null || para.isBlank()) {
                return ResponseEntity.badRequest().body("Email destinatário é obrigatório");
            }
            if (assunto == null || assunto.isBlank()) {
                return ResponseEntity.badRequest().body("Assunto é obrigatório");
            }
            if (corpo == null || corpo.isBlank()) {
                return ResponseEntity.badRequest().body("Corpo é obrigatório");
            }
            
            emailService.sendEmail(para, assunto, corpo);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensagem", "Email enviado com sucesso!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao enviar email: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro ao enviar email: " + e.getMessage());
        }
    }

    @GetMapping("/teste")
    public ResponseEntity<String> teste() {
        return ResponseEntity.ok("API funcionando! v3 - Com Access + Refresh Token");
    }
}
