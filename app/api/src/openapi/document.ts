import { z } from 'zod'
import { createDocument } from 'zod-openapi'
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../routes/auth'
import { CreateEventSchema, UpdateEventSchema } from '../routes/events'
import { CreateTicketSchema } from '../routes/tickets'
import {
    IdEmailSchema,
    AccessTokenSchema,
    MessageSchema,
    SimpleErrorSchema,
    ValidationErrorSchema,
    EventSchema,
    TicketSchema,
    TicketWithEventSchema,
} from './schemas'

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
            'Gerado a partir dos schemas Zod já usados nas rotas (src/routes/*.ts) — reflete o estado real do código, não o roadmap. Rotas montadas sem prefixo (ver src/app.ts); o prefixo /api só existe a partir do Ingress em produção (v0.5.9+).',
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
                summary: 'Login — seta cookie httpOnly com o refresh token',
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
                summary: 'Encerra a sessão — limpa o cookie de refresh token',
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
                        description: 'Sempre 200, exista ou não o email — evita enumeração de usuários',
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
                summary: 'Lista todos os eventos',
                tags: ['events'],
                responses: {
                    '200': { description: 'OK', ...jsonBody(z.array(EventSchema)) },
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
                summary: 'Edita título, descrição ou local de um evento',
                tags: ['events'],
                security: [{ bearerAuth: [] }],
                description: 'Requer role organizer e ser o dono do evento (requireEventOwner)',
                requestParams: { path: z.object({ id: z.string() }) },
                requestBody: jsonBody(UpdateEventSchema),
                responses: {
                    '200': { description: 'Evento atualizado', ...jsonBody(EventSchema) },
                    '400': validationError,
                    '401': simpleError('Token não fornecido, expirado ou inválido'),
                    '403': simpleError('Role diferente de organizer, ou evento de outro organizer'),
                    '404': simpleError('Evento não encontrado'),
                },
            },
        },
        '/tickets': {
            post: {
                summary: 'Compra um ingresso',
                tags: ['tickets'],
                security: [{ bearerAuth: [] }],
                description: 'Requer role buyer. Sem verificação de capacidade ainda (ver roadmap v0.5.0)',
                requestBody: jsonBody(CreateTicketSchema),
                responses: {
                    '201': { description: 'Ticket criado', ...jsonBody(TicketSchema) },
                    '400': validationError,
                    '401': simpleError('Não autenticado, token ausente/inválido'),
                    '404': simpleError('Evento não encontrado'),
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
    },
})

export const openApiDocument = document as unknown as Record<string, unknown>