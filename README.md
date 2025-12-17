# 💬 Que Bom, Que Pena, Que Tal - Sistema de Feedback Anônimo

<div align="center">

### 🚀 **[ACESSAR APLICAÇÃO](https://5c9b9de3.feedback-anonimo.pages.dev/)** 🚀

[![Formulário](https://img.shields.io/badge/📝_Formulário-Enviar_Feedback-blue?style=for-the-badge)](https://5c9b9de3.feedback-anonimo.pages.dev/)
[![Dashboard](https://img.shields.io/badge/📊_Dashboard-Ver_Resultados-green?style=for-the-badge)](https://5c9b9de3.feedback-anonimo.pages.dev/dashboard)

</div>

---

## 📋 Visão Geral

Ferramenta completa de coleta e análise de feedbacks anônimos, desenvolvida para facilitar a comunicação transparente em equipes e organizações. O sistema garante 100% de anonimato, permitindo que participantes compartilhem opiniões sinceras sobre o trabalho realizado e sugestões para o futuro.

---

## 🌐 URLs da Aplicação

| Recurso | URL |
|---------|-----|
| **🚀 Acesso Rápido** | https://brunohsre.github.io/quebompenatal/ (redireciona automaticamente) |
| **🔗 Aplicação Principal** | https://feedback-anonimo.pages.dev |
| **📝 Formulário de Coleta** | https://5c9b9de3.feedback-anonimo.pages.dev/ |
| **📊 Dashboard Administrativo** | https://5c9b9de3.feedback-anonimo.pages.dev/dashboard |
| **💻 Repositório GitHub** | https://github.com/brunohsre/quebompenatal |

---

## 🎯 Objetivos

- **Coleta Anônima**: Sistema totalmente anônimo que não rastreia IP, cookies ou dados de identificação
- **Retrospectiva Estruturada**: Framework "Que Bom, Que Pena, Que Tal" para feedback organizado
- **Análise Visual**: Dashboard interativo com gráficos e estatísticas em tempo real
- **Exportação de Dados**: Capacidade de exportar feedbacks em JSON/CSV para análise externa
- **Gestão de Ciclos**: Função de zerar dados para iniciar novas rodadas de avaliação

---

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
- **Zerar Dados**: Botão para remover todos os feedbacks e iniciar nova avaliação

### 3️⃣ Sistema de Exportação
✅ **Completo**
- Exportação em formato **JSON** (estruturado para análise programática)
- Exportação em formato **CSV** (compatível com Excel/Sheets)
- Filtros opcionais por categoria
- Download automático de arquivos

### 4️⃣ Gerenciamento de Avaliações
✅ **Completo**
- **Zerar Todos os Dados**: Função para limpar feedbacks e iniciar nova rodada de avaliação
- **Dupla Confirmação**: Sistema de segurança com duas confirmações antes de deletar
- **Contador de Backup**: Informa quantos registros foram removidos
- **Reset Completo**: Limpa dados e reseta contador de IDs

### 5️⃣ APIs RESTful
✅ **Completo**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/feedbacks` | Criar novo feedback anônimo |
| GET | `/api/feedbacks` | Listar feedbacks (com paginação e filtros) |
| GET | `/api/stats` | Obter estatísticas agregadas |
| GET | `/api/export?format=json` | Exportar todos os feedbacks em JSON |
| GET | `/api/export?format=csv` | Exportar todos os feedbacks em CSV |
| DELETE | `/api/feedbacks/:id` | Remover feedback específico |
| DELETE | `/api/feedbacks` | Zerar todos os feedbacks (reiniciar avaliação) |

---

## 🏗️ Arquitetura Técnica

### Stack de Tecnologias

**Backend:**
- **Hono Framework** - Framework web leve e rápido para edge computing
- **Cloudflare Workers** - Runtime serverless global
- **Cloudflare D1** - SQLite distribuído globalmente
- **TypeScript** - Tipagem estática e segurança

**Frontend:**
- **TailwindCSS** - Framework CSS utilitário via CDN
- **Chart.js** - Biblioteca de gráficos interativos
- **Axios** - Cliente HTTP para APIs
- **Font Awesome** - Ícones vetoriais

**Deploy:**
- **Cloudflare Pages** - Hosting global com CDN integrado
- **Edge Computing** - Baixa latência em qualquer lugar do mundo

### Modelo de Dados (D1 SQLite)

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
- ❌ Sem coluna `user_id` ou `user_ip`
- ❌ Sem cookies de sessão
- ❌ Sem localStorage ou tracking
- ✅ Apenas: categoria + conteúdo + timestamp

---

## 📱 Guia do Usuário

### Para Participantes (Envio de Feedback)

1. **Acesse o formulário**: https://5c9b9de3.feedback-anonimo.pages.dev/
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

1. **Acesse o dashboard**: https://5c9b9de3.feedback-anonimo.pages.dev/dashboard
2. **Visualize estatísticas**: Cards no topo mostram contadores totais
3. **Analise distribuição**: Gráfico de pizza mostra proporção entre categorias
4. **Identifique tendências**: Gráfico de linha mostra evolução temporal
5. **Leia feedbacks**: Lista completa com filtros por categoria
6. **Exporte dados**: Botão "Exportar" para baixar em JSON ou CSV
7. **Análise externa**: Importe os dados em ferramentas de análise (Excel, Power BI, etc.)
8. **Zerar dados**: Botão vermelho "Zerar Dados" para iniciar nova avaliação

#### ⚠️ Como Zerar Dados e Iniciar Nova Avaliação

**Quando usar:**
- Ao concluir uma retrospectiva/avaliação
- Para iniciar um novo ciclo de feedback
- Após exportar os dados antigos

**Como funciona:**
1. Clique no botão vermelho **"Zerar Dados"** no canto superior direito do dashboard
2. **Primeira confirmação**: Sistema pergunta se você quer prosseguir (recomenda exportar antes)
3. **Segunda confirmação**: Confirmação final para evitar exclusão acidental
4. **Processamento**: Todos os feedbacks são removidos permanentemente
5. **Resultado**: Sistema informa quantos registros foram deletados
6. **Dashboard atualiza**: Mostra contadores zerados, pronto para nova rodada

**⚠️ IMPORTANTE:**
- Esta ação é **irreversível** - dados deletados não podem ser recuperados
- **Sempre exporte os dados antes** de zerar (use botão "Exportar")
- Dupla confirmação previne exclusão acidental
- IDs são resetados (próximo feedback será ID 1)

---

## 🚀 Deploy e Instalação

### Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone https://github.com/brunohsre/quebompenatal.git
cd quebompenatal

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

A aplicação já está publicada e configurada!

**URLs de Produção:**
- Principal: https://feedback-anonimo.pages.dev
- Deployment atual: https://5c9b9de3.feedback-anonimo.pages.dev

Para fazer um novo deploy:

```bash
# 1. Configure suas credenciais do Cloudflare
# Crie um API Token em: https://dash.cloudflare.com/profile/api-tokens

# 2. Build e deploy
npm run build
npx wrangler pages deploy dist --project-name feedback-anonimo
```

---

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

---

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

---

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
```

---

## 📄 Documentação Adicional

- **README.md**: Este arquivo (documentação principal)
- **TESTING.md**: Checklist completo de testes
- **DEPLOY_GUIDE.md**: Guia detalhado de deploy
- **FEATURE_RESET.md**: Documentação da funcionalidade de zerar dados

---

## 🎓 Tecnologias e Conceitos

Este projeto demonstra:
- ✅ Edge computing com Cloudflare Workers
- ✅ Serverless architecture
- ✅ SQLite distribuído (D1)
- ✅ APIs RESTful
- ✅ Frontend moderno com TailwindCSS
- ✅ Visualização de dados com Chart.js
- ✅ Design responsivo
- ✅ Anonimato e privacidade por design

---

## 📊 Status do Projeto

- ✅ **Backend API**: Completo e funcional
- ✅ **Interface de Coleta**: Completa e testada
- ✅ **Dashboard**: Completo com gráficos interativos
- ✅ **Exportação**: JSON e CSV implementados
- ✅ **Banco de Dados**: D1 configurado com migrations
- ✅ **Zerar Dados**: Funcionalidade completa
- ✅ **Deploy**: Publicado no Cloudflare Pages
- ✅ **GitHub**: Código publicado
- ✅ **Documentação**: README completo

---

## 👨‍💻 Autor

**Desenvolvido por**: Bruno Henrique  
**GitHub**: [@brunohsre](https://github.com/brunohsre)  
**Repositório**: [quebompenatal](https://github.com/brunohsre/quebompenatal)

---

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub: https://github.com/brunohsre/quebompenatal/issues
- Consulte a documentação em TESTING.md e DEPLOY_GUIDE.md

---

**Desenvolvido com ❤️ para facilitar comunicação transparente e construtiva em equipes**

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2025
