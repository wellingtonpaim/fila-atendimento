CREATE TABLE IF NOT EXISTS fila_atendimento.confirmation_token (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,

    CONSTRAINT fk_confirmation_token_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES fila_atendimento.usuario (id)
    ON DELETE CASCADE
    );