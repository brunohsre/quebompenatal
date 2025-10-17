-- Dados de exemplo para testes
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
