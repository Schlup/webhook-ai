import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7"

export const webhhooks = pgTable("webhooks", {
    id: text().primaryKey().$defaultFn(() => uuidv7()),
    method: text().notNull(),
    path: text().notNull(),
    ip: text().notNull(),
    statusCode: integer().notNull().default(200),
    contentType: text(),
    contentLength: integer(),
    queryParms: jsonb().$type<Record<string, string>>(),
    headers: jsonb().$type<Record<string, string>>().notNull(),
    body: text(),
    createdAt: timestamp().notNull().defaultNow(),
})