# 🚀 Guia de Deploy - Cloudflare Pages

## 📋 Pré-requisitos

Antes de fazer o deploy para produção, você precisa:

1. **Conta Cloudflare**: Crie uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com)
2. **API Token**: Configure seu token no Deploy tab do GenSpark
3. **Repositório GitHub** (opcional): Para CI/CD automático

---

## 🔧 Opção 1: Deploy Manual via CLI

### Passo 1: Configurar Token da Cloudflare

No terminal do GenSpark, execute:

```bash
# Este comando será executado automaticamente pelo GenSpark
# quando você clicar em "Deploy to Cloudflare"
```

Você será solicitado a configurar seu **Cloudflare API Token** através do Deploy tab.

**Como obter seu API Token:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em "Create Token"
3. Use o template "Edit Cloudflare Workers"
4. Ou crie um custom token com permissões:
   - `Account > Cloudflare Pages > Edit`
   - `Account > D1 > Edit`
5. Copie o token gerado
6. Cole no Deploy tab do GenSpark

### Passo 2: Criar Banco de Dados de Produção

```bash
cd /home/user/webapp

# Criar D1 database de produção
npx wrangler d1 create feedback-production

# Anote o database_id retornado
# Exemplo de output:
# ✅ Successfully created DB 'feedback-production'
# Created your database using D1's new storage backend.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "feedback-production"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Passo 3: Atualizar wrangler.jsonc

Edite o arquivo `wrangler.jsonc` e substitua o `database_id`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "feedback-anonimo",
  "compatibility_date": "2025-10-17",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "feedback-production",
      "database_id": "COLE_SEU_DATABASE_ID_AQUI"  // ← Substitua aqui
    }
  ]
}
```

### Passo 4: Aplicar Migrations em Produção

```bash
# Aplicar schema do banco de dados em produção
npm run db:migrate:prod

# Output esperado:
# 🌀 Executing on remote database feedback-production from .wrangler/state/v3/d1:
# ✅ Successfully applied migrations
```

### Passo 5: Criar Projeto no Cloudflare Pages

```bash
# Criar projeto (apenas na primeira vez)
npx wrangler pages project create feedback-anonimo \
  --production-branch main \
  --compatibility-date 2025-10-17

# Output esperado:
# ✅ Successfully created the 'feedback-anonimo' project.
```

### Passo 6: Build e Deploy

```bash
# Build do projeto
npm run build

# Deploy para produção
npm run deploy:prod

# Output esperado:
# ✨ Deployment complete! Take a peek over at
# https://feedback-anonimo.pages.dev
```

### Passo 7: Acessar Aplicação

Após o deploy, você receberá URLs como:

- **Produção**: `https://feedback-anonimo.pages.dev`
- **Branch main**: `https://main.feedback-anonimo.pages.dev`

---

## 🔄 Opção 2: Deploy Automático via GitHub

### Configuração Inicial

1. **Push para GitHub**:
   ```bash
   # Configure GitHub (se ainda não fez)
   # Será solicitado via GenSpark
   
   cd /home/user/webapp
   git remote add origin https://github.com/SEU_USUARIO/feedback-anonimo.git
   git push -u origin main
   ```

2. **Conectar ao Cloudflare Pages**:
   - Acesse: https://dash.cloudflare.com/pages
   - Clique em "Create a project"
   - Conecte sua conta GitHub
   - Selecione o repositório `feedback-anonimo`
   - Configure o build:
     ```
     Build command: npm run build
     Build output directory: dist
     Root directory: /
     ```

3. **Configurar D1 Database**:
   - Vá em Settings > Functions
   - Adicione binding:
     - Variable name: `DB`
     - D1 database: `feedback-production`

4. **Deploy Automático**:
   - Cada `git push` para `main` dispara deploy automático
   - Branches criam preview deployments

---

## 🗄️ Gerenciamento do Banco de Dados

### Consultar Dados em Produção

```bash
# Ver dados da tabela
npx wrangler d1 execute feedback-production \
  --command="SELECT * FROM feedbacks LIMIT 10"

# Ver estatísticas
npx wrangler d1 execute feedback-production \
  --command="SELECT category, COUNT(*) as count FROM feedbacks GROUP BY category"
```

