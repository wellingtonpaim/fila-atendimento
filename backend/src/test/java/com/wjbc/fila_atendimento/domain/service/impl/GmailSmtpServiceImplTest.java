package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class GmailSmtpServiceImplTest {
    @Mock
    private JavaMailSender mailSender;
    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private GmailSmtpServiceImpl gmailSmtpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendEmailSuccess() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));
        EmailRequestDTO emailRequest = new EmailRequestDTO("Assunto", "Corpo", "destino@test.com", "origem@test.com");
        assertDoesNotThrow(() -> gmailSmtpService.sendEmail(emailRequest));
    }

    @Test
    void testSendEmailMessagingException() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Falha no envio")).when(mailSender).send(any(MimeMessage.class));
        EmailRequestDTO emailRequest = new EmailRequestDTO("Assunto", "Corpo", "destino@test.com", "origem@test.com");
        Exception ex = assertThrows(RuntimeException.class, () -> gmailSmtpService.sendEmail(emailRequest));
        assertTrue(ex.getMessage().contains("Erro ao enviar e-mail com Gmail SMTP"));
    }
}
