package com.wjbc.fila_atendimento.service;


import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;

public interface EmailSenderService {
    void sendEmail(EmailRequestDTO emailRequest);
}

