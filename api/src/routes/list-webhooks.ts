import { db } from '@/db'
import { webhhooks } from '@/db/schema'
import { desc, lt } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List webhooks',
        tags: ['Webhooks'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
          cursor: z.string().optional()
        }),
        response: {
          200: z.object({
            webhooks: z.array(
              createSelectSchema(webhhooks).pick({
                id: true,
                method: true,
                path: true,
                createdAt: true,
              })
            ),
            nextCursor: z.string().nullable()
          })

        },
      },
    },
    async (request, reply) => {
      const { limit, cursor } = request.query

      const result = await db
        .select({
          id: webhhooks.id,
          method: webhhooks.method,
          path: webhhooks.path,
          createdAt: webhhooks.createdAt
        })
        .from(webhhooks)
        .where(cursor ? lt(webhhooks.id, cursor) : undefined)
        .orderBy(desc(webhhooks.id))
        .limit(limit + 1)

      const hasMore = result.length > limit

      const items = hasMore ? result.slice(0, limit) : result

      const nextCursor = hasMore ? items[items.length - 1].id : null

      return reply.send({
        webhooks: items,
        nextCursor
      })
    },
  )
}
