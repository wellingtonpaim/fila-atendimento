INSERT INTO fila_atendimento.unidade_atendimento (
    id,
    nome,
    ativo
) VALUES (
             'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID Fixo para consistência nos testes
             'Unidade Padrao',
             TRUE
         ) ON CONFLICT (id) DO NOTHING;