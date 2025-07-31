CREATE TABLE IF NOT EXISTS fila_atendimento.fila_atendimento (
    fila_atendimento_id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    setor_id UUID NOT NULL,
    unidade_atendimento_id UUID NOT NULL,
    CONSTRAINT fk_fila_setor FOREIGN KEY (setor_id)
    REFERENCES fila_atendimento.setor (setor_id),
    CONSTRAINT fk_fila_unidade FOREIGN KEY (unidade_atendimento_id)
    REFERENCES fila_atendimento.unidade_atendimento (unidade_atendimento_id)
    );
