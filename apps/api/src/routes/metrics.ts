import { zValidator } from '@hono/zod-validator'
import { handleServiceResponse } from '@/handlers/responseHandler'
import {
  metricsPostSchema,
  metricsBulkPostSchema,
  metricsPutSchema,
  metricsQuerySchema,
  metricsParcelQuerySchema,
  metricsLatestsQuerySchema,
} from '@/schemas/metrics'
import {
  getMetrics,
  getMetricById,
  getLatestsMetricsByParcelId,
  getUserLatestsMetrics,
  createMetric,
  createBulkMetrics,
  updateMetric,
  deleteMetric,
} from '@/services/metrics'
import honoFactory from '@/hono-factory'
import { requireAuth } from '@/middlewares/auth'

export const metricsRoutes = honoFactory
  .createApp()
  .use(requireAuth)
  .get('/', zValidator('query', metricsQuerySchema), async (c) => {
    const userId = c.get('user')!.id
    const queryParams = c.req.valid('query')
    const res = await getMetrics(c.get('db'), userId, queryParams)
    return handleServiceResponse(c, res)
  })
  .get(
    '/parcel/:parcelId',
    zValidator('query', metricsParcelQuerySchema),
    async (c) => {
      const userId = c.get('user')!.id
      const parcelId = Number(c.req.param('parcelId'))
      const queryParams = c.req.valid('query')
      const res = await getMetrics(c.get('db'), userId, {
        ...queryParams,
        parcelId,
      })
      return handleServiceResponse(c, res)
    }
  )
  .get(
    '/parcel/:parcelId/latests',
    zValidator('query', metricsLatestsQuerySchema),
    async (c) => {
      const userId = c.get('user')!.id
      const parcelId = Number(c.req.param('parcelId'))
      const { metricTypes } = c.req.valid('query')
      const queryParams = c.req.valid('query')
      const res = await getLatestsMetricsByParcelId(
        c.get('db'),
        parcelId,
        // metricTypes may be a string or array depending on query; service expects array
        Array.isArray(metricTypes)
          ? metricTypes
          : metricTypes
            ? [metricTypes]
            : [],
        userId,
        queryParams
      )
      return handleServiceResponse(c, res)
    }
  )
  //  .post(
  //   '/latests',
  //   zValidator('json', metricsLatestsSchema),
  //   zValidator('query', metricsLatestsQuerySchema),
  //   async (c) => {
  //     const userId = c.get('user')!.id
  //     const { metricTypes } = c.req.valid('json')
  //     const queryParams = c.req.valid('query')
  //     const res = await getUserLatestsMetrics(
  //       c.get('db'),
  //       userId,
  //       metricTypes,
  //       queryParams
  //     )
  //     return handleServiceResponse(c, res)
  //   }
  // )
  .get(
    '/latests',
    zValidator('query', metricsLatestsQuerySchema),
    async (c) => {
      const userId = c.get('user')!.id
      const { metricTypes } = c.req.valid('query')
      const queryParams = c.req.valid('query')
      const res = await getUserLatestsMetrics(
        c.get('db'),
        userId,
        Array.isArray(metricTypes)
          ? metricTypes
          : metricTypes
            ? [metricTypes]
            : [],
        queryParams
      )
      return handleServiceResponse(c, res)
    }
  )
  .get('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await getMetricById(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
  .post('/', zValidator('json', metricsPostSchema), async (c) => {
    const userId = c.get('user')!.id
    const metricData = c.req.valid('json')
    const res = await createMetric(c.get('db'), {
      ...metricData,
      userId,
    })
    return handleServiceResponse(c, res)
  })
  .post('/bulk', zValidator('json', metricsBulkPostSchema), async (c) => {
    const userId = c.get('user')!.id
    const metricsData = c.req.valid('json')
    const res = await createBulkMetrics(c.get('db'), metricsData, userId)
    return handleServiceResponse(c, res)
  })
  .put('/:id', zValidator('json', metricsPutSchema), async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const metricData = c.req.valid('json')
    const res = await updateMetric(c.get('db'), id, userId, metricData)
    return handleServiceResponse(c, res)
  })
  .delete('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await deleteMetric(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
