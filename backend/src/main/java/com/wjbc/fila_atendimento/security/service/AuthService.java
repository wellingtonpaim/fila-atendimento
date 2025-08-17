package com.wjbc.fila_atendimento.security.service;

import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import com.wjbc.fila_atendimento.domain.dto.UsuarioRegisterDTO;
import com.wjbc.fila_atendimento.domain.model.Usuario;
import com.wjbc.fila_atendimento.domain.enumeration.CategoriaUsuario;
import com.wjbc.fila_atendimento.security.model.ConfirmationToken;
import com.wjbc.fila_atendimento.security.repository.ConfirmationTokenRepository;
import com.wjbc.fila_atendimento.domain.service.EmailSenderService;
import com.wjbc.fila_atendimento.domain.service.UsuarioService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
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
    public void register(UsuarioRegisterDTO dto) {

        if (usuarioService.findByEmail(dto.getEmail()) != null) {
            throw new IllegalArgumentException("Email já cadastrado!");
        }

        String categoriaUsuario = dto.getCategoria().toUpperCase();

        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(dto.getNomeUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setCategoria(categoriaUsuario.equals("ADMINISTRADOR")
                ? CategoriaUsuario.ADMINISTRADOR : CategoriaUsuario.USUARIO);
        usuario.setAtivo(false);

        Usuario usuarioSalvo = usuarioService.salvarUsuario(usuario);

        String token = UUID.randomUUID().toString();
        ConfirmationToken confirmationToken = new ConfirmationToken(token, usuarioSalvo);
        confirmationTokenRepository.save(confirmationToken);

        sendConfirmationEmailAsync(usuarioSalvo, token);
    }

    private void sendConfirmationEmailAsync(Usuario usuario, String token) {
        CompletableFuture.runAsync(() -> {
            String confirmationUrl = "http://wjbcsystems.shop:8888/auth/confirmar?token=" + token;
            String htmlBody = "<p>Olá " + usuario.getNomeUsuario() + ",</p>"
                    + "<p>Por favor, confirme seu cadastro clicando no link abaixo:</p>"
                    + "<a href=\"" + confirmationUrl + "\">Confirmar Cadastro</a>";

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .subject("Confirmação de Cadastro")
                    .body(htmlBody)
                    .to(usuario.getEmail())
                    .from(emailFrom)
                    .build();

            emailSenderService.sendEmail(emailRequest);
        });
    }

    public Usuario findByEmail(String email) {
        return usuarioService.findByEmail(email);
    }

    public void confirmEmail(String token) {
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Email confirmado com sucesso!"));

        if (confirmationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expirado");
        }

        Usuario usuario = confirmationToken.getUsuario();
        usuario.setAtivo(true);
        usuarioService.salvarUsuario(usuario);
        confirmationTokenRepository.delete(confirmationToken);
    }

    public void deleteUserByEmail(String email) {
        Usuario usuario = usuarioService.findByEmail(email);
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        usuarioService.deletarUsuario(usuario.getId());
    }
}

