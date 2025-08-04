# Docker Bake file para Gestão MV
# Uso: docker buildx bake [target]

variable "TAG" {
  default = "latest"
}

variable "REGISTRY" {
  default = ""
}

variable "PLATFORM" {
  default = "linux/amd64"
}

variable "GITHUB_TOKEN" {
  default = ""
}

# Função para gerar tags baseadas no registry
function "tag" {
  params = [image]
  result = [
    REGISTRY != "" ? "${REGISTRY}/jrvidotti/${image}:${TAG}" : "${image}:${TAG}",
    REGISTRY != "" ? "${REGISTRY}/jrvidotti/${image}:latest" : "${image}:latest"
  ]
}

# Target principal da aplicação
target "app" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = split(",", PLATFORM)
  
  tags = tag("gestaomv-ts")
  
  # Build args para otimização
  args = {
    NEXT_TELEMETRY_DISABLED = "1"
    GITHUB_TOKEN = GITHUB_TOKEN
  }
  
  # Cache otimizado
  cache-from = [
    "type=gha"
  ]
  cache-to = [
    "type=gha,mode=max"
  ]
  
  # Labels para metadados
  labels = {
    "org.opencontainers.image.title" = "Gestão MV"
    "org.opencontainers.image.description" = "Sistema de gestão corporativa modular"
    "org.opencontainers.image.source" = "https://github.com/jrvidotti/gestaomv-ts"
    "org.opencontainers.image.created" = "${timestamp()}"
  }
}

# Target para desenvolvimento local (apenas linux/amd64)
target "dev" {
  inherits = ["app"]
  platforms = ["linux/amd64"]
  tags = ["gestaomv-ts:dev"]
  
  # Sem cache para desenvolvimento
  no-cache = true
  
  # Target apenas o estágio builder para debug
  target = "builder"
}

# Target para produção com configurações específicas
target "prod" {
  inherits = ["app"]
  tags = tag("gestaomv-ts:prod")
  
  # Configurações específicas de produção
  args = {
    NEXT_TELEMETRY_DISABLED = "1"
    NODE_ENV = "production"
    GITHUB_TOKEN = GITHUB_TOKEN
  }
}

# Grupo padrão
group "default" {
  targets = ["app"]
}

# Grupo para build completo (dev + prod)
group "all" {
  targets = ["app", "dev", "prod"]
}