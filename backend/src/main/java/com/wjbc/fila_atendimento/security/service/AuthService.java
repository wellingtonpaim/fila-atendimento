package com.wjbc.fila_atendimento.security.service;

import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioCreateDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioResponseDTO;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.service.EmailSenderService;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import com.wjbc.fila_atendimento.security.model.ConfirmationToken;
import com.wjbc.fila_atendimento.security.repository.ConfirmationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AuthService {

    private final UsuarioService usuarioService;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final EmailSenderService emailSenderService;

    public AuthService(
            UsuarioService usuarioService,
            ConfirmationTokenRepository confirmationTokenRepository,
            Map<String, EmailSenderService> emailSenderServices,
            @Value("${email.sender.impl}") String emailSenderImpl
    ) {
        this.usuarioService = usuarioService;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.emailSenderService = emailSenderServices.get(emailSenderImpl);
        if (this.emailSenderService == null) {
            throw new IllegalArgumentException("Não foi encontrado um serviço de envio de email com o nome: " + emailSenderImpl);
        }
    }

    @Value("${spring.mail.username}")
    private String emailFrom;

    @Transactional
    public void register(UsuarioCreateDTO dto) {
        CategoriaUsuario categoria = dto.categoria() != null ? dto.categoria() : CategoriaUsuario.USUARIO;

        UsuarioCreateDTO usuarioCreateDTO = new UsuarioCreateDTO(
                dto.nomeUsuario(),
                dto.email(),
                dto.senha(),
                categoria,
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
            String confirmationUrl = "http://wjbcsystems.shop:8899/auth/confirmar?token=" + token;
            String htmlBody = "<p>Olá " + usuario.getNomeUsuario() + ",</p>"
                    + "<p>Por favor, confirme seu cadastro clicando no link abaixo:</p>"
                    + "<a href=\"" + confirmationUrl + "\">Confirmar Cadastro</a>";

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
        usuarioService.criar(new UsuarioCreateDTO(
                usuario.getNomeUsuario(),
                usuario.getEmail(),
                usuario.getSenha(),
                usuario.getCategoria(),
                usuario.getUnidades() != null ? usuario.getUnidades().stream().map(u -> u.getId()).toList() : null
        ));
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
