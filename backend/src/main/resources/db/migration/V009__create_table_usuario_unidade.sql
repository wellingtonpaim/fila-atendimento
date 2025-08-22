CREATE TABLE IF NOT EXISTS fila_atendimento.usuario_unidade (
    usuario_id UUID NOT NULL,
    unidade_atendimento_id UUID NOT NULL,
    PRIMARY KEY (usuario_id, unidade_atendimento_id),
    CONSTRAINT fk_usuario_unidade_usuario FOREIGN KEY (usuario_id)
        REFERENCES fila_atendimento.usuario (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_unidade_unidade FOREIGN KEY (unidade_atendimento_id)
        REFERENCES fila_atendimento.unidade_atendimento (id)
        ON DELETE CASCADE
);
