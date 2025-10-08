package com.wjbc.fila_atendimento.domain.service.impl;

import com.wjbc.fila_atendimento.controller.FilaWebSocketController;
import com.wjbc.fila_atendimento.domain.service.FilaBroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FilaBroadcastServiceImpl implements FilaBroadcastService {

    private final FilaWebSocketController filaWebSocketController;

    @Override
    public void broadcastPainelPublicoUpdate(UUID painelId, Object payload) {
        filaWebSocketController.sendPainelPublicoUpdate(painelId, payload);
    }

    @Override
    public void broadcastFilaProfissionalUpdate(UUID setorId, Object payload) {
        filaWebSocketController.sendFilaProfissionalUpdate(setorId, payload);
    }

}
