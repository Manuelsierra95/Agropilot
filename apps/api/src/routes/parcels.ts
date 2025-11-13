import { zValidator } from '@hono/zod-validator'
import { handleServiceResponse } from '@/handlers/responseHandler'
import {
  parcelsPostSchema,
  parcelsPutSchema,
  parcelsQuerySchema,
} from '@/schemas/parcels'
import {
  getUserParcels,
  getParcelById,
  createParcel,
  updateParcel,
  deleteParcel,
} from '@/services/parcels'
import honoFactory from '@/hono-factory'
import { requireAuth } from '@/middlewares/auth'

export const parcelsRoutes = honoFactory
  .createApp()
  .use(requireAuth)
  .get('/', zValidator('query', parcelsQuerySchema), async (c) => {
    const userId = c.get('user')!.id
    const queryParams = c.req.valid('query')
    const res = await getUserParcels(c.get('db'), userId, queryParams)
    return handleServiceResponse(c, res)
  })
  .get('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await getParcelById(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
  .post('/', zValidator('json', parcelsPostSchema), async (c) => {
    const userId = c.get('user')!.id
    const parcelData = c.req.valid('json')
    const res = await createParcel(c.get('db'), {
      ...parcelData,
      userId,
    })
    return handleServiceResponse(c, res)
  })
  .put('/:id', zValidator('json', parcelsPutSchema), async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const parcelData = c.req.valid('json')
    const res = await updateParcel(c.get('db'), id, userId, parcelData)
    return handleServiceResponse(c, res)
  })
  .delete('/:id', async (c) => {
    const userId = c.get('user')!.id
    const id = Number(c.req.param('id'))
    const res = await deleteParcel(c.get('db'), id, userId)
    return handleServiceResponse(c, res)
  })
