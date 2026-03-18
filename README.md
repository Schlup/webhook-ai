
# webhook-ai

Projeto monorepo simples que reúne uma API TypeScript e uma aplicação web (Vite + React) para trabalhar com webhooks.

Estrutura resumida

- `api` — servidor TypeScript (Fastify, Drizzle ORM)
- `web` — frontend com Vite + React

Instalação
---------

1. Instale as dependências (requer `pnpm`):

```bash
pnpm install
```

2. (Opcional) Se houver dependências de banco de dados via Docker, entre na pasta `api` e rode o `docker-compose`:

```bash
cd api
docker compose up -d
```

Uso (desenvolvimento)
----------------------

- Rodar a API em modo dev:

```bash
pnpm run dev
```

- Rodar o frontend em modo dev:

```bash
pnpm run dev
```

- Comandos úteis na pasta `api`:

```bash
pnpm run db:generate   # gerar tipos/migrations com drizzle-kit
pnpm run db:migrate    # aplicar migrations
pnpm run db:studio     # abrir drizzle studio
```

Tecnologias
-----------

- Node.js + TypeScript
- Fastify (API)
- Drizzle ORM + `drizzle-kit`
- PostgreSQL (`pg`) — usado como driver no projeto
- Vite + React (frontend)
- pnpm (gerenciador de pacotes)
- Docker / Docker Compose 
