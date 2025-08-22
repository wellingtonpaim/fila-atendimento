CREATE TABLE IF NOT EXISTS fila_atendimento.setor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT TRUE NOT NULL
);
