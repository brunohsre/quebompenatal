# 💬 Feedback Anônimo - Que Bom, Que Pena, Que Tal

## 📋 Visão Geral

Ferramenta completa de coleta e análise de feedbacks anônimos, desenvolvida para facilitar a comunicação transparente em equipes e organizações. O sistema garante 100% de anonimato, permitindo que participantes compartilhem opiniões sinceras sobre o trabalho realizado e sugestões para o futuro.

## 🎯 Objetivos

- **Coleta Anônima**: Sistema totalmente anônimo que não rastreia IP, cookies ou dados de identificação
- **Retrospectiva Estruturada**: Framework "Que Bom, Que Pena, Que Tal" para feedback organizado
- **Análise Visual**: Dashboard interativo com gráficos e estatísticas em tempo real
- **Exportação de Dados**: Capacidade de exportar feedbacks em JSON/CSV para análise externa

## 🌐 URLs de Acesso

- **🔗 Aplicação (Sandbox)**: https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai
- **📝 Formulário de Coleta**: https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/
- **📊 Dashboard Administrativo**: https://3000-i7eh6xypmiuuuw3jeacqi-a402f90a.sandbox.novita.ai/dashboard

## ✨ Funcionalidades Implementadas

### 1️⃣ Interface de Coleta de Feedbacks
✅ **Completo**
- Formulário simples e intuitivo com 3 categorias
- Validação de conteúdo (mínimo 10, máximo 1000 caracteres)
- Contador de caracteres em tempo real
- Mensagens de confirmação após envio
- Design responsivo para mobile e desktop
- Ícones visuais para cada categoria (😊 😕 💡)
- Avisos claros sobre anonimato e privacidade

### 2️⃣ Dashboard de Análise
✅ **Completo**
- **Estatísticas em cards**: Total de feedbacks e contadores por categoria
- **Gráfico de Pizza**: Distribuição proporcional entre categorias
- **Gráfico de Linha**: Evolução temporal dos feedbacks (últimos 30 dias)
- **Lista de Feedbacks**: Visualização completa com categorização colorida
- **Filtros Dinâmicos**: Filtrar por categoria (Todos/Que Bom/Que Pena/Que Tal)
- **Timestamps**: Data e hora de cada feedback

### 3️⃣ Sistema de Exportação
✅ **Completo**
- Exportação em formato **JSON** (estruturado para análise programática)
- Exportação em formato **CSV** (compatível com Excel/Sheets)
- Filtros opcionais por categoria
- Download automático de arquivos

