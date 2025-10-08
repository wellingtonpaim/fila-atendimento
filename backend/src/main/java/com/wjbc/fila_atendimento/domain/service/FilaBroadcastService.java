package com.wjbc.fila_atendimento.domain.service;

import java.util.UUID;

public interface FilaBroadcastService {

    void broadcastPainelPublicoUpdate(UUID painelId, Object payload);
    void broadcastFilaProfissionalUpdate(UUID setorId, Object payload);
}
