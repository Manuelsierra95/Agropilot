import { zValidator } from '@hono/zod-validator'
import { handleServiceResponse } from '@/handlers/responseHandler'
import {
  transactionsPostSchema,
  transactionsBulkPostSchema,
  transactionsPutSchema,
  transactionsQuerySchema,
  transactionsParcelQuerySchema,
} from '@/schemas/transactions'
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  createBulkTransactions,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactions'
import honoFactory from '@/hono-factory'
import { requireAuth } from '@/middlewares/auth'

export const transactionsRoutes = honoFactory
  .createApp()
  .use(requireAuth)
  .get('/', zValidator('query', transactionsQuerySchema), async (c) => {
    const userId = c.get('user')!.id
    const queryParams = c.req.valid('query')
    const res = await getTransactions(c.get('db'), userId, queryParams)
    return handleServiceResponse(c, res)
  })
  .get(
    '/parcel/:parcelId',
    zValidator('query', transactionsParcelQuerySchema),
    async (c) => {
      const userId = c.get('user')!.id
      const parcelId = Number(c.req.param('parcelId'))
      const queryParams = c.req.valid('query')
      const res = await getTransactions(c.get('db'), userId, {
        ...queryParams,
        parcelId,
      })
      return handleServiceResponse(c, res)
    }
  )
  .get('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await getTransactionById(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
  .post('/', zValidator('json', transactionsPostSchema), async (c) => {
    const userId = c.get('user')!.id
    const transactionData = c.req.valid('json')
    const res = await createTransaction(c.get('db'), {
      ...transactionData,
      userId,
    })
    return handleServiceResponse(c, res)
  })
  .post('/bulk', zValidator('json', transactionsBulkPostSchema), async (c) => {
    const userId = c.get('user')!.id
    const transactionsData = c.req.valid('json')
    const res = await createBulkTransactions(
      c.get('db'),
      transactionsData,
      userId
    )
    return handleServiceResponse(c, res)
  })
  .put('/:id', zValidator('json', transactionsPutSchema), async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const transactionData = c.req.valid('json')
    const res = await updateTransaction(
      c.get('db'),
      id,
      userId,
      transactionData
    )
    return handleServiceResponse(c, res)
  })
  .delete('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await deleteTransaction(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
