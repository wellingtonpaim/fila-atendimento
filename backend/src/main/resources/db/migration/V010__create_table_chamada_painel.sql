CREATE TABLE IF NOT EXISTS fila_atendimento.chamada_painel (
    id UUID PRIMARY KEY,
    data_hora_chamada TIMESTAMP NOT NULL,
    codigo_paciente VARCHAR(20) NOT NULL,
    guiche_ou_sala VARCHAR(100),
    fila_id UUID NOT NULL,
    painel_id UUID NOT NULL,
    setor_id UUID NOT NULL,
    unidade_id UUID NOT NULL,

    CONSTRAINT fk_chamada_fila FOREIGN KEY (fila_id)
    REFERENCES fila_atendimento.fila (fila_id),

    CONSTRAINT fk_chamada_painel FOREIGN KEY (painel_id)
    REFERENCES fila_atendimento.painel (painel_id),

    CONSTRAINT fk_chamada_setor FOREIGN KEY (setor_id)
    REFERENCES fila_atendimento.setor (setor_id),

    CONSTRAINT fk_chamada_unidade FOREIGN KEY (unidade_id)
    REFERENCES fila_atendimento.unidade_atendimento (unidade_atendimento_id)
    );
