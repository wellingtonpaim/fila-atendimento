package com.wjbc.fila_atendimento.controller;

import com.wjbc.fila_atendimento.domain.dto.ApiResponse;
import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import com.wjbc.fila_atendimento.domain.service.EmailSenderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailSenderControllerTest {
    @Mock
    private EmailSenderService emailSenderService;
    @InjectMocks
    private EmailSenderController emailSenderController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void enviarEmail_sucesso() {
        EmailRequestDTO dto = new EmailRequestDTO("destinatario@email.com", "Assunto", "Mensagem", null);
        doNothing().when(emailSenderService).sendEmail(dto);
        ResponseEntity<ApiResponse<Void>> response = emailSenderController.enviarEmail(dto);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertNull(response.getBody().getData());
    }

    @Test
    void enviarEmail_erro() {
        EmailRequestDTO dto = new EmailRequestDTO("destinatario@email.com", "Assunto", "Mensagem", null);
        doThrow(new RuntimeException("Falha ao enviar e-mail")).when(emailSenderService).sendEmail(dto);
        Exception exception = assertThrows(RuntimeException.class, () -> emailSenderController.enviarEmail(dto));
        assertEquals("Falha ao enviar e-mail", exception.getMessage());
    }
}
