package com.wjbc.fila_atendimento.security.service;

import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.repository.UsuarioRepository;
import com.wjbc.fila_atendimento.domain.service.EmailSenderService;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import com.wjbc.fila_atendimento.security.model.ConfirmationToken;
import com.wjbc.fila_atendimento.security.model.PasswordResetToken;
import com.wjbc.fila_atendimento.security.repository.ConfirmationTokenRepository;
import com.wjbc.fila_atendimento.security.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class AuthService {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailSenderService emailSenderService;
    private final TemplateEngine templateEngine;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioService usuarioService,
            UsuarioRepository usuarioRepository,
            ConfirmationTokenRepository confirmationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            Map<String, EmailSenderService> emailSenderServices,
            @Value("${email.sender.impl}") String emailSenderImpl,
            TemplateEngine templateEngine,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailSenderService = emailSenderServices.get(emailSenderImpl);
        if (this.emailSenderService == null) {
            throw new IllegalArgumentException("Não foi encontrado um serviço de envio de email com o nome: " + emailSenderImpl);
        }
        this.templateEngine = templateEngine;
        this.passwordEncoder = passwordEncoder;
    }

    @Value("${app.base-url:http://localhost:8899}")
    private String appBaseUrl;

    @Value("${spring.mail.username}")
    private String emailFrom;

    @Value("${app.qmanager.reset-url:http://localhost:3000/reset-password}")
    private String qmanagerResetUrl;

    @Transactional
    public void register(UsuarioCreateDTO dto) {
        UsuarioCreateDTO usuarioCreateDTO = new UsuarioCreateDTO(
                dto.nomeUsuario(),
                dto.email(),
                dto.senha(),
                CategoriaUsuario.USUARIO,
                null
        );
        UsuarioResponseDTO usuarioResponseDTO = usuarioService.criar(usuarioCreateDTO);
        Usuario usuarioSalvo = usuarioService.findUsuarioById(usuarioResponseDTO.id());
        String token = java.util.UUID.randomUUID().toString();
        ConfirmationToken confirmationToken = new ConfirmationToken(token, usuarioSalvo);
        confirmationTokenRepository.save(confirmationToken);
        sendConfirmationEmailAsync(usuarioSalvo, token);
    }

    private void sendConfirmationEmailAsync(Usuario usuario, String token) {
        CompletableFuture.runAsync(() -> {
            String confirmationUrl = appBaseUrl + "/auth/confirmar?token=" + token;

            Context ctx = new Context(Locale.forLanguageTag("pt-BR"));
            ctx.setVariable("userName", usuario.getNomeUsuario());
            ctx.setVariable("confirmationUrl", confirmationUrl);
            ctx.setVariable("tokenExpiresIn", "24 horas");
            ctx.setVariable("year", String.valueOf(LocalDateTime.now().getYear()));

            String htmlBody = templateEngine.process("email/confirmacao-cadastro", ctx);

            EmailRequestDTO emailRequest = new EmailRequestDTO(
                    "Confirmação de Cadastro",
                    htmlBody,
                    usuario.getEmail(),
                    emailFrom
            );

            emailSenderService.sendEmail(emailRequest);
        });
    }

    public Usuario findByEmail(String email) {
        return usuarioService.findUsuarioByEmail(email);
    }

    public void confirmEmail(String token) {
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmação inválido!"));


        if (confirmationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expirado");
        }

        Usuario usuario = confirmationToken.getUsuario();
        usuario.setAtivo(true);

        usuarioRepository.save(usuario);

        confirmationTokenRepository.delete(confirmationToken);
    }

    public void deleteUserByEmail(String email) {
        Usuario usuario = findByEmail(email);
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        usuarioService.desativar(usuario.getId());
    }

    // Solicitar redefinição de senha: gera token, persiste e envia e-mail
    @Transactional
    public void solicitarRedefinicaoSenha(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        // Sempre retornar sucesso para evitar enumeração de e-mails. Se não existir, não faz nada.
        if (usuario == null || !usuario.isAtivo()) {
            return;
        }
        // Limpa tokens anteriores deste usuário
        passwordResetTokenRepository.deleteByUsuario(usuario);

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken(token, usuario);
        passwordResetTokenRepository.save(prt);

        sendPasswordResetEmailAsync(usuario, token);
    }

    private void sendPasswordResetEmailAsync(Usuario usuario, String token) {
        CompletableFuture.runAsync(() -> {
            // URL do frontend para a página de redefinição de senha
            String base = (qmanagerResetUrl == null || qmanagerResetUrl.isBlank()) ? "http://localhost:3000/reset-password" : qmanagerResetUrl;
            String sep = base.contains("?") ? "&" : "?";
            String resetUrl = base + sep + "token=" + token +
                    "&utm_source=qmanager-backend&utm_medium=reset-email&utm_campaign=password_reset";

            Context ctx = new Context(Locale.forLanguageTag("pt-BR"));
            ctx.setVariable("userName", usuario.getNomeUsuario());
            ctx.setVariable("resetUrl", resetUrl);
            ctx.setVariable("tokenExpiresIn", "1 hora");
            ctx.setVariable("year", String.valueOf(LocalDateTime.now().getYear()));

            String htmlBody = templateEngine.process("email/redefinicao-senha", ctx);

            EmailRequestDTO emailRequest = new EmailRequestDTO(
                    "Redefinição de Senha",
                    htmlBody,
                    usuario.getEmail(),
                    emailFrom
            );
            emailSenderService.sendEmail(emailRequest);
        });
    }

    // Redefinir senha consumindo token e nova senha
    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinição inválido!"));

        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expirado");
        }

        Usuario usuario = prt.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        // Remove todos os tokens deste usuário após sucesso
        passwordResetTokenRepository.deleteByUsuario(usuario);
    }

    // Verificar validade do token (para o frontend validar antes de submeter nova senha)
    @Transactional(readOnly = true)
    public boolean isPasswordResetTokenValido(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .filter(t -> t.getExpiryDate().isAfter(LocalDateTime.now()))
                .isPresent();
    }
}
