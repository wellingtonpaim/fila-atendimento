CREATE TABLE IF NOT EXISTS fila_atendimento.usuario (
    usuario_id UUID PRIMARY KEY,
    nome_usuario VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),
    categoria VARCHAR(50),
    ativo BOOLEAN DEFAULT FALSE
    );
