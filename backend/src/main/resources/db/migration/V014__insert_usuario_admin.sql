INSERT INTO fila_atendimento.usuario (
    id,
    nome_usuario,
    email,
    senha,
    categoria,
    ativo
) VALUES (
    '70729020-e065-419d-808a-4d7afbaec8ad',    -- UUID Fixo para consistência nos testes
    'Wellington',
    'paim.wellington@gmail.com',
    '$2a$10$yainDRJBbIFcUZbtFl5/reS2DRy3qxSwHHJgrm0myohcFT/e/0Bn.',
    'ADMINISTRADOR',
    TRUE
) ON CONFLICT (email) DO NOTHING;
