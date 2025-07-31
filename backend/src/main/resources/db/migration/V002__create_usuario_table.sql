CREATE TABLE IF NOT EXISTS fila_atendimento.usuario (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_usuario VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    categoria VARCHAR(50),
    ativo BOOLEAN DEFAULT FALSE
    );