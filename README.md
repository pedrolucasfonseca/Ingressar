# Ingressar

Plataforma de venda de ingressos para eventos, conectando organizadores e compradores. Pagamentos via Stripe (em desenvolvimento).

## Status atual

MVP em andamento — autenticação, cadastro de eventos e compra de ingressos funcionando. Frontend React ainda não implementado; SDK do Stripe instalado, integração de pagamento pendente.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 20 + Express 5 + TypeScript |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma 7 (adapter nativo pg) |
| Autenticação | JWT + bcrypt |
| Pagamentos | Stripe (instalado, integração pendente) |
| Infraestrutura | Docker Compose (dev) / Kubernetes (prod) |

## Rodando localmente

**Pré-requisitos:** Docker, Node.js 20+

```bash
# 1. Suba o banco de dados
cp .env.example .env   # preencha as variáveis
docker compose up -d

# 2. Instale dependências e rode as migrations
cd app/api
cp .env.example .env   # preencha DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev

# 3. Inicie a API
npm run dev
```

A API estará disponível em `http://localhost:3001`.

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cadastro de usuário |
| POST | `/auth/login` | — | Login, retorna JWT |
| GET | `/events` | — | Lista todos os eventos |
| GET | `/events/:id` | — | Detalhes de um evento |
| POST | `/events` | JWT | Cria um evento |
| POST | `/tickets` | JWT | Compra um ingresso |
| GET | `/tickets/mine` | JWT | Ingressos do usuário logado |

Envie o token nas requisições autenticadas via header `Authorization: Bearer <token>`.

## Estrutura

```
app/
  api/
    prisma/            # schema e migrations
    src/
      lib/             # cliente Prisma
      middleware/      # autenticação JWT
      routes/          # auth, events, tickets
docker-compose.yml     # banco local
docs/                  # documentação técnica detalhada
```