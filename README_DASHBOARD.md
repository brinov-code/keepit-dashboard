# Keepit Elite Partner Dashboard

## 📊 Visão Geral

Dashboard interativo e sofisticado para acompanhamento de vendas Keepit com foco na meta de **$150.000 USD até 30/09/2026** para alcançar o status de **Parceiro Nível Elite**.

## ✨ Funcionalidades Principais

### 1. **Dashboard Executivo** (Página Principal)
- **KPIs em Tempo Real:**
  - ARR Total Acumulado: $174.984
  - Quantidade de Licenças: 7.611
  - Valor Mensal Recorrente (MRR): $14.582
  - Total de Vendas Registradas: 29

- **Indicador de Progresso:**
  - Barra visual mostrando progresso em direção à meta de $150k
  - Percentual atingido: 100% (Meta já ultrapassada!)
  - Valor faltante calculado dinamicamente

- **Gráficos Analíticos:**
  - **ARR por Período:** Gráfico de barras mostrando evolução mensal (Out 2025 - Abr 2026)
  - **Ranking de Executivos:** Gráfico horizontal com performance de cada vendedor
  - **Contribuição por Executivo:** Gráfico de pizza mostrando % de contribuição
  - **Detalhes por Executivo:** Tabela com ARR, Licenças, MRR e % da meta

### 2. **Aba de Clientes**
- Listagem completa de 24 clientes cadastrados
- Ordenação por ARR (maior para menor)
- Informações por cliente:
  - Nome da empresa
  - ARR total
  - Quantidade de licenças
  - Data da última venda
- Estatísticas agregadas:
  - Total de clientes
  - ARR total por cliente
  - Licenças totais

### 3. **Painel Administrativo** (Restrito a Admin)
- Formulário para registrar novas vendas com campos:
  - **Empresa:** Nome da empresa cliente
  - **Executivo:** Seleção entre (Rebeca Alves, Dominique Marques, Alysson Pereira)
  - **Data:** Data da venda
  - **Produto:** Seleção entre (Keepit - 365, GWS, Jira, Zendesk, Salesforce)
  - **Tipo:** Ativação ou Renovação
  - **Quantidade:** Número de licenças
  - **Valor Total (ARR):** Em USD

- **Cálculo Automático:**
  - Valor Mensal = ARR / 12
  - Mês = Extraído da data (YYYY-MM)

- **Autenticação:**
  - Apenas usuários com role "admin" podem acessar
  - Integração com OAuth Manus

### 4. **Navegação**
- Menu lateral com 3 abas principais:
  - 📊 Dashboard
  - 👥 Clientes
  - ⚙️ Admin
- Perfil do usuário com opção de logout
- Design responsivo (desktop e mobile)

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `sales`
```sql
- id (PK)
- empresa (VARCHAR)
- executivo (VARCHAR)
- data (TIMESTAMP)
- produto (VARCHAR)
- tipo (ENUM: Ativação, Renovação)
- qtd (INT)
- valor (DECIMAL)
- mensal (DECIMAL)
- total (DECIMAL)
- month (VARCHAR: YYYY-MM)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### `customers`
```sql
- id (PK)
- empresa (VARCHAR, UNIQUE)
- totalArr (DECIMAL)
- totalQty (INT)
- lastSaleDate (TIMESTAMP)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### `users`
```sql
- id (PK)
- openId (VARCHAR, UNIQUE)
- name (TEXT)
- email (VARCHAR)
- role (ENUM: user, admin)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- lastSignedIn (TIMESTAMP)
```

## 📈 Dados Importados do Excel

### Resumo dos Dados Históricos
- **Período:** Outubro 2025 - Abril 2026
- **Total de Vendas:** 29 registros
- **Total de Clientes:** 24 empresas
- **ARR Total:** $174.984,12
- **Licenças Totais:** 7.611
- **MRR Total:** $14.582,01

### Breakdown por Executivo
| Executivo | ARR | % | Licenças | MRR |
|-----------|-----|---|----------|-----|
| Dominique Marques | $137.559 | 78,6% | 6.140 | $11.463 |
| Rebeca Alves | $26.602 | 15,2% | 1.071 | $2.217 |
| Alysson Pereira | $10.824 | 6,2% | 400 | $902 |

### Produtos Vendidos
- Keepit - 365
- Keepit - GWS
- Keepit - Jira
- Keepit - Zendesk
- Keepit - Salesforce

## 🔧 Stack Tecnológico

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + tRPC
- **Database:** MySQL com Drizzle ORM
- **UI Components:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts
- **Auth:** Manus OAuth
- **Hosting:** Manus Sandbox

## 🚀 Como Usar

### Acessar o Dashboard
1. Navegue para: https://3001-iui72bj5vkbs37u1lw0up-129ade7d.us2.manus.computer
2. Faça login com sua conta Manus
3. Explore as abas: Dashboard, Clientes e Admin

### Registrar Nova Venda (Admin Only)
1. Acesse a aba **Admin**
2. Preencha o formulário com os dados da venda
3. Clique em **Registrar Venda**
4. O dashboard será atualizado automaticamente

### Filtrar e Buscar Clientes
1. Acesse a aba **Clientes**
2. Visualize a lista ordenada por ARR
3. Clientes com maior receita aparecem no topo

## 📊 Métricas Principais

### Meta de $150.000
- ✅ **Status:** ATINGIDA (100%)
- 📈 **Progresso:** $174.984 / $150.000
- 🎯 **Faltam:** $0 (Meta ultrapassada em $24.984!)

### Performance por Executivo
- 🥇 **Dominique Marques:** 91,7% da meta ($137.559)
- 🥈 **Rebeca Alves:** 17,7% da meta ($26.602)
- 🥉 **Alysson Pereira:** 7,2% da meta ($10.824)

## 🔐 Segurança

- ✅ Autenticação OAuth via Manus
- ✅ Controle de acesso por role (user/admin)
- ✅ Painel de admin restrito a usuários admin
- ✅ Validação de dados no backend

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)
- ✅ Menu lateral colapsável em mobile

## 🎨 Design

- **Paleta de Cores:**
  - Primária: Azul (#3b82f6)
  - Secundária: Verde (#10b981)
  - Neutro: Cinza (#6b7280)
  - Fundo: Branco (#ffffff)
  - Texto: Cinza escuro (#111827)

- **Tipografia:**
  - Títulos: Bold, 24-32px
  - Subtítulos: Medium, 14-18px
  - Corpo: Regular, 12-16px

- **Espaçamento:**
  - Generoso (16px, 24px, 32px)
  - Hierarquia visual clara
  - Atenção aos detalhes

## 📝 Notas Importantes

1. **Dados Históricos:** Importados automaticamente do Excel na inicialização
2. **Atualização em Tempo Real:** Novos registros aparecem imediatamente no dashboard
3. **Cálculos Automáticos:** Mensal e Total são calculados automaticamente
4. **Período:** Dados de Out/2025 a Abr/2026 (7 meses)

## 🔄 Próximos Passos (Sugestões)

1. Adicionar filtros avançados na tabela de vendas
2. Exportar dados em CSV/PDF
3. Gráficos de tendência de crescimento
4. Alertas para metas não atingidas
5. Integração com CRM externo
6. Dashboard mobile otimizado

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o time de desenvolvimento.

---

**Dashboard Keepit Elite Partner** | Versão 1.0 | Abril 2026
