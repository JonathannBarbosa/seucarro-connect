-- Adiciona flag de administrador na tabela profiles
-- Admins têm acesso irrestrito a todas as features, independente do plano

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Marcar admin principal do projeto
UPDATE profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'jonathan.azevedo@inbix.com.br'
  LIMIT 1
);
