-- Insert test users (compatível com H2 e PostgreSQL)
-- Password: Suporte@123 (bcrypt hash)

INSERT INTO usuario (nome, email, senha, tipo)
SELECT 'João Silva', 'usuario.demo@supportflow.com', '$2a$10$ybDVWH1qAYzySvuRMWHSXOsK27PzReGvRTEY2wWvnCe/lilG5JZK2', 'USUARIO'
WHERE NOT EXISTS (
	SELECT 1 FROM usuario WHERE email = 'usuario.demo@supportflow.com'
);

INSERT INTO usuario (nome, email, senha, tipo, setor_atendimento)
SELECT 'Maria Técnica', 'tecnico.demo@supportflow.com', '$2a$10$ybDVWH1qAYzySvuRMWHSXOsK27PzReGvRTEY2wWvnCe/lilG5JZK2', 'TECNICO', 'Service Desk'
WHERE NOT EXISTS (
	SELECT 1 FROM usuario WHERE email = 'tecnico.demo@supportflow.com'
);

INSERT INTO usuario (nome, email, senha, tipo, setor_atendimento)
SELECT 'Carlos Técnico', 'tecnico2.demo@supportflow.com', '$2a$10$ybDVWH1qAYzySvuRMWHSXOsK27PzReGvRTEY2wWvnCe/lilG5JZK2', 'TECNICO', 'Service Desk'
WHERE NOT EXISTS (
	SELECT 1 FROM usuario WHERE email = 'tecnico2.demo@supportflow.com'
);

INSERT INTO usuario (nome, email, senha, tipo)
SELECT 'Pedro Gestor', 'gestor.demo@supportflow.com', '$2a$10$ybDVWH1qAYzySvuRMWHSXOsK27PzReGvRTEY2wWvnCe/lilG5JZK2', 'GESTOR'
WHERE NOT EXISTS (
	SELECT 1 FROM usuario WHERE email = 'gestor.demo@supportflow.com'
);

-- Fix chamados que ficaram com is_deleted = NULL após migração da coluna
UPDATE chamado SET is_deleted = false WHERE is_deleted IS NULL;
