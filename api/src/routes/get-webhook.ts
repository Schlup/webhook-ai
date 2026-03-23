import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createSelectSchema } from "drizzle-zod"
import { z } from 'zod'
import { webhhooks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
    app.get(
        '/api/webhooks/:id',
        {
            schema: {
                summary: 'Get a sepecific webhook by ID',
                tags: ['Webhooks'],
                params: z.object({
                    id: z.uuidv7(),
                }),
                response: {
                    200: createSelectSchema(webhhooks),
                    404: z.object({ message: z.string() })
                },
            },
        },
        async (request, reply) => {

            const { id } = request.params

            const result = await db
                .select()
                .from(webhhooks)
                .where(eq(webhhooks.id, id))
                .limit(1)

            if (result.length === 0) {
                return reply.status(404).send({ message: "Webhook not found" })
            }

            return reply.send(result[0])
        },
    )
}
