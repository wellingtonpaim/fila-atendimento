CREATE TABLE IF NOT EXISTS fila_atendimento.cliente_telefones (
    cliente_cpf VARCHAR(14) NOT NULL,
    tipo VARCHAR(20),
    ddd INTEGER NOT NULL,
    numero BIGINT NOT NULL,

    CONSTRAINT fk_cliente_telefones FOREIGN KEY (cliente_cpf)
    REFERENCES fila_atendimento.cliente (cpf) ON DELETE CASCADE
    );