### 4️⃣ APIs RESTful
✅ **Completo**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/feedbacks` | Criar novo feedback anônimo |
| GET | `/api/feedbacks` | Listar feedbacks (com paginação e filtros) |
| GET | `/api/stats` | Obter estatísticas agregadas |
| GET | `/api/export?format=json` | Exportar todos os feedbacks em JSON |
| GET | `/api/export?format=csv` | Exportar todos os feedbacks em CSV |
| DELETE | `/api/feedbacks/:id` | Remover feedback específico |

## 🏗️ Arquitetura Técnica

### Stack de Tecnologias

**Backend:**
- **Hono Framework** - Framework web leve e rápido
- **Cloudflare Workers** - Runtime edge para baixa latência
- **D1 Database** - SQLite distribuído globalmente
- **TypeScript** - Tipagem estática e segurança

**Frontend:**
- **TailwindCSS** - Framework CSS utilitário via CDN
- **Chart.js** - Biblioteca de gráficos interativos
- **Axios** - Cliente HTTP para APIs
- **Font Awesome** - Ícones vetoriais

### Modelo de Dados

```sql
CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('que_bom', 'que_pena', 'que_tal')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_feedbacks_category ON feedbacks(category);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX idx_feedbacks_category_date ON feedbacks(category, created_at);
```

**Garantias de Anonimato:**
- ❌ Sem coluna de user_id ou user_ip
- ❌ Sem cookies de sessão
- ❌ Sem rastreamento de navegador
- ✅ Apenas: categoria, conteúdo e timestamp

## 📱 Guia do Usuário

### Para Participantes (Envio de Feedback)

1. **Acesse o formulário**: Abra a URL principal da aplicação
2. **Escolha uma categoria**:
   - **😊 Que Bom**: Pontos positivos, conquistas, o que está funcionando bem
   - **😕 Que Pena**: Dificuldades, problemas, pontos que precisam melhorar
   - **💡 Que Tal**: Sugestões, ideias, propostas para o futuro
3. **Escreva seu feedback**: Mínimo 10 caracteres, seja específico e construtivo
4. **Envie anonimamente**: Clique em "Enviar Feedback Anônimo"
5. **Confirmação**: Receba mensagem de sucesso

**Dicas para feedback efetivo:**
- Seja específico e objetivo
- Foque em situações, não em pessoas
- Sugira soluções sempre que possível
- Seja respeitoso e construtivo

### Para Gestores/Facilitadores (Dashboard)

1. **Acesse o dashboard**: Vá para `/dashboard`
2. **Visualize estatísticas**: Cards no topo mostram contadores totais
3. **Analise distribuição**: Gráfico de pizza mostra proporção entre categorias
4. **Identifique tendências**: Gráfico de linha mostra evolução temporal
5. **Leia feedbacks**: Lista completa com filtros por categoria
6. **Exporte dados**: Botão "Exportar" para baixar em JSON ou CSV
7. **Análise externa**: Importe os dados em ferramentas de análise (Excel, Power BI, etc.)

## 🚀 Deploy e Instalação

### Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd webapp

# 2. Instalar dependências
npm install

# 3. Aplicar migrations do banco de dados
npm run db:migrate:local

# 4. Popular com dados de teste (opcional)
npm run db:seed

# 5. Build do projeto
npm run build

# 6. Iniciar servidor de desenvolvimento
npm run dev:sandbox

# 7. Acessar aplicação
# Navegue para http://localhost:3000
```

### Deploy para Cloudflare Pages

```bash
# 1. Configurar Cloudflare API Token
# Vá para: https://dash.cloudflare.com/profile/api-tokens
# Crie um token com permissões de Pages e D1

# 2. Criar banco de dados de produção
npx wrangler d1 create feedback-production

# 3. Atualizar wrangler.jsonc com o database_id retornado

# 4. Aplicar migrations em produção
npm run db:migrate:prod

# 5. Build e deploy
npm run deploy:prod

# 6. Acessar aplicação em produção
# URL fornecida pelo Cloudflare após deploy
```

### Variáveis de Ambiente

**Arquivo: `.dev.vars` (desenvolvimento local)**
```
# Não necessário - D1 local é automático
```

**Cloudflare Dashboard (produção)**
- Configure o binding `DB` para o D1 database em Settings > Functions

## 🔒 Segurança e Privacidade

### Garantias de Anonimato

1. **Sem identificação de usuário**:
   - Não há login ou autenticação
   - Não coletamos nomes, emails ou qualquer dado pessoal

2. **Sem rastreamento técnico**:
   - Não armazenamos endereços IP
   - Não utilizamos cookies de identificação
   - Não usamos fingerprinting de navegador

3. **Dados mínimos**:
   - Armazenamos apenas: categoria, conteúdo do feedback e timestamp
   - O timestamp é para análise temporal, não para identificação

4. **Conformidade LGPD/GDPR**:
   - Dados anônimos não são considerados dados pessoais
   - Sem necessidade de consentimento explícito
   - Sem direito de exclusão (dados não são identificáveis)

### Boas Práticas de Segurança

- ✅ Validação de entrada no backend (categoria, tamanho do conteúdo)
- ✅ Prepared statements (proteção contra SQL injection)
- ✅ CORS configurado para APIs
- ✅ Rate limiting via Cloudflare (proteção contra spam)
- ✅ HTTPS obrigatório em produção

## 📊 Casos de Uso

### 1. Retrospectivas de Sprint (Agile)
- Equipes compartilham o que funcionou bem, problemas encontrados e sugestões
- Dashboard mostra tendências ao longo das sprints

### 2. Avaliação de Projetos
- Stakeholders fornecem feedback anônimo sobre entregas
- Gestores identificam pontos fortes e áreas de melhoria

### 3. Clima Organizacional
- Colaboradores expressam satisfação e preocupações sem medo de retaliação
- RH analisa padrões e toma ações corretivas

