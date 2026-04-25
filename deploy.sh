#!/bin/bash

# ============================================================================
# Script de Deploy - Dashboard Keepit Elite Partner
# ============================================================================
# Este script prepara a aplicação para produção

set -e

echo "🚀 Iniciando processo de deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. Verificar variáveis de ambiente
# ============================================================================
echo -e "${YELLOW}📋 Verificando variáveis de ambiente...${NC}"

required_vars=("DATABASE_URL" "JWT_SECRET" "VITE_APP_ID" "OAUTH_SERVER_URL" "VITE_OAUTH_PORTAL_URL")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Erro: Variável $var não definida${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Todas as variáveis de ambiente estão configuradas${NC}"

# ============================================================================
# 2. Instalar dependências
# ============================================================================
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

if ! command -v pnpm &> /dev/null; then
  echo "Instalando pnpm..."
  npm install -g pnpm
fi

pnpm install --frozen-lockfile

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# ============================================================================
# 3. Verificar TypeScript
# ============================================================================
echo -e "${YELLOW}🔍 Verificando TypeScript...${NC}"

pnpm check

echo -e "${GREEN}✅ TypeScript validado${NC}"

# ============================================================================
# 4. Build
# ============================================================================
echo -e "${YELLOW}🔨 Fazendo build...${NC}"

pnpm build

echo -e "${GREEN}✅ Build concluído${NC}"

# ============================================================================
# 5. Verificar arquivos de build
# ============================================================================
echo -e "${YELLOW}📁 Verificando arquivos de build...${NC}"

if [ ! -d "dist/public" ] || [ ! -f "dist/index.js" ]; then
  echo -e "${RED}❌ Erro: Arquivos de build não encontrados${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Arquivos de build validados${NC}"

# ============================================================================
# 6. Resumo
# ============================================================================
echo -e "${GREEN}✅ Deploy preparado com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Copie os arquivos para seu servidor:"
echo "   - dist/ (aplicação compilada)"
echo "   - node_modules/ (dependências)"
echo ""
echo "2. Configure as variáveis de ambiente no servidor"
echo ""
echo "3. Inicie a aplicação:"
echo "   NODE_ENV=production node dist/index.js"
echo ""
echo "4. Configure um reverse proxy (Nginx/Apache)"
echo ""
echo "5. Configure SSL com Let's Encrypt"
echo ""
echo "Documentação completa em: HOSPEDAGEM_PERMANENTE.md"
