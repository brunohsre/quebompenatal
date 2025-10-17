# 🧪 Guia de Testes - Feedback Anônimo

## 📋 Checklist de Funcionalidades

### ✅ Página de Coleta de Feedbacks

**URL**: https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/

**Testes a Realizar:**

1. **Layout e Design**
   - [ ] Verificar se o cabeçalho exibe "Feedback Anônimo" com ícone
   - [ ] Confirmar que as 3 cards explicativas aparecem (Que Bom, Que Pena, Que Tal)
   - [ ] Validar que o link "Acessar Dashboard" está visível no topo
   - [ ] Verificar responsividade em diferentes tamanhos de tela

2. **Formulário de Feedback**
   - [ ] Selecionar cada categoria (Que Bom, Que Pena, Que Tal)
   - [ ] Confirmar que a categoria selecionada fica destacada
   - [ ] Testar o contador de caracteres (deve atualizar conforme digita)
   - [ ] Validar feedback curto (< 10 caracteres) - deve exibir erro
   - [ ] Validar feedback longo (> 1000 caracteres) - deve exibir erro
   - [ ] Enviar feedback válido - deve exibir mensagem de sucesso verde
   - [ ] Confirmar que o formulário limpa após envio bem-sucedido
   - [ ] Tentar enviar sem selecionar categoria - deve exibir erro

3. **Avisos de Privacidade**
   - [ ] Verificar se o aviso de anonimato está visível
   - [ ] Confirmar texto sobre não rastreamento de IP e cookies

### ✅ Dashboard de Análise

**URL**: https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/dashboard

**Testes a Realizar:**

1. **Header e Navegação**
   - [ ] Verificar título "Dashboard de Feedbacks"
   - [ ] Testar botão "Voltar" (deve redirecionar para /)
   - [ ] Testar botão "Exportar" (deve aparecer popup de escolha)

2. **Cards de Estatísticas**
   - [ ] Verificar se o card "Total" exibe número correto
   - [ ] Validar contador "Que Bom" (verde)
   - [ ] Validar contador "Que Pena" (amarelo)
   - [ ] Validar contador "Que Tal" (azul)
   - [ ] Confirmar que os ícones aparecem em cada card

3. **Gráfico de Pizza (Distribuição)**
   - [ ] Verificar se o gráfico renderiza corretamente
   - [ ] Confirmar cores: Verde (Que Bom), Amarelo (Que Pena), Azul (Que Tal)
   - [ ] Testar hover nos segmentos (deve mostrar tooltip)
   - [ ] Verificar legenda na parte inferior

4. **Gráfico de Linha (Temporal)**
   - [ ] Verificar se o gráfico renderiza corretamente
   - [ ] Confirmar que o eixo X mostra datas (formato DD/MM)
   - [ ] Confirmar que o eixo Y mostra quantidade de feedbacks
   - [ ] Testar hover nos pontos (deve mostrar tooltip)
   - [ ] Validar que mostra últimos 30 dias

5. **Filtros por Categoria**
   - [ ] Clicar em "Todos" - deve mostrar todos os feedbacks
   - [ ] Clicar em "Que Bom" - deve filtrar apenas feedbacks positivos
   - [ ] Clicar em "Que Pena" - deve filtrar apenas feedbacks negativos
   - [ ] Clicar em "Que Tal" - deve filtrar apenas sugestões
   - [ ] Confirmar que cada filtro atualiza a lista em tempo real

6. **Lista de Feedbacks**
   - [ ] Verificar se feedbacks aparecem em ordem cronológica (mais recentes primeiro)
   - [ ] Confirmar que cada feedback mostra:
     - Categoria com ícone e badge colorido
     - Conteúdo completo do feedback
     - Data e hora de envio
   - [ ] Validar cores das bordas: verde, amarelo, azul

7. **Exportação de Dados**
   - [ ] Clicar em "Exportar" e escolher "OK" (CSV)
   - [ ] Confirmar que arquivo CSV baixa automaticamente
   - [ ] Abrir CSV e validar formato: ID, Categoria, Conteúdo, Data
   - [ ] Clicar em "Exportar" e escolher "Cancelar" (JSON)
   - [ ] Confirmar que arquivo JSON baixa automaticamente
   - [ ] Abrir JSON e validar estrutura de array com objetos

### ✅ APIs REST

**Ferramentas**: Use `curl` ou Postman/Insomnia

1. **GET /api/stats**
   ```bash
   curl https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/api/stats
   ```
   - [ ] Verificar resposta JSON com campos: total, by_category, daily
   - [ ] Validar que `by_category` é um array com 3 objetos
   - [ ] Validar que `daily` mostra histórico dos últimos 30 dias

