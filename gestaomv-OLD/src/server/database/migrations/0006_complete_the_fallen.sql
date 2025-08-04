-- Migração para atualizar role "gerencia_almoxarifado" para "gerencia_almoxarifado"
-- Criada em: 2025-01-30

UPDATE user_roles 
SET role = 'gerencia_almoxarifado' 
WHERE role = 'gerencia_almoxarifado';