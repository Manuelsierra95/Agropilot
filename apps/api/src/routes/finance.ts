import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import {
  bulkCreateTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from "@/services/finance"
import {
  transactionBulkCreateSchema,
  transactionCreateSchema,
  transactionUpdateInputSchema,
} from "@workspace/schemas"

export const financeRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", async (c) => {
    const transactions = await listTransactions(c.get("organizationId"))
    return c.json({ transactions }, 200)
  })
  .post("/bulk", zValidator("json", transactionBulkCreateSchema), async (c) => {
    const { transactions } = c.req.valid("json")
    const created = await bulkCreateTransactions(
      c.get("organizationId"),
      c.get("user").id,
      transactions
    )
    return c.json({ transactions: created, count: created.length }, 201)
  })
  .get("/:id", async (c) => {
    const transaction = await getTransactionById(
      c.get("organizationId"),
      c.req.param("id")
    )
    return c.json({ transaction }, 200)
  })
  .post("/", zValidator("json", transactionCreateSchema), async (c) => {
    const data = c.req.valid("json")
    const transaction = await createTransaction(
      c.get("organizationId"),
      c.get("user").id,
      data
    )
    return c.json({ transaction }, 201)
  })
  .put("/:id", zValidator("json", transactionUpdateInputSchema), async (c) => {
    const data = c.req.valid("json")
    const transaction = await updateTransaction(
      c.get("organizationId"),
      c.req.param("id"),
      data
    )
    return c.json({ transaction }, 200)
  })
  .delete("/:id", async (c) => {
    await deleteTransaction(c.get("organizationId"), c.req.param("id"))
    return c.json({ id: c.req.param("id") }, 200)
  })
