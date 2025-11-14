import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { DBSchema } from '@/db'
import { events, parcels, transactions, metrics } from '@/db/app-schema.sql'
import { users } from '@/db/auth-schema.sql'
import dayjs from 'dayjs'
import { demoParcels } from '@/utils/demoData/parcelData'
import { demoEvents } from '@/utils/demoData/eventData'
import { demoTransactions } from '@/utils/demoData/transactionData'
import { demoMetrics } from '@/utils/demoData/metricData'
import { DB_BATCH_SIZE } from '@/config/constants'

interface DemoUser {
  id: string
  email: string
}

/**
 * Regenera los datos de demostración para un usuario si ha pasado más de un día
 * desde la última regeneración
 */
export async function regenerateDemoDataIfNeeded(
  db: DrizzleD1Database<DBSchema>,
  user: DemoUser
) {
  const now = Date.now()
  const lastSeed = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .get()
    .then((u) => (u?.lastDemoSeed ? new Date(u.lastDemoSeed).getTime() : 0))
  const oneDay = 24 * 60 * 60 * 1000

  console.log('Last seed time:', new Date(lastSeed), 'for user:', user.email)

  // No regenerar si no ha pasado un día completo
  if (now - lastSeed < oneDay) {
    return
  }

  // Borrar datos anteriores del usuario
  await db.delete(events).where(eq(events.userId, user.id))
  await db.delete(metrics).where(eq(metrics.userId, user.id))
  await db.delete(transactions).where(eq(transactions.userId, user.id))
  await db.delete(parcels).where(eq(parcels.userId, user.id))

  const parcelsToInsert = demoParcels.map((parcel) => ({
    ...parcel,
    userId: user.id,
  }))

  const insertedParcels = await db
    .insert(parcels)
    .values(parcelsToInsert)
    .returning()

  const eventsToInsert = demoEvents.map((event) => {
    const startTime = dayjs()
      .add(event.startTimeOffset.days, 'day')
      .hour(event.startTimeOffset.hour)
      .minute(event.startTimeOffset.minute)
      .toDate()

    const endTime = dayjs()
      .add(event.endTimeOffset.days, 'day')
      .hour(event.endTimeOffset.hour)
      .minute(event.endTimeOffset.minute)
      .toDate()

    return {
      userId: user.id,
      parcelId: insertedParcels[event.parcelIndex]?.id,
      title: event.title,
      description: event.description,
      startTime,
      endTime,
      category: event.category,
      color: event.color,
      tags: event.tags,
      isRead: event.isRead,
    }
  })

  // Insertar eventos en lotes para evitar el límite de variables SQL
  for (let i = 0; i < eventsToInsert.length; i += DB_BATCH_SIZE) {
    const batch = eventsToInsert.slice(i, i + DB_BATCH_SIZE)
    try {
      await db.insert(events).values(batch)
    } catch (error) {
      throw error
    }
  }

  const transactionsToInsert = demoTransactions.map((transaction) => ({
    userId: user.id,
    parcelId: insertedParcels[transaction.parcelIndex]?.id,
    type: transaction.type,
    category: transaction.category,
    concept: transaction.concept,
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    invoiceNumber: transaction.invoiceNumber,
    date: dayjs().subtract(transaction.daysAgo, 'days').toDate(),
    description: transaction.description,
  }))

  // Insertar transacciones en lotes
  for (let i = 0; i < transactionsToInsert.length; i += DB_BATCH_SIZE) {
    const batch = transactionsToInsert.slice(i, i + DB_BATCH_SIZE)
    try {
      await db.insert(transactions).values(batch)
    } catch (error) {
      throw error
    }
  }

  const metricsToInsert = demoMetrics.map((metric) => ({
    userId: user.id,
    parcelId: insertedParcels[metric.parcelIndex]?.id,
    metricType: metric.metricType,
    value: metric.value,
    previousValue: metric.previousValue,
    unit: metric.unit,
    source: metric.source,
    date: dayjs().toDate(),
  }))

  // Insertar métricas en lotes
  for (let i = 0; i < metricsToInsert.length; i += DB_BATCH_SIZE) {
    const batch = metricsToInsert.slice(i, i + DB_BATCH_SIZE)
    try {
      await db.insert(metrics).values(batch)
    } catch (error) {
      throw error
    }
  }

  // Actualizar el campo lastDemoSeed del usuario
  await db
    .update(users)
    .set({ lastDemoSeed: new Date(now) })
    .where(eq(users.id, user.id))
}
