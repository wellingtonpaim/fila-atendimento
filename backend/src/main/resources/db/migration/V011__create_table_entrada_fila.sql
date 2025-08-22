CREATE TABLE IF NOT EXISTS fila_atendimento.entrada_fila (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fila_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    prioridade BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(20) NOT NULL,
    retorno BOOLEAN DEFAULT FALSE NOT NULL,
    data_hora_entrada TIMESTAMP NOT NULL,
    data_hora_chamada TIMESTAMP,
    data_hora_saida TIMESTAMP,
    usuario_responsavel_id UUID,
    guiche_ou_sala_atendimento VARCHAR(100),
    CONSTRAINT fk_entrada_fila FOREIGN KEY (fila_id)
        REFERENCES fila_atendimento.fila (id),
    CONSTRAINT fk_entrada_cliente FOREIGN KEY (cliente_id)
        REFERENCES fila_atendimento.cliente (id),
    CONSTRAINT fk_entrada_usuario FOREIGN KEY (usuario_responsavel_id)
        REFERENCES fila_atendimento.usuario (id)
);
