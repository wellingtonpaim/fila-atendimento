INSERT INTO fila_atendimento.usuario (
    nome_usuario,
    email,
    senha,
    categoria,
    ativo
) VALUES (
    'Wellington',
    'paim.wellington@gmail.com',
    '$2a$10$3y.mPSm4gS2T5s1S.hC1eO6.hzTVdp7x2mHIp5wWwhjpVw6sHhC2q',
    'ADMINISTRADOR',
    TRUE
) ON CONFLICT (email) DO NOTHING;
