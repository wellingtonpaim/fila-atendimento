package com.wjbc.fila_atendimento.domain.service;

import java.util.UUID;

public interface FilaBroadcastService {

    void broadcastPainelUpdate(UUID filaId, Object payload);
    void broadcastFilaUpdate(UUID setorId, Object payload);

}
