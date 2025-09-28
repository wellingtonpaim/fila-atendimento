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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.thymeleaf.TemplateEngine;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    @Mock
    private UsuarioService usuarioService;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ConfirmationTokenRepository confirmationTokenRepository;
    @Mock
    private EmailSenderService emailSenderService;
    @Mock
    private TemplateEngine templateEngine;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Stub do template para evitar NPE no envio assíncrono de e-mail
        when(templateEngine.process(anyString(), any())).thenReturn("<html>ok</html>");
        authService = new AuthService(
                usuarioService,
                usuarioRepository,
                confirmationTokenRepository,
                new ConcurrentHashMap<>() {{ put("gmailSmtpService", emailSenderService); }},
                "gmailSmtpService",
                templateEngine
        );
    }

    @Test
    void testRegisterSuccess() {
        UsuarioCreateDTO dto = new UsuarioCreateDTO("nome", "email@test.com", "senha", CategoriaUsuario.USUARIO, null);
        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO(UUID.randomUUID(), "nome", "email@test.com", CategoriaUsuario.USUARIO, null);
        Usuario usuario = new Usuario();
        usuario.setId(responseDTO.id());
        usuario.setNomeUsuario("nome");
        usuario.setEmail("email@test.com");
        usuario.setSenha("senha");
        usuario.setCategoria(CategoriaUsuario.USUARIO);
        usuario.setAtivo(false);

        when(usuarioService.criar(any(UsuarioCreateDTO.class))).thenReturn(responseDTO);
        when(usuarioService.findUsuarioById(any(UUID.class))).thenReturn(usuario);
        when(confirmationTokenRepository.save(any(ConfirmationToken.class))).thenReturn(null);
        doNothing().when(emailSenderService).sendEmail(any(EmailRequestDTO.class));

        assertDoesNotThrow(() -> authService.register(dto));
    }

    @Test
    void testConfirmEmailSuccess() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNomeUsuario("nome");
        usuario.setEmail("email@test.com");
        usuario.setSenha("senha");
        usuario.setCategoria(CategoriaUsuario.USUARIO);
        usuario.setAtivo(false);

        ConfirmationToken token = new ConfirmationToken("token", usuario);
        token.setExpiryDate(LocalDateTime.now().plusHours(1));

        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        doNothing().when(confirmationTokenRepository).delete(any(ConfirmationToken.class));

        assertDoesNotThrow(() -> authService.confirmEmail("token"));

        // Verificar se o usuário foi ativado
        assertTrue(usuario.isAtivo());
        // Verificar se o repositório foi chamado para salvar o usuário
        verify(usuarioRepository).save(usuario);
        // Verificar se o token foi deletado
        verify(confirmationTokenRepository).delete(token);
    }

    @Test
    void testConfirmEmailTokenExpired() {
        Usuario usuario = new Usuario();
        ConfirmationToken token = new ConfirmationToken("token", usuario);
        token.setExpiryDate(LocalDateTime.now().minusHours(1));

        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));

        Exception ex = assertThrows(IllegalStateException.class, () -> authService.confirmEmail("token"));
        assertEquals("Token expirado", ex.getMessage());
    }

    @Test
    void testConfirmEmailTokenInvalid() {
        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        Exception ex = assertThrows(IllegalArgumentException.class, () -> authService.confirmEmail("token"));
        assertEquals("Token de confirmação inválido!", ex.getMessage());
    }

    @Test
    void testDeleteUserByEmailSuccess() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());

        when(usuarioService.findUsuarioByEmail(anyString())).thenReturn(usuario);
        doNothing().when(usuarioService).desativar(any(UUID.class));

        assertDoesNotThrow(() -> authService.deleteUserByEmail("email@test.com"));
    }

    @Test
    void testDeleteUserByEmailNotFound() {
        when(usuarioService.findUsuarioByEmail(anyString())).thenReturn(null);

        Exception ex = assertThrows(IllegalArgumentException.class, () -> authService.deleteUserByEmail("email@test.com"));
        assertEquals("Usuário não encontrado", ex.getMessage());
    }
}
