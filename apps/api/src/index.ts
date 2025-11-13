import honoFactory from '@/hono-factory'
import { corsMiddleware } from '@/middlewares/cors'
import { cacheMiddleware } from '@/middlewares/cache'
import { csrfMiddleware } from '@/middlewares/csrf'
import { rateLimitMiddleware } from '@/middlewares/rateLimit'
import { sessionMiddleware } from '@/middlewares/session'
import { eventsRoutes } from '@/routes/events'
import { getAuth } from '@/lib/auth'
import { parcelsRoutes } from '@/routes/parcels'
import { metricsRoutes } from '@/routes/metrics'
import { transactionsRoutes } from './routes/transactions'

const routes = honoFactory
  .createApp()
  .basePath('/api')
  .use(corsMiddleware)
  .use(csrfMiddleware)
  .use(sessionMiddleware)
  // .use(rateLimitMiddleware)
  .get('/healthz', (c) => c.text('OK'))
  .on(['POST', 'GET'], '/auth/*', (c) => getAuth(c).handler(c.req.raw))
  .basePath('/v1')
  // .use(cacheMiddleware)
  .route('/parcels', parcelsRoutes)
  .route('/events', eventsRoutes)
  .route('/metrics', metricsRoutes)
  .route('/transactions', transactionsRoutes)

export default routes
