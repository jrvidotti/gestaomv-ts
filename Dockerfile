FROM node:22-slim AS builder

# Instalar dependências necessárias para SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do workspace
COPY package.json yarn.lock ./
COPY packages/api-direct-data/package.json ./packages/api-direct-data/
COPY packages/pix-sicoob/package.json ./packages/pix-sicoob/
COPY packages/pontoweb/package.json ./packages/pontoweb/
COPY packages/tagone/package.json ./packages/tagone/
COPY gestaomv/package.json ./gestaomv/

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar código fonte dos pacotes
COPY packages/ ./packages/

# Build dos pacotes internos
RUN yarn build:packages

# Copiar aplicação principal
COPY gestaomv/ ./gestaomv/

# Build da aplicação principal
WORKDIR /app/gestaomv
RUN yarn build

#### Stage final - produção
FROM node:22-slim AS production

# Instalar dependências runtime para SQLite
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-privilegiado
RUN groupadd --gid 1001 node && \
    useradd --uid 1001 --gid node --shell /bin/bash --create-home node

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json do app gestaomv
COPY --chown=node:node gestaomv/package.json ./

# Copiar aplicação buildada
COPY --from=builder --chown=node:node /app/gestaomv/.output/ ./.output/
COPY --from=builder --chown=node:node /app/gestaomv/drizzle.config.ts ./
COPY --from=builder --chown=node:node /app/gestaomv/scripts/ ./scripts/

# Criar diretório para dados
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Mudar para usuário não-privilegiado
USER node

ENV DATABASE_PATH="/app/data/database.sqlite"
ENV DATAFILES_PATH="/app/data"
ENV HOSTNAME="localhost"
ENV PORT=3001
ENV NODE_ENV="production"

# Expor porta
EXPOSE 3001

# Definir diretório de trabalho da aplicação
WORKDIR /app

# Comando de inicialização
CMD ["yarn", "start"]
