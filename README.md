# Ingressar

Plataforma de venda de ingressos para eventos, conectando organizadores e compradores. Pagamentos via Stripe (em desenvolvimento).

## Status atual

MVP em andamento — autenticação com roles (organizer/buyer), refresh token (access 15min em memória + refresh cookie httpOnly 7d), RBAC (`requireRole`, `requireEventOwner`), logout, reset de senha, validação de input com Zod e rate limiting aplicados nas rotas públicas e autenticadas. Gestão de eventos com transições de status, paginação e dashboard de vendas. Checkout de ingressos via Stripe (test mode) com validação de capacidade concorrente. Testes unitários e de integração cobrindo autenticação, autorização e checkout. Frontend ainda não implementado; webhook de confirmação de pagamento pendente (v0.6.0).

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 20 + Express 5 + TypeScript |
| Banco de dados | PostgreSQL 16 |
| ORM | Prisma 7 (adapter nativo pg) |
| Autenticação | JWT (access + refresh) + bcrypt |
| Testes | Jest + Supertest + jest-mock-extended |
| Pagamentos | Stripe Checkout (Elements, test mode) — webhook de confirmação pendente |
| Infraestrutura | Docker Compose (dev) / Kubernetes (prod) |

## Rodando localmente

**Pré-requisitos:** Docker, Node.js 20+

```bash
# 1. Suba o banco de dados
cp .env.example .env   # preencha as variáveis
docker compose up -d

# 2. Instale dependências e rode as migrations
cd app/api
cp .env.example .env   # preencha DATABASE_URL, JWT_SECRET e JWT_REFRESH_SECRET
npm install
npx prisma migrate dev

# 3. Inicie a API
npm run dev
```

A API estará disponível em `http://localhost:3001`.

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/status` | — | Health check |
| POST | `/auth/register` | — | Cadastro de usuário (role: buyer por padrão) |
| POST | `/auth/login` | — | Login — retorna `accessToken` (15min) e seta cookie httpOnly com refresh token (7d) |
| POST | `/auth/refresh` | Cookie | Renova o access token usando o refresh token |
| POST | `/auth/logout` | JWT | Encerra a sessão (limpa o cookie de refresh token) |
| POST | `/auth/forgot-password` | — | Gera um token de redefinição de senha (válido por 1h, uso único) |
| POST | `/auth/reset-password` | — | Redefine a senha a partir de um token válido |
| GET | `/events` | — | Lista eventos publicados, paginado (`page`, `limit`, `sort`, `order`) |
| GET | `/events/:id` | — | Detalhes de um evento |
| POST | `/events` | JWT (organizer) | Cria um evento |
| PATCH | `/events/:id` | JWT (organizer, dono) | Edita título, descrição, local ou status de um evento |
| GET | `/events/:id/dashboard` | JWT (organizer, dono) | Métricas de vendas do evento (ingressos vendidos, receita, capacidade restante, vendas por dia) |
| POST | `/events/:id/checkout` | JWT (buyer) | Inicia a compra de um ingresso via Stripe Checkout (Elements) — cria ticket `pending` e retorna `{ clientSecret, ticketId }` |
| GET | `/tickets/mine` | JWT | Ingressos do usuário logado |

Envie o access token nas requisições autenticadas via header `Authorization: Bearer <token>`.

## Especificação da API (OpenAPI)

```bash
cd app/api
npm run docs:openapi   # gera app/api/openapi.json
```

A spec é gerada a partir dos mesmos schemas Zod usados nas rotas (`src/routes/*.ts` + `src/openapi/`) — não é mantida à mão, então não diverge do código como a tabela de endpoints acima pode divergir com o tempo. Importe o `openapi.json` gerado no Swagger UI, Postman ou Insomnia para explorar a API interativamente.

## Testes

```bash
cd app/api
npm run test:unit          # mocks — não precisa de banco

docker compose -f ../../compose.test.yml up -d   # banco de teste isolado (porta 5433)
npm run test:integration
```

## Modelos principais

- **User** — email, senha, `role` (organizer | buyer)
- **Event** — título, descrição, preço, data, local, capacidade, `status` (draft | published | cancelled | finished), vinculado ao organizador
- **Ticket** — ingresso de um usuário para um evento, `status` (pending | confirmed | cancelled), QR code opcional
- **Payment** — registro de pagamento via Stripe vinculado ao ingresso, `status` (pending | paid | failed | refunded)
- **PasswordResetToken** — token de redefinição de senha com validade e uso único

## Estrutura

```
app/
  api/
    prisma/            # schema e migrations
    tests/
      unit/            # testes unitários (Prisma mockado)
      integration/     # testes de integração (banco de teste real)
    src/
      app.ts           # monta o Express app (usado pelos testes)
      index.ts         # inicia o servidor
      lib/             # cliente Prisma, tokens JWT, email (stub)
      middleware/      # autenticação JWT, RBAC (requireRole/requireEventOwner) e rate limiting
      routes/          # auth, events, tickets
docker-compose.yml     # banco de dev
compose.test.yml       # banco de teste (integration)
```