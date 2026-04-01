import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createSelectSchema } from "drizzle-zod"
import { z } from 'zod'
import { webhooks } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
    app.post(
        '/api/generate',
        {
            schema: {
                summary: 'Generate a TypeScript handler for the specified webhooks',
                tags: ['Webhooks'],
                body: z.object({
                    webhooksIds: z.array(z.string()),
                }),
                response: {
                    201: z.object({
                        code: z.string()
                    }),
                },
            },
        },
        async (request, reply) => {

            const { webhooksIds } = request.body

            const result = await db
                .select({ body: webhooks.body })
                .from(webhooks)
                .where(inArray(webhooks.id, webhooksIds))

            const webhooksBodies = result.map(webhook => webhook.body).join("\n\n")

            return reply.status(201).send({ code: webhooksBodies })

        },
    )
}
