CREATE TABLE IF NOT EXISTS fila_atendimento.painel (
    painel_id UUID PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    unidade_atendimento_id UUID NOT NULL,
    CONSTRAINT fk_painel_unidade FOREIGN KEY (unidade_atendimento_id)
    REFERENCES fila_atendimento.unidade_atendimento (unidade_atendimento_id)
    );
