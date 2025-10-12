ALTER TABLE fila_atendimento.entrada_fila
    ADD COLUMN IF NOT EXISTS motivo_cancelamento VARCHAR(500);

