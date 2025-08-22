CREATE TABLE IF NOT EXISTS fila_atendimento.fila (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    setor_id UUID NOT NULL,
    unidade_atendimento_id UUID NOT NULL,
    CONSTRAINT fk_fila_setor FOREIGN KEY (setor_id)
        REFERENCES fila_atendimento.setor (id),
    CONSTRAINT fk_fila_unidade FOREIGN KEY (unidade_atendimento_id)
        REFERENCES fila_atendimento.unidade_atendimento (id),
    CONSTRAINT uk_fila_nome_unidade UNIQUE (nome, unidade_atendimento_id)
);
