CREATE TABLE IF NOT EXISTS fila_atendimento.unidade_atendimento (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    cep VARCHAR(20),
    logradouro VARCHAR(255),
    numero VARCHAR(50),
    complemento VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    ativo BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS fila_atendimento.unidade_atendimento_telefones (
    id UUID PRIMARY KEY,
    unidade_atendimento_id UUID NOT NULL,
    tipo VARCHAR(20),
    ddd INTEGER NOT NULL,
    numero BIGINT NOT NULL,
    CONSTRAINT fk_unidade_telefone FOREIGN KEY (unidade_atendimento_id)
    REFERENCES fila_atendimento.unidade_atendimento(id)
    ON DELETE CASCADE
);
