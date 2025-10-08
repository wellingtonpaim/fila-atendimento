package com.wjbc.fila_atendimento.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class FilaWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendPainelPublicoUpdate(UUID painelId, Object payload) {
        messagingTemplate.convertAndSend("/topic/painel-publico/" + painelId, payload);
    }

    public void sendFilaProfissionalUpdate(UUID setorId, Object payload) {
        messagingTemplate.convertAndSend("/topic/fila/" + setorId, payload);
    }
}
