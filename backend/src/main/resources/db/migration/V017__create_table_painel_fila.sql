CREATE TABLE IF NOT EXISTS fila_atendimento.painel_fila (
    painel_id UUID NOT NULL,
    fila_id UUID NOT NULL,
    PRIMARY KEY (painel_id, fila_id),
    CONSTRAINT fk_painel_fila_painel FOREIGN KEY (painel_id)
        REFERENCES fila_atendimento.painel (id) ON DELETE CASCADE,
    CONSTRAINT fk_painel_fila_fila FOREIGN KEY (fila_id)
        REFERENCES fila_atendimento.fila (id) ON DELETE CASCADE
);
