import type { CreateParcel, GetAllParcelsOptions } from '@/types/parcels'
import { eq, and, desc, count } from 'drizzle-orm'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { serviceWrapper } from '@/handlers/serviceWrapper'
import { parcels } from '@/db/app-schema.sql'
import dayjs from 'dayjs'

export const getUserParcels = (
  db: DrizzleD1Database<any>,
  userId: string,
  options: GetAllParcelsOptions = {}
) => {
  const { page = 1, limit = 10, type, irrigationType } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      const conditions = [eq(parcels.userId, userId)]

      if (type !== undefined) {
        conditions.push(eq(parcels.type, type))
      }
      if (irrigationType !== undefined) {
        conditions.push(eq(parcels.irrigationType, irrigationType))
      }

      const whereCondition = and(...conditions)

      const totalResult = await db
        .select({ count: count() })
        .from(parcels)
        .where(whereCondition)
        .all()

      const total = totalResult[0]?.count || 0

      const parcelsList = await db
        .select()
        .from(parcels)
        .where(whereCondition)
        .orderBy(desc(parcels.createdAt))
        .limit(limit)
        .offset(offset)
        .all()

      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        data: parcelsList,
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
      message: 'Parcelas encontradas',
    },
    error: {
      message: 'Error al obtener parcelas',
    },
    onNotFound: {
      condition: (result: any) => !result?.data || result.data.length === 0,
      message: 'No se encontraron parcelas',
      details: `No existen parcelas para el usuario ${userId}`,
      status: 404,
    },
  })
}

export const getParcelById = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      return await db
        .select()
        .from(parcels)
        .where(and(eq(parcels.id, id), eq(parcels.userId, userId)))
        .get()
    },
    success: {
      message: 'Parcela encontrada',
    },
    error: {
      message: 'Error al obtener la parcela',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'Parcela no encontrada',
      details: 'No existe una parcela con ese id',
      status: 404,
    },
  })

export const createParcel = (db: DrizzleD1Database<any>, data: CreateParcel) =>
  serviceWrapper({
    operation: async () => {
      const result = await db.insert(parcels).values(data).returning()
      return result[0]
    },
    success: {
      message: 'Parcela creada',
      status: 201,
    },
    error: {
      message: 'Error al crear la parcela',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo crear la parcela',
      details: 'No se encontró la parcela recién creada',
      status: 500,
    },
  })

export const updateParcel = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string,
  data: Partial<CreateParcel>
) =>
  serviceWrapper({
    operation: async () => {
      const updatedParcel = await db
        .update(parcels)
        .set({
          ...data,
          updatedAt: dayjs().toDate(),
        })
        .where(and(eq(parcels.id, id), eq(parcels.userId, userId)))
        .returning()
      return updatedParcel[0]
    },
    success: {
      message: 'Parcela actualizada',
    },
    error: {
      message: 'Error al actualizar la parcela',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo actualizar la parcela',
      details: 'No se encontró la parcela para actualizar',
      status: 404,
    },
  })

export const deleteParcel = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      await db
        .delete(parcels)
        .where(and(eq(parcels.id, id), eq(parcels.userId, userId)))
        .returning()
      return null
    },
    success: {
      message: 'Parcela eliminada',
    },
    error: {
      message: 'Error al eliminar la parcela',
    },
  })
