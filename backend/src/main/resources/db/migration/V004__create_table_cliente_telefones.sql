CREATE TABLE IF NOT EXISTS fila_atendimento.cliente_telefones (
    id UUID PRIMARY KEY,
    cliente_id UUID NOT NULL,
    tipo VARCHAR(20),
    ddd INTEGER NOT NULL,
    numero BIGINT NOT NULL,

    CONSTRAINT fk_cliente_telefones FOREIGN KEY (cliente_id)
    REFERENCES fila_atendimento.cliente (id) ON DELETE CASCADE
    );
