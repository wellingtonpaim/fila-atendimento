package com.wjbc.fila_atendimento.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wjbc.fila_atendimento.controller.FilaWebSocketController;

import java.util.UUID;

@Service
public class FilaBroadcastService {
    @Autowired
    private FilaWebSocketController filaWebSocketController;

    public void broadcastPainelUpdate(UUID filaId, Object payload) {
        filaWebSocketController.sendPainelUpdate(filaId, payload);
    }

    public void broadcastFilaUpdate(UUID setorId, Object payload) {
        filaWebSocketController.sendFilaUpdate(setorId, payload);
    }
}
