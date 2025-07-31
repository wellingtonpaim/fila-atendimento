CREATE TABLE unidade_atendimento (
                                     unidade_atendimento_id UUID PRIMARY KEY,
                                     nome VARCHAR(255),

    -- Campos do Endereco (Embeddable)
                                     cep VARCHAR(20),
                                     logradouro VARCHAR(255),
                                     numero VARCHAR(50),
                                     complemento VARCHAR(255),
                                     bairro VARCHAR(100),
                                     cidade VARCHAR(100),
                                     uf VARCHAR(2)
);

CREATE TABLE unidade_atendimento_telefones (
                                               unidade_atendimento_id UUID NOT NULL,
                                               tipo VARCHAR(20),  -- Enum TipoTelefone (FIXO, CELULAR)
                                               numero VARCHAR(20),
                                               CONSTRAINT fk_unidade_telefone FOREIGN KEY (unidade_atendimento_id)
                                                   REFERENCES unidade_atendimento(unidade_atendimento_id)
                                                   ON DELETE CASCADE
);