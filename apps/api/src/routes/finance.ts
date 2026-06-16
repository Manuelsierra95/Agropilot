import { Hono } from "hono"
import type { Env } from "@env"
import type { AuthVariables } from "@/types/variables"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "@/middlewares/require-auth"
import { createCacheMiddleware } from "@/middlewares/cache"
import {
  bulkCreateTransactions,
  createTransaction,
  deleteTransaction,
  getCampaignMarginForDashboard,
  getFinanceResumeForDashboard,
  getOlivePricesForDashboard,
  getParcelsFinanceComparisonForDashboard,
  getParcelsSellingWindowsForDashboard,
  getProductionValueForDashboard,
  getRecentTransactionsForDashboard,
  getSellingWindowForDashboard,
  getTransactionById,
  getTransactionsForDashboard,
  listTransactions,
  updateTransaction,
} from "@/services/finance"
import {
  transactionBulkCreateSchema,
  transactionCreateSchema,
  transactionUpdateInputSchema,
  dashboardScopeQuerySchema,
  dashboardRecentTransactionsQuerySchema,
} from "@workspace/schemas"

const cache5min = createCacheMiddleware({ ttlSeconds: 300 })
const cache1min = createCacheMiddleware({ ttlSeconds: 60 })

export const financeRoutes = new Hono<{
  Bindings: Env
  Variables: AuthVariables
}>()
  .use(requireAuth)
  .get("/", async (c) => {
    const transactions = await listTransactions(c.get("organizationId"))
    return c.json({ transactions }, 200)
  })
  .get("/olive-prices", cache5min, async (c) => {
    const olivePrices = await getOlivePricesForDashboard()
    return c.json({ olivePrices }, 200)
  })
  .get(
    "/selling-window",
    cache5min,
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const sellingWindow = await getSellingWindowForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ sellingWindow }, 200)
    }
  )
  .get(
    "/resume",
    cache5min,
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const finance = await getFinanceResumeForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ finance }, 200)
    }
  )
  .get(
    "/campaign-margin",
    cache5min,
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const campaignMargin = await getCampaignMarginForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ campaignMargin }, 200)
    }
  )
  .get(
    "/recent-transactions",
    zValidator("query", dashboardRecentTransactionsQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const transactions = await getRecentTransactionsForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ transactions }, 200)
    }
  )
  .get(
    "/transactions",
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const transactions = await getTransactionsForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ transactions }, 200)
    }
  )
  .get(
    "/production-value",
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const productionValue = await getProductionValueForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ productionValue }, 200)
    }
  )
  .get(
    "/selling-windows",
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const sellingWindows = await getParcelsSellingWindowsForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ sellingWindows }, 200)
    }
  )
  .get(
    "/parcels-comparison",
    zValidator("query", dashboardScopeQuerySchema),
    async (c) => {
      const filters = c.req.valid("query")
      const parcelsComparison = await getParcelsFinanceComparisonForDashboard(
        c.get("organizationId"),
        filters
      )
      return c.json({ parcelsComparison }, 200)
    }
  )
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
