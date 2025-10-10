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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.TemplateEngine;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UsuarioService usuarioService;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ConfirmationTokenRepository confirmationTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private EmailSenderService emailSenderService;
    @Mock
    private TemplateEngine templateEngine;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Stub do template para evitar NPE no envio assíncrono de e-mail
        when(templateEngine.process(anyString(), any())).thenReturn("<html>ok</html>");
        authService = new AuthService(
                usuarioService,
                usuarioRepository,
                confirmationTokenRepository,
                passwordResetTokenRepository,
                new ConcurrentHashMap<>() {{ put("gmailSmtpService", emailSenderService); }},
                "gmailSmtpService",
                templateEngine,
                passwordEncoder
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

    // ===== Novos testes: recuperação de senha =====

    @Test
    void testSolicitarRedefinicaoSenhaUsuarioInexistenteNaoFazNada() {
        when(usuarioRepository.findByEmail(eq("inexistente@test.com"))).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.solicitarRedefinicaoSenha("inexistente@test.com"));

        verify(passwordResetTokenRepository, never()).deleteByUsuario(any());
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailSenderService, never()).sendEmail(any());
    }

    @Test
    void testSolicitarRedefinicaoSenhaUsuarioInativoNaoFazNada() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setAtivo(false);
        when(usuarioRepository.findByEmail(eq("inativo@test.com"))).thenReturn(Optional.of(usuario));

        assertDoesNotThrow(() -> authService.solicitarRedefinicaoSenha("inativo@test.com"));

        verify(passwordResetTokenRepository, never()).deleteByUsuario(any());
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailSenderService, never()).sendEmail(any());
    }

    @Test
    void testSolicitarRedefinicaoSenhaUsuarioAtivoGeraTokenEEnviaEmail() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setAtivo(true);
        when(usuarioRepository.findByEmail(eq("ativo@test.com"))).thenReturn(Optional.of(usuario));

        assertDoesNotThrow(() -> authService.solicitarRedefinicaoSenha("ativo@test.com"));

        verify(passwordResetTokenRepository).deleteByUsuario(eq(usuario));
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailSenderService).sendEmail(any(EmailRequestDTO.class));
    }

    @Test
    void testRedefinirSenhaComTokenValidoAtualizaSenhaERevogaTokens() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        PasswordResetToken prt = new PasswordResetToken("tokenValido", usuario);
        prt.setExpiryDate(LocalDateTime.now().plusMinutes(30));

        when(passwordResetTokenRepository.findByToken(eq("tokenValido"))).thenReturn(Optional.of(prt));
        when(passwordEncoder.encode(eq("NovaSenha@123"))).thenReturn("encoded");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        assertDoesNotThrow(() -> authService.redefinirSenha("tokenValido", "NovaSenha@123"));

        assertEquals("encoded", usuario.getSenha());
        verify(usuarioRepository).save(eq(usuario));
        verify(passwordResetTokenRepository).deleteByUsuario(eq(usuario));
    }

    @Test
    void testRedefinirSenhaComTokenExpiradoLancaExcecao() {
        Usuario usuario = new Usuario();
        PasswordResetToken prt = new PasswordResetToken("tokenExpirado", usuario);
        prt.setExpiryDate(LocalDateTime.now().minusMinutes(1));

        when(passwordResetTokenRepository.findByToken(eq("tokenExpirado"))).thenReturn(Optional.of(prt));

        Exception ex = assertThrows(IllegalStateException.class, () -> authService.redefinirSenha("tokenExpirado", "Qualquer123@"));
        assertEquals("Token expirado", ex.getMessage());
    }

    @Test
    void testRedefinirSenhaComTokenInvalidoLancaExcecao() {
        when(passwordResetTokenRepository.findByToken(eq("invalido"))).thenReturn(Optional.empty());

        Exception ex = assertThrows(IllegalArgumentException.class, () -> authService.redefinirSenha("invalido", "Qualquer123@"));
        assertEquals("Token de redefinição inválido!", ex.getMessage());
    }

    @Test
    void testIsPasswordResetTokenValidoTrue() {
        Usuario usuario = new Usuario();
        PasswordResetToken prt = new PasswordResetToken("ok", usuario);
        prt.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        when(passwordResetTokenRepository.findByToken(eq("ok"))).thenReturn(Optional.of(prt));

        assertTrue(authService.isPasswordResetTokenValido("ok"));
    }

    @Test
    void testIsPasswordResetTokenValidoFalseQuandoExpirado() {
        Usuario usuario = new Usuario();
        PasswordResetToken prt = new PasswordResetToken("exp", usuario);
        prt.setExpiryDate(LocalDateTime.now().minusMinutes(10));
        when(passwordResetTokenRepository.findByToken(eq("exp"))).thenReturn(Optional.of(prt));

        assertFalse(authService.isPasswordResetTokenValido("exp"));
    }

    @Test
    void testIsPasswordResetTokenValidoFalseQuandoInexistente() {
        when(passwordResetTokenRepository.findByToken(eq("naoexiste"))).thenReturn(Optional.empty());
        assertFalse(authService.isPasswordResetTokenValido("naoexiste"));
    }
}
