INSERT INTO fila_atendimento.usuario_unidade (
    usuario_id,
    unidade_atendimento_id
) VALUES (
             '70729020-e065-419d-808a-4d7afbaec8ad',
             'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
         ) ON CONFLICT (usuario_id, unidade_atendimento_id) DO NOTHING;