### Backup do Banco de Dados

```bash
# Exportar dados
npx wrangler d1 export feedback-production --output backup.sql

# Restaurar backup (use com cuidado!)
npx wrangler d1 execute feedback-production --file=backup.sql
```

### Popular Dados de Teste em Produção

```bash
# Inserir dados de exemplo (se necessário)
npx wrangler d1 execute feedback-production --file=./seed.sql
```

---

## 🔐 Configuração de Segurança

### Rate Limiting (Cloudflare Dashboard)

1. Acesse seu projeto em Pages
2. Vá em Settings > Functions
3. Configure Rate Limiting:
   - `/api/feedbacks` (POST): 10 requests/minute
   - `/api/*` (GET): 60 requests/minute

### Custom Domain (Opcional)

```bash
# Adicionar domínio personalizado
npx wrangler pages domain add feedback.sua-empresa.com.br \
  --project-name feedback-anonimo

# Configurar DNS:
# Adicione CNAME: feedback -> feedback-anonimo.pages.dev
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Ver logs do Workers (execuções recentes)
npx wrangler pages deployment tail
```

### Analytics no Dashboard

1. Acesse: https://dash.cloudflare.com/pages
2. Selecione projeto `feedback-anonimo`
3. Vá em "Analytics" para ver:
   - Requests por dia
   - Latência média
   - Erros e status codes
   - Bandwidth usado

---

## 🔄 Atualizações Futuras

### Workflow de Atualização

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm run build
npm run dev:sandbox

# 3. Commit
git add .
git commit -m "Descrição das mudanças"

# 4. Deploy
npm run deploy:prod

# Se usando GitHub:
git push origin main  # Deploy automático
```

---

## 🆘 Troubleshooting

### Erro: "API token authentication failed"

**Solução**: Reconfigure seu token no Deploy tab ou via CLI:
```bash
npx wrangler login
```

### Erro: "Database binding not found"

**Solução**: Verifique que o `database_id` está correto em `wrangler.jsonc` e que o binding está configurado no Cloudflare Dashboard.

### Erro: "Build failed"

**Solução**: Verifique que todas as dependências estão instaladas:
```bash
npm install
npm run build
```

### Erro 500 nas APIs

**Solução**: Verifique logs e migrations:
```bash
npx wrangler pages deployment tail
npm run db:migrate:prod
```

---

## 📈 Escalabilidade

### Limites do Plano Gratuito (Cloudflare Workers/Pages)

- **Requests**: 100,000/dia
- **CPU Time**: 10ms por request
- **D1 Reads**: 5 milhões/dia
- **D1 Writes**: 100,000/dia
- **Storage**: 500 MB (D1)

### Upgrade para Plano Pago

Se ultrapassar limites:
1. Acesse: https://dash.cloudflare.com/pages
2. Vá em Settings > Billing
3. Upgrade para Workers Paid ($5/mês):
   - Requests ilimitados
   - CPU Time: 30ms por request
   - D1: 25 milhões reads, 50 milhões writes

---

## ✅ Checklist de Deploy

- [ ] Token da Cloudflare configurado
- [ ] Banco de dados D1 criado em produção
- [ ] `wrangler.jsonc` atualizado com `database_id`
- [ ] Migrations aplicadas em produção
- [ ] Projeto Cloudflare Pages criado
- [ ] Build executado com sucesso
- [ ] Deploy realizado sem erros
- [ ] Aplicação acessível via URL pública
- [ ] APIs testadas e funcionando
- [ ] Dashboard carregando corretamente
- [ ] Exportação de dados funcionando
- [ ] (Opcional) Domínio customizado configurado
- [ ] (Opcional) GitHub conectado para CI/CD

---

## 📞 Suporte

**Documentação Oficial:**
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Cloudflare D1: https://developers.cloudflare.com/d1
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler

**Comunidade:**
- Discord: https://discord.gg/cloudflaredev
- Forum: https://community.cloudflare.com

---

**Última Atualização**: 2025-10-17
**Versão da Aplicação**: 1.0.0