2. **GET /api/feedbacks**
   ```bash
   curl https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/api/feedbacks?limit=5
   ```
   - [ ] Verificar resposta JSON com campos: feedbacks, count
   - [ ] Validar que `feedbacks` é um array
   - [ ] Testar paginação: `?limit=5&offset=5`
   - [ ] Testar filtro: `?category=que_bom`

3. **POST /api/feedbacks**
   ```bash
   curl -X POST https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/api/feedbacks \
     -H "Content-Type: application/json" \
     -d '{"category":"que_bom","content":"Teste de feedback via API - Excelente ferramenta!"}'
   ```
   - [ ] Verificar status 201 Created
   - [ ] Validar resposta com campos: success, id, message
   - [ ] Testar erro com categoria inválida (deve retornar 400)
   - [ ] Testar erro com conteúdo muito curto (deve retornar 400)

4. **GET /api/export**
   ```bash
   curl https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/api/export?format=json -o feedbacks.json
   ```
   - [ ] Verificar que arquivo JSON foi baixado
   - [ ] Testar formato CSV: `?format=csv`
   - [ ] Testar filtro por categoria: `?format=json&category=que_tal`

### ✅ Testes de Segurança e Validação

1. **Validação de Entrada**
   - [ ] Tentar enviar HTML/script tags no conteúdo
   - [ ] Confirmar que não há execução de JavaScript (XSS)
   - [ ] Tentar SQL injection no conteúdo
   - [ ] Confirmar que prepared statements protegem o banco

2. **Anonimato**
   - [ ] Verificar que não há campo de identificação no formulário
   - [ ] Inspecionar requests no DevTools (não deve enviar cookies, IPs)
   - [ ] Consultar banco de dados e confirmar ausência de dados pessoais

3. **Limites e Rate Limiting**
   - [ ] Enviar múltiplos feedbacks rapidamente
   - [ ] Confirmar que todos são aceitos (sem rate limit local)
   - [ ] Em produção, Cloudflare aplica rate limiting automaticamente

### ✅ Testes de Responsividade

**Dispositivos a Testar:**

1. **Desktop** (1920x1080)
   - [ ] Layout completo em 2 colunas nos gráficos
   - [ ] Cards de estatísticas em 4 colunas
   - [ ] Formulário centralizado e legível

2. **Tablet** (768x1024)
   - [ ] Layout ajusta para 1 coluna nos gráficos
   - [ ] Cards de estatísticas em 2 colunas
   - [ ] Formulário mantém usabilidade

3. **Mobile** (375x667)
   - [ ] Layout em coluna única
   - [ ] Cards de estatísticas em 1 coluna
   - [ ] Botões e campos com tamanho adequado para toque
   - [ ] Gráficos renderizam corretamente e são interativos

### ✅ Testes de Performance

1. **Tempo de Carregamento**
   - [ ] Página inicial carrega em < 2s
   - [ ] Dashboard carrega em < 3s
   - [ ] APIs respondem em < 500ms

2. **Banco de Dados**
   - [ ] Consultas com 100+ feedbacks executam rapidamente
   - [ ] Índices funcionam corretamente (verificar EXPLAIN QUERY PLAN)

### ✅ Testes de Usabilidade

1. **Fluxo do Usuário - Participante**
   - [ ] Acessa a página inicial
   - [ ] Entende imediatamente o propósito (cabeçalho e cards explicativos)
   - [ ] Seleciona uma categoria facilmente
   - [ ] Escreve feedback sem confusão
   - [ ] Recebe confirmação clara de envio
   - [ ] Tempo total: < 2 minutos

2. **Fluxo do Usuário - Gestor**
   - [ ] Acessa o dashboard
   - [ ] Visualiza estatísticas rapidamente (< 5 segundos)
   - [ ] Filtra feedbacks por categoria
   - [ ] Identifica tendências nos gráficos
   - [ ] Exporta dados para análise externa
   - [ ] Tempo total: < 5 minutos

## 🐛 Reporte de Bugs

Se encontrar problemas, anote:
- **URL**: Onde ocorreu o erro
- **Ação**: O que você estava fazendo
- **Resultado Esperado**: O que deveria acontecer
- **Resultado Obtido**: O que aconteceu
- **Navegador/Dispositivo**: Chrome 120, iPhone 13, etc.
- **Screenshot**: Se possível

## ✨ Feedback sobre a Ferramenta

Após testar, considere:
- A interface é intuitiva?
- As cores e ícones ajudam na compreensão?
- O dashboard fornece insights úteis?
- A exportação atende às necessidades de análise?
- Sugestões de melhorias?

---

**Status dos Testes**: ⏳ Aguardando validação do usuário

**Última Atualização**: 2025-10-17
