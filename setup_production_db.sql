-- ================================================
-- SQL PARA CONFIGURAR BANCO DE DADOS DE PRODUÇÃO
-- ================================================
-- Execute este SQL no Console do D1 no Cloudflare Dashboard
-- Acesse: Dashboard → D1 → feedback-production → Console

-- 1. CRIAR TABELA DE FEEDBACKS
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('que_bom', 'que_pena', 'que_tal')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_category_date ON feedbacks(category, created_at);

-- 3. INSERIR DADOS DE EXEMPLO (OPCIONAL)
INSERT OR IGNORE INTO feedbacks (category, content, created_at) VALUES 
  ('que_bom', 'Excelente comunicação entre os membros da equipe.', datetime('now', '-5 days')),
  ('que_bom', 'Entregas realizadas dentro do prazo estabelecido.', datetime('now', '-4 days')),
  ('que_bom', 'Ambiente colaborativo e respeitoso.', datetime('now', '-3 days')),
  ('que_pena', 'Falta de documentação em algumas partes do projeto.', datetime('now', '-5 days')),
  ('que_pena', 'Reuniões muito longas sem objetivos claros.', datetime('now', '-2 days')),
  ('que_pena', 'Pouca integração entre diferentes áreas.', datetime('now', '-1 day')),
  ('que_tal', 'Implementar reuniões diárias mais curtas e objetivas.', datetime('now', '-4 days')),
  ('que_tal', 'Criar um canal de comunicação mais ágil.', datetime('now', '-3 days')),
  ('que_tal', 'Fazer treinamentos sobre novas tecnologias.', datetime('now', '-1 day'));

-- 4. VERIFICAR SE FUNCIONOU
SELECT COUNT(*) as total_feedbacks FROM feedbacks;
SELECT category, COUNT(*) as count FROM feedbacks GROUP BY category;

-- ================================================
-- PRONTO! O banco está configurado.
-- Agora vincule ao projeto Pages:
-- Settings → Functions → D1 database bindings → Add binding
-- Variable name: DB
-- D1 database: feedback-production
-- ================================================
