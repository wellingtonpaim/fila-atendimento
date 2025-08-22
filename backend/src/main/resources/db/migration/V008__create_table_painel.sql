CREATE TABLE IF NOT EXISTS fila_atendimento.painel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao VARCHAR(255) NOT NULL,
    unidade_atendimento_id UUID NOT NULL,
    CONSTRAINT fk_painel_unidade FOREIGN KEY (unidade_atendimento_id)
        REFERENCES fila_atendimento.unidade_atendimento (id)
);
