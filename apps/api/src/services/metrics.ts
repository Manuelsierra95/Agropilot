import type { CreateMetric, GetAllMetricsOptions } from '@/types/metrics'
import { eq, and, desc, count, gte, lte, inArray } from 'drizzle-orm'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { serviceWrapper } from '@/handlers/serviceWrapper'
import { metrics } from '@/db/app-schema.sql'
import dayjs from 'dayjs'
import { DB_BATCH_SIZE } from '@/config/constants'

export const getMetrics = (
  db: DrizzleD1Database<any>,
  userId: string,
  options: GetAllMetricsOptions & { parcelId?: number } = {}
) => {
  const {
    page = 1,
    limit = 10,
    metricType,
    parcelId,
    source,
    startDate,
    endDate,
  } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      const conditions = [eq(metrics.userId, userId)]

      if (parcelId !== undefined) {
        conditions.push(eq(metrics.parcelId, parcelId))
      }
      if (metricType !== undefined) {
        conditions.push(eq(metrics.metricType, metricType))
      }
      if (source !== undefined) {
        conditions.push(eq(metrics.source, source))
      }
      if (startDate !== undefined) {
        conditions.push(gte(metrics.date, startDate))
      }
      if (endDate !== undefined) {
        conditions.push(lte(metrics.date, endDate))
      }

      const whereCondition = and(...conditions)

      const totalResult = await db
        .select({ count: count() })
        .from(metrics)
        .where(whereCondition)
        .all()

      const total = totalResult[0]?.count || 0

      const metricsList = await db
        .select()
        .from(metrics)
        .where(whereCondition)
        .orderBy(desc(metrics.date))
        .limit(limit)
        .offset(offset)
        .all()

      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        data: metricsList,
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
        ? 'Métricas de la parcela encontradas'
        : 'Métricas encontradas',
    },
    error: {
      message: parcelId
        ? 'Error al obtener métricas de la parcela'
        : 'Error al obtener métricas',
    },
    onNotFound: {
      condition: (result: any) => !result?.data || result.data.length === 0,
      message: parcelId
        ? 'No se encontraron métricas para esta parcela'
        : 'No se encontraron métricas',
      details: parcelId
        ? `No existen métricas para el usuario ${userId} y la parcela ${parcelId}`
        : `No existen métricas para el usuario ${userId}`,
      status: 404,
    },
  })
}

export const getMetricById = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      return await db
        .select()
        .from(metrics)
        .where(and(eq(metrics.id, id), eq(metrics.userId, userId)))
        .get()
    },
    success: {
      message: 'Métrica encontrada',
    },
    error: {
      message: 'Error al obtener la métrica',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'Métrica no encontrada',
      details: 'No existe una métrica con ese id',
      status: 404,
    },
  })

export const getUserLatestsMetrics = (
  db: DrizzleD1Database<any>,
  userId: string,
  metricTypes: string[],
  options: { page?: number; limit?: number } = {}
) => {
  const { page = 1, limit = 10 } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      if (!metricTypes || metricTypes.length === 0) {
        return {
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      }

      const metricsPromises = metricTypes.map(async (metricType) => {
        const metricsList = await db
          .select()
          .from(metrics)
          .where(
            and(eq(metrics.userId, userId), eq(metrics.metricType, metricType))
          )
          .orderBy(desc(metrics.date))
          .limit(limit)
          .offset(offset)
          .all()

        return {
          metricType,
          data: metricsList,
        }
      })

      const metricsResults = await Promise.all(metricsPromises)

      const groupedData: Record<string, any[]> = {}
      let totalItems = 0

      metricsResults.forEach(({ metricType, data }) => {
        groupedData[metricType] = data
        totalItems += data.length
      })

      const totalPages = Math.ceil(totalItems / (limit * metricTypes.length))
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        ...groupedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      }
    },
    success: {
      message: 'Últimas métricas del usuario obtenidas',
    },
    error: {
      message: 'Error al obtener las últimas métricas del usuario',
    },
    onNotFound: {
      condition: (result: any) => {
        if (!result) return true
        // Excluir la paginación y verificar si todos los arrays de métricas están vacíos
        const metricArrays = Object.keys(result).filter(
          (key) => key !== 'pagination'
        )
        return (
          metricArrays.length === 0 ||
          metricArrays.every((key) => result[key]?.length === 0)
        )
      },
      message: 'No se encontraron métricas',
      details: `No existen métricas con los tipos proporcionados para el usuario ${userId}`,
      status: 404,
    },
  })
}