### 4. Eventos e Treinamentos
- Participantes avaliam conteúdo, instrutor e organização
- Organizadores melhoram eventos futuros baseado em feedback real

### 5. Planejamento Estratégico
- Equipes contribuem com ideias para o futuro da organização
- Liderança identifica consensos e prioridades

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Vite dev server (sem D1)
npm run dev:sandbox      # Wrangler dev com D1 local
npm run build            # Build do projeto

# Banco de Dados
npm run db:migrate:local # Aplicar migrations localmente
npm run db:migrate:prod  # Aplicar migrations em produção
npm run db:seed          # Popular com dados de teste
npm run db:reset         # Resetar banco local (limpar + migrar + popular)

# Deploy
npm run deploy           # Deploy automático
npm run deploy:prod      # Deploy com nome do projeto

# Utilitários
npm run clean-port       # Liberar porta 3000
npm run test             # Testar servidor local
pm2 logs feedback-anonimo --nostream  # Ver logs
```

## 📈 Estatísticas Atuais

**Dados de exemplo carregados:**
- ✅ 9 feedbacks de teste
- ✅ 3 feedbacks por categoria (distribuição equilibrada)
- ✅ Dados dos últimos 5 dias para demonstração

## 🎨 Customização

### Cores por Categoria

```javascript
// Personalize no código (src/index.tsx)
const categoryColors = {
  'que_bom': 'green',    // Verde para positivo
  'que_pena': 'yellow',  // Amarelo para atenção
  'que_tal': 'blue'      // Azul para ideias
};
```

### Limites de Caracteres

```typescript
// Ajuste no backend (src/index.tsx)
if (content.trim().length < 10) { // Mínimo
  return c.json({ error: 'Feedback muito curto' }, 400)
}
if (content.length > 1000) { // Máximo
  return c.json({ error: 'Feedback muito longo' }, 400)
}
```

## 🔄 Próximos Passos Sugeridos

### Funcionalidades Futuras

1. **Análise de Sentimento**:
   - Integrar NLP para classificar automaticamente o tom dos feedbacks
   - Identificar padrões e temas recorrentes

2. **Notificações**:
   - Email/webhook quando novos feedbacks são recebidos
   - Alertas para feedback negativo crítico

3. **Múltiplas Campanhas**:
   - Permitir criar campanhas diferentes (projetos, sprints, eventos)
   - Dashboard separado por campanha

4. **Moderação Avançada**:
   - Filtro de palavras impróprias
   - Aprovação manual antes de publicar no dashboard

5. **Autenticação Admin**:
   - Login protegido para acessar dashboard
   - Diferentes níveis de permissão (visualizar, exportar, deletar)

6. **Analytics Avançados**:
   - Wordcloud de termos mais frequentes
   - Comparação entre períodos
   - Métricas de engajamento

7. **Integração com Slack/Teams**:
   - Resumo diário de feedbacks em canais
   - Comandos para consultar estatísticas

8. **Acessibilidade**:
   - Melhorias de contraste e navegação por teclado
   - Suporte a leitores de tela

## 📝 Status do Projeto

- ✅ **Backend API**: Completo e funcional
- ✅ **Interface de Coleta**: Completa e testada
- ✅ **Dashboard**: Completo com gráficos interativos
- ✅ **Exportação**: JSON e CSV implementados
- ✅ **Banco de Dados**: D1 configurado com migrations
- ✅ **Deployment**: Pronto para Cloudflare Pages
- ✅ **Documentação**: README completo
- ⏳ **Deploy Produção**: Aguardando credenciais Cloudflare

## 📄 Licença

Este projeto foi desenvolvido como uma ferramenta de código aberto para facilitar a comunicação em equipes.

## 👥 Contribuições

Sugestões e melhorias são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 🆘 Suporte

Para dúvidas ou problemas:
- Verifique os logs: `pm2 logs feedback-anonimo --nostream`
- Teste as APIs: `curl http://localhost:3000/api/stats`
- Confira o banco de dados: `npm run db:console:local`

---

**Desenvolvido com ❤️ para facilitar comunicação transparente e construtiva em equipes**
