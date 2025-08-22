INSERT INTO fila_atendimento.usuario (
    id,
    nome_usuario,
    email,
    senha,
    categoria,
    ativo
) VALUES (
    gen_random_uuid(),
    'Wellington',
    'paim.wellington@gmail.com',
    '$2a$10$yAR9.CAVgVh7vWPlK7cnmO0X1z4oTRqGLAlYz6DRIsVch7IuH8sL2',
    'ADMINISTRADOR',
    TRUE
) ON CONFLICT (email) DO NOTHING;
