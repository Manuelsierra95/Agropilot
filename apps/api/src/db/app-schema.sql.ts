import dayjs from 'dayjs'
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { users } from './auth-schema.sql'
import { sql } from 'drizzle-orm'

export const parcels = sqliteTable('parcels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  area: real('area'), // hectáreas
  type: text('type'), // tipo de cultivo
  irrigationType: text('irrigation_type'), // tipo de riego
  geometryType: text('geometry_type').notNull().default('Polygon'), // 'Polygon', 'Point', 'LineString', etc.
  geometryCoordinates: text('geometry_coordinates', { mode: 'json' })
    .notNull()
    .$type<number[][][]>(), // Para Polygon: [[[lng, lat], [lng, lat], ...]]
  description: text('description'),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
})

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  parcelId: integer('parcel_id').references(() => parcels.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startTime: integer('start_time', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  endTime: integer('end_time', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  category: text('category').notNull(),
  color: text('color').notNull(),
  tags: text('tags', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  isRead: integer('is_read').notNull().default(0),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
})

export const metrics = sqliteTable('metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  parcelId: integer('parcel_id')
    .references(() => parcels.id)
    .notNull(),
  metricType: text('metric_type').notNull(), // 'olive_price' | 'yield_estimate' | 'rainfall' | 'temperature' | 'humidity' | etc
  value: real('value').notNull(),
  previousValue: real('previous_value'),
  unit: text('unit').notNull(),
  source: text('source').default('manual'), // 'manual' | 'api' | 'sensor' | 'calculated'
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(), // JSON con datos adicionales específicos del tipo
  date: integer('date', {
    mode: 'timestamp',
  })
    .notNull()
    .$defaultFn(() => dayjs().toDate()),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  parcelId: integer('parcel_id')
    .references(() => parcels.id)
    .notNull(),
  type: text('type').notNull(), // 'ingreso' | 'gasto'
  category: text('category').notNull(),
  concept: text('concept').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method'), // 'transferencia' | 'tarjeta' | 'efectivo' | etc.
  invoiceNumber: text('invoice_number'),
  date: integer('date', {
    mode: 'timestamp',
  })
    .notNull()
    .$defaultFn(() => dayjs().toDate()),
  description: text('description'),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).$defaultFn(() => dayjs().toDate()),
})
