import { z } from "zod";
import { createDocument } from "zod-openapi";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../routes/auth";
import { CreateEventSchema, UpdateEventSchema, ListEventsQuerySchema, BannerUploadUrlRequestSchema } from "../routes/events";
import {
    IdEmailSchema,
    AccessTokenSchema,
    MessageSchema,
    SimpleErrorSchema,
    ValidationErrorSchema,
    EventSchema,
    PaginatedEventsSchema,
    EventDashboardSchema,
    CheckoutResponseSchema,
    TicketWithEventSchema,
    BannerUploadUrlSchema,
} from "./schemas";

const bearerAuth = { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } as const

const jsonBody = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } })

const validationError = { description: 'Body inválido', ...jsonBody(ValidationErrorSchema) }
const simpleError = (description: string) => ({ description, ...jsonBody(SimpleErrorSchema) })

const document = createDocument({
    openapi: '3.1.0',
    info: {
        title: 'Ingressar API',
        // Setado automaticamente pelo npm ao rodar via "npm run docs:openapi" (lido de package.json).
        version: process.env['npm_package_version'] ?? '0.0.0',
        description:
            'Gerado a partir dos schemas Zod já usados nas rotas (src/routes/*.ts). Reflete o estado real do código, não o roadmap. Rotas montadas sem prefixo (ver src/app.ts); o prefixo /api só existe a partir do Ingress em produção (v0.6.9+).',
    },
    servers: [{ url: 'http://localhost:3001', description: 'dev local' }],
    components: {
        securitySchemes: { bearerAuth },
    },
    paths: {
        '/status': {
            get: {
                summary: 'Health check',
                responses: {
                    '200': { description: 'OK', ...jsonBody(z.object({ status: z.literal('ok') })) },
                },
            },
        },
        '/auth/register': {
            post: {
                summary: 'Cadastro de usuário (role: buyer por padrão)',
                tags: ['auth'],
                requestBody: jsonBody(RegisterSchema),
                responses: {
                    '201': { description: 'Usuário criado', ...jsonBody(IdEmailSchema) },
                    '400': validationError,
                    '409': simpleError('Email já cadastrado'),
                },
            },
        },
        '/auth/login': {
            post: {
                summary: 'Login, seta cookie httpOnly com o refresh token',
                tags: ['auth'],
                requestBody: jsonBody(LoginSchema),
                responses: {
                    '200': { description: 'Login bem-sucedido', ...jsonBody(AccessTokenSchema) },
                    '400': validationError,
                    '401': simpleError('Credenciais inválidas'),
                },
            },
        },
        '/auth/refresh': {
            post: {
                summary: 'Renova o access token usando o refresh token (cookie httpOnly)',
                tags: ['auth'],
                requestParams: {
                    cookie: z.object({ refreshToken: z.string().meta({ description: 'Refresh token httpOnly, 7 dias' }) }),
                },
                responses: {
                    '200': { description: 'Novo access token', ...jsonBody(AccessTokenSchema) },
                    '401': simpleError('Refresh token ausente, inválido ou expirado'),
                },
            },
        },
        '/auth/logout': {
            post: {
                summary: 'Encerra a sessão, limpa o cookie de refresh token',
                tags: ['auth'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': { description: 'Sessão encerrada' },
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                },
            },
        },
        '/auth/forgot-password': {
            post: {
                summary: 'Gera token de redefinição de senha (válido por 1h, uso único)',
                tags: ['auth'],
                requestBody: jsonBody(ForgotPasswordSchema),
                responses: {
                    '200': {
                        description: 'Sempre 200, exista ou não o email. Evita enumeração de usuários.',
                        ...jsonBody(MessageSchema),
                    },
                    '400': validationError,
                },
            },
        },
        '/auth/reset-password': {
            post: {
                summary: 'Redefine a senha a partir de um token válido',
                tags: ['auth'],
                requestBody: jsonBody(ResetPasswordSchema),
                responses: {
                    '200': { description: 'Senha redefinida', ...jsonBody(MessageSchema) },
                    '400': simpleError('Body inválido ou token inválido/expirado/já usado'),
                },
            },
        },
        '/events': {
            get: {
                summary: 'Lista eventos publicados, paginado',
                tags: ['events'],
                requestParams: { query: ListEventsQuerySchema },
                responses: {
                    '200': { description: 'OK', ...jsonBody(PaginatedEventsSchema) },
                    '400': validationError,
                },
            },
            post: {
                summary: 'Cria um evento',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description: 'Requer role organizer',
                requestBody: jsonBody(CreateEventSchema),
                responses: {
                    '201': { description: 'Evento criado', ...jsonBody(EventSchema) },
                    '400': validationError,
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer'),
                },
            },
        },
        '/events/mine': {
            get: {
                summary: 'Eventos do organizador logado, em qualquer status',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description: 'Requer role organizer. Diferente de GET /events (que só lista published). Usado pelo organizer pra gerenciar os próprios eventos, incluindo draft/cancelled/finished.',
                responses: {
                    '200': { description: 'OK', ...jsonBody(z.array(EventSchema)) },
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer'),
                },
            },
        },
        '/events/{id}': {
            get: {
                summary: 'Detalhes de um evento',
                tags: ['events'],
                requestParams: { path: z.object({ id: z.string() }) },
                responses: {
                    '200': { description: 'OK', ...jsonBody(EventSchema) },
                    '404': simpleError('Evento não encontrado'),
                },
            },
            patch: {
                summary: 'Edita título, descrição, local, status ou banner de um evento',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description:
                    'Requer role organizer e ser o dono do evento (requireEventOwner). Transições de status válidas: draft → published, draft → cancelled, published → cancelled. bannerUrl é gravado após confirmação do upload via POST /events/{id}/banner-upload-url',
                requestParams: { path: z.object({ id: z.string() }) },
                requestBody: jsonBody(UpdateEventSchema),
                responses: {
                    '200': { description: 'Evento atualizado', ...jsonBody(EventSchema) },
                    '400': simpleError('Body inválido ou transição de status inválida'),
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer, ou evento de outro organizer'),
                    '404': simpleError('Evento não encontrado'),
                },
            },
        },
        '/events/{id}/banner-upload-url': {
            post: {
                summary: 'Gera uma presigned URL para upload direto do banner no Object Storage',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description:
                    'Requer role organizer e ser o dono do evento (requireEventOwner). URL expira em 5 minutos; Content-Type restrito a image/jpeg, image/png, image/webp. O browser faz o PUT direto no Object Storage; a API só grava bannerUrl no Event depois, via PATCH /events/{id}',
                requestParams: { path: z.object({ id: z.string() }) },
                requestBody: jsonBody(BannerUploadUrlRequestSchema),
                responses: {
                    '200': { description: 'OK', ...jsonBody(BannerUploadUrlSchema) },
                    '400': simpleError('Content-Type não permitido'),
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer, ou evento de outro organizer'),
                    '404': simpleError('Evento não encontrado'),
                },
            },
        },
        '/events/{id}/preview': {
            get: {
                summary: 'HTML mínimo com OG meta tags do evento, para crawlers de redes sociais',
                tags: ['events'],
                description:
                    'Servido atrás de um proxy_pass do nginx do frontend, só para User-Agents de crawlers conhecidos (facebookexternalhit, Twitterbot, WhatsApp, TelegramBot, Slackbot, LinkedInBot). Usuários reais recebem a SPA. Campos controlados pelo organizer (title, description) são HTML-escapados.',
                requestParams: { path: z.object({ id: z.string() }) },
                responses: {
                    '200': { description: 'HTML com og:title/og:description/og:image/og:url', content: { 'text/html': { schema: z.string() } } },
                    '404': simpleError('Evento não encontrado'),
                },
            },
        },
        '/events/{id}/dashboard': {
            get: {
                summary: 'Métricas de vendas do evento',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description: 'Requer role organizer e ser o dono do evento (requireEventOwner)',
                requestParams: { path: z.object({ id: z.string() }) },
                responses: {
                    '200': { description: 'OK', ...jsonBody(EventDashboardSchema) },
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer, ou evento de outro organizer'),
                    '404': simpleError('Evento não encontrado'),
                },
            },
        },
        '/events/{id}/checkout': {
            post: {
                summary: 'Inicia a compra de um ingresso via Stripe Checkout (Elements)',
                tags: ['events', 'tickets'],
                security: [{ bearerAuth: [] }],
                description:
                    'Requer role buyer. Cria um ticket pending e uma Stripe Checkout Session (idempotente por ticket.id) dentro de uma transação que trava o evento (FOR UPDATE) para serializar checkouts concorrentes e validar capacidade',
                requestParams: { path: z.object({ id: z.string() }) },
                responses: {
                    '201': { description: 'Checkout iniciado', ...jsonBody(CheckoutResponseSchema) },
                    '400': simpleError('Evento não está publicado ou já ocorreu'),
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de buyer'),
                    '404': simpleError('Evento não encontrado'),
                    '409': simpleError('Evento esgotado'),
                },
            },
        },
        '/tickets/mine': {
            get: {
                summary: 'Ingressos do usuário logado',
                tags: ['tickets'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'OK', ...jsonBody(z.array(TicketWithEventSchema)) },
                    '401': simpleError('Não autenticado, token ausente/inválido'),
                },
            },
        },
        '/tickets/{id}': {
            get: {
                summary: 'Detalhes de um ingresso do usuário logado',
                tags: ['tickets'],
                security: [{ bearerAuth: [] }],
                description: 'Retorna 404 (não 403) se o ingresso pertence a outro usuário. Evita confirmar a um usuário não autorizado que o id existe.',
                requestParams: { path: z.object({ id: z.string() }) },
                responses: {
                    '200': { description: 'OK', ...jsonBody(TicketWithEventSchema) },
                    '401': simpleError('Não autenticado, token ausente/inválido'),
                    '404': simpleError('Ingresso não encontrado'),
                },
            },
        },
    },
})

export const openApiDocument = document as unknown as Record<string, unknown>