export const getLatestsMetricsByParcelId = (
  db: DrizzleD1Database<any>,
  parcelId: number,
  metricTypes: string[],
  userId: string,
  options: { page?: number; limit?: number } = {}
) => {
  const { page = 1, limit = 10 } = options
  const offset = (page - 1) * limit

  return serviceWrapper({
    operation: async () => {
      if (!metricTypes || metricTypes.length === 0) {
        return {
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      }

      const metricsPromises = metricTypes.map(async (metricType) => {
        const metricsList = await db
          .select()
          .from(metrics)
          .where(
            and(
              eq(metrics.userId, userId),
              eq(metrics.parcelId, parcelId),
              eq(metrics.metricType, metricType)
            )
          )
          .orderBy(desc(metrics.date))
          .limit(limit)
          .offset(offset)
          .all()

        return {
          metricType,
          data: metricsList,
        }
      })

      const metricsResults = await Promise.all(metricsPromises)

      const groupedData: Record<string, any[]> = {}
      let totalItems = 0

      metricsResults.forEach(({ metricType, data }) => {
        groupedData[metricType] = data
        totalItems += data.length
      })

      const totalPages = Math.ceil(totalItems / (limit * metricTypes.length))
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return {
        ...groupedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      }
    },
    success: {
      message: 'Últimas métricas obtenidas',
    },
    error: {
      message: 'Error al obtener las últimas métricas',
    },
    onNotFound: {
      condition: (result: any) => {
        if (!result) return true
        // Excluir la paginación y verificar si todos los arrays de métricas están vacíos
        const metricArrays = Object.keys(result).filter(
          (key) => key !== 'pagination'
        )
        return (
          metricArrays.length === 0 ||
          metricArrays.every((key) => result[key]?.length === 0)
        )
      },
      message: 'No se encontraron métricas',
      details: `No existen métricas con los tipos proporcionados para la parcela ${parcelId}`,
      status: 404,
    },
  })
}

export const createMetric = (db: DrizzleD1Database<any>, data: CreateMetric) =>
  serviceWrapper({
    operation: async () => {
      const result = await db.insert(metrics).values(data).returning()
      return result[0]
    },
    success: {
      message: 'Métrica creada',
      status: 201,
    },
    error: {
      message: 'Error al crear la métrica',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo crear la métrica',
      details: 'No se encontró la métrica recién creada',
      status: 500,
    },
  })

export const createBulkMetrics = (
  db: DrizzleD1Database<any>,
  metricsData: Omit<CreateMetric, 'userId'>[],
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      const metricsToInsert = metricsData.map((metric) => ({
        ...metric,
        userId,
      }))

      // Insertar en lotes para evitar el límite de variables SQL
      const result = []
      for (let i = 0; i < metricsToInsert.length; i += DB_BATCH_SIZE) {
        const batch = metricsToInsert.slice(i, i + DB_BATCH_SIZE)
        const batchResult = await db.insert(metrics).values(batch).returning()
        result.push(...batchResult)
      }
      return {
        created: result.length,
        metrics: result,
      }
    },
    success: {
      message: 'Métricas creadas exitosamente',
      status: 201,
    },
    error: {
      message: 'Error al crear las métricas',
    },
    onNotFound: {
      condition: (result: any) => !result || result.created === 0,
      message: 'No se pudieron crear las métricas',
      details: 'No se encontraron las métricas recién creadas',
      status: 500,
    },
  })

export const updateMetric = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string,
  data: Partial<CreateMetric>
) =>
  serviceWrapper({
    operation: async () => {
      const updatedMetric = await db
        .update(metrics)
        .set({
          ...data,
          updatedAt: dayjs().toDate(),
        })
        .where(and(eq(metrics.id, id), eq(metrics.userId, userId)))
        .returning()
      return updatedMetric[0]
    },
    success: {
      message: 'Métrica actualizada',
    },
    error: {
      message: 'Error al actualizar la métrica',
    },
    onNotFound: {
      condition: (result) => !result,
      message: 'No se pudo actualizar la métrica',
      details: 'No se encontró la métrica para actualizar',
      status: 404,
    },
  })

export const deleteMetric = (
  db: DrizzleD1Database<any>,
  id: number,
  userId: string
) =>
  serviceWrapper({
    operation: async () => {
      await db
        .delete(metrics)
        .where(and(eq(metrics.id, id), eq(metrics.userId, userId)))
        .returning()
      return null
    },
    success: {
      message: 'Métrica eliminada',
    },
    error: {
      message: 'Error al eliminar la métrica',
    },
  })
