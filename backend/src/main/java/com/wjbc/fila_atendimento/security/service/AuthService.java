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
import com.wjbc.fila_atendimento.security.repository.ConfirmationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AuthService {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final EmailSenderService emailSenderService;
    private final TemplateEngine templateEngine;

    public AuthService(
            UsuarioService usuarioService,
            UsuarioRepository usuarioRepository,
            ConfirmationTokenRepository confirmationTokenRepository,
            Map<String, EmailSenderService> emailSenderServices,
            @Value("${email.sender.impl}") String emailSenderImpl,
            TemplateEngine templateEngine
    ) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.emailSenderService = emailSenderServices.get(emailSenderImpl);
        if (this.emailSenderService == null) {
            throw new IllegalArgumentException("Não foi encontrado um serviço de envio de email com o nome: " + emailSenderImpl);
        }
        this.templateEngine = templateEngine;
    }

    @Value("${app.base-url:http://localhost:8899}")
    private String appBaseUrl;

    @Value("${spring.mail.username}")
    private String emailFrom;

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

            Context ctx = new Context(new Locale("pt", "BR"));
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
}
