package com.wjbc.fila_atendimento.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class FilaWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Envia atualização para painel público
    public void sendPainelUpdate(UUID filaId, Object payload) {
        messagingTemplate.convertAndSend("/topic/painel/" + filaId, payload);
    }

    // Envia atualização para painel do profissional
    public void sendFilaUpdate(UUID setorId, Object payload) {
        messagingTemplate.convertAndSend("/topic/fila/" + setorId, payload);
    }
}
