import { zValidator } from '@hono/zod-validator'
import { handleServiceResponse } from '@/handlers/responseHandler'
import {
  eventsPostSchema,
  eventsPutSchema,
  eventsQuerySchema,
} from '@/schemas/events'
import {
  getEvents,
  getEventsById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/events'
import honoFactory from '@/hono-factory'
import { requireAuth } from '@/middlewares/auth'

export const eventsRoutes = honoFactory
  .createApp()
  .use(requireAuth)
  .get('/', zValidator('query', eventsQuerySchema), async (c) => {
    const userId = c.get('user')!.id
    const queryParams = c.req.valid('query')
    const res = await getEvents(c.get('db'), userId, queryParams)
    return handleServiceResponse(c, res)
  })
  .get(
    '/parcel/:parcelId',
    zValidator('query', eventsQuerySchema),
    async (c) => {
      const userId = c.get('user')!.id
      const parcelId = Number(c.req.param('parcelId'))
      const queryParams = c.req.valid('query')
      const res = await getEvents(c.get('db'), userId, {
        ...queryParams,
        parcelId,
      })
      return handleServiceResponse(c, res)
    }
  )
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const res = await getEventsById(c.get('db'), id)
    return handleServiceResponse(c, res)
  })
  .post('/', zValidator('json', eventsPostSchema), async (c) => {
    const eventsData = c.req.valid('json')
    const userId = c.get('user')!.id
    const res = await createEvent(c.get('db'), { ...eventsData, userId })
    return handleServiceResponse(c, res)
  })
  .put('/:id', zValidator('json', eventsPutSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const eventsData = c.req.valid('json')
    const userId = c.get('user')!.id
    const res = await updateEvent(c.get('db'), id, {
      ...eventsData,
      userId,
    })
    return handleServiceResponse(c, res)
  })
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const res = await deleteEvent(c.get('db'), id)
    return handleServiceResponse(c, res)
  })
