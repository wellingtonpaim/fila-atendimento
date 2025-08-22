CREATE TABLE IF NOT EXISTS fila_atendimento.cliente (
    id UUID PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    cep VARCHAR(20),
    logradouro VARCHAR(255),
    numero VARCHAR(50),
    complemento VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    ativo BOOLEAN DEFAULT TRUE NOT NULL
);
