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
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json do app gestaomv
COPY --chown=appuser:appgroup gestaomv/package.json ./
COPY --chown=appuser:appgroup gestaomv/src/db/migrations ./migrations
COPY --chown=appuser:appgroup gestaomv/src/data ./data

# Copiar aplicação buildada
COPY --from=builder --chown=appuser:appgroup /app/gestaomv/.output/ ./.output/
COPY --from=builder --chown=appuser:appgroup /app/gestaomv/drizzle.config.ts ./
COPY --from=builder --chown=appuser:appgroup /app/gestaomv/scripts/ ./scripts/

# Mudar para usuário não-privilegiado
USER appuser

ENV DATABASE_PATH="/app/data/database.sqlite"
ENV DATAFILES_PATH="/app/data"
ENV MIGRATIONS_PATH="/app/migrations"
ENV HOSTNAME="localhost"
ENV PORT=3000
ENV NODE_ENV="production"

# Expor porta
EXPOSE 3000

# Definir diretório de trabalho da aplicação
WORKDIR /app

# Comando de inicialização
CMD ["yarn", "start"]
