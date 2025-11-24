import { eq, and, desc, count, gte, lte } from 'drizzle-orm'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { serviceWrapper } from '@/handlers/serviceWrapper'
import { events } from '@/db/app-schema.sql'
import dayjs from 'dayjs'
import type { CreateEvents, GetAllEventsOptions } from '@/types/events'

export const getEvents = (
  db: DrizzleD1Database<any>,
  userId: string,
  options: GetAllEventsOptions & { parcelId?: number } = {}
) => {
  const {
    page = 1,
    limit = 10,
    category,
    isRead,
    parcelId,
    todayEvents,
  } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      const conditions = [eq(events.userId, userId)]

      if (parcelId !== undefined) {
        conditions.push(eq(events.parcelId, parcelId))
      }
      if (category !== undefined) {
        conditions.push(eq(events.category, category))
      }
      if (isRead !== undefined) {
        conditions.push(eq(events.isRead, isRead))
      }
      if (todayEvents === 1) {
        const startOfDay = dayjs().startOf('day').toDate()
        const endOfDay = dayjs().endOf('day').toDate()
        conditions.push(gte(events.startTime, startOfDay))
        conditions.push(lte(events.startTime, endOfDay))
      }

      const whereCondition = and(...conditions)

      const totalResult = await db
        .select({ count: count() })
        .from(events)
        .where(whereCondition)
        .all()

      const total = totalResult[0]?.count || 0

      const eventsList = await db
        .select()
        .from(events)
        .where(whereCondition)
        .orderBy(desc(events.createdAt))
        .limit(limit)
        .offset(offset)
        .all()

      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        data: eventsList,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      }
    },
    success: {
      message: parcelId
        ? 'Eventos de calendario de la parcela encontrados'
        : 'Eventos de calendario encontrados',
    },
    error: {
      message: parcelId
        ? 'Error al obtener eventos de calendario de la parcela'
        : 'Error al obtener eventos de calendario',
    },
    onNotFound: {
      condition: (result: any) => !result?.data || result.data.length === 0,
      message:
        todayEvents === 1
          ? `No se han encontrado eventos para hoy ${dayjs().format('DD/MM/YYYY')}`
          : parcelId
            ? 'No se encontraron eventos de calendario para esta parcela'
            : 'No se encontraron eventos de calendario',
      details:
        todayEvents === 1
          ? `No existen eventos de calendario para hoy ${dayjs().format('DD/MM/YYYY')} para el usuario ${userId}`
          : parcelId
            ? `No existen eventos de calendario para el usuario ${userId} y la parcela ${parcelId}`
            : 'No existen eventos de calendario en la base de datos',
      status: 404,
    },
  })
}

export const getEventsById = (db: DrizzleD1Database<any>, id: number) =>
  serviceWrapper({
    operation: async () => {
      return await db.select().from(events).where(eq(events.id, id)).get()
    },
    success: {
      message: 'Evento encontrado',
    },
    error: {
      message: 'Error al obtener el evento',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'Evento no encontrado',
      details: 'No existe un evento con ese id',
      status: 404,
    },
  })

export const createEvent = (db: DrizzleD1Database<any>, data: CreateEvents) =>
  serviceWrapper({
    operation: async () => {
      console.log('Creating event with data:', data)
      const result = await db.insert(events).values(data).returning()
      return result[0]
    },
    success: {
      message: 'Evento creado',
      status: 201,
    },
    error: {
      message: 'Error al crear el evento',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo crear el evento',
      details: 'No se encontró el evento recién creado',
      status: 500,
    },
  })

export const updateEvent = (
  db: DrizzleD1Database<any>,
  id: number,
  data: Partial<CreateEvents>
) =>
  serviceWrapper({
    operation: async () => {
      const updatedEvent = await db
        .update(events)
        .set({
          ...data,
          updatedAt: dayjs().toDate(),
        })
        .where(eq(events.id, id))
        .returning()
      return updatedEvent[0]
    },
    success: {
      message: 'Evento actualizado',
    },
    error: {
      message: 'Error al actualizar el evento',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo actualizar el evento',
      details: 'No se encontró el evento para actualizar',
      status: 404,
    },
  })

export const deleteEvent = (db: DrizzleD1Database<any>, id: number) =>
  serviceWrapper({
    operation: async () => {
      await db.delete(events).where(eq(events.id, id)).returning()
      return null
    },
    success: {
      message: 'Evento eliminado',
    },
    error: {
      message: 'Error al eliminar el evento',
    },
  })
