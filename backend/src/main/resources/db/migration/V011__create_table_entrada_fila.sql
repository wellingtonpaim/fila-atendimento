CREATE TABLE IF NOT EXISTS fila_atendimento.entrada_fila (
    entrada_fila_id UUID PRIMARY KEY,
    data_hora_entrada TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    cliente_cpf VARCHAR(14) NOT NULL,
    fila_atendimento_id UUID NOT NULL,

    CONSTRAINT fk_entrada_cliente FOREIGN KEY (cliente_cpf)
    REFERENCES fila_atendimento.cliente (cpf),
    CONSTRAINT fk_entrada_fila FOREIGN KEY (fila_atendimento_id)
    REFERENCES fila_atendimento.fila_atendimento (fila_atendimento_id)
    );
