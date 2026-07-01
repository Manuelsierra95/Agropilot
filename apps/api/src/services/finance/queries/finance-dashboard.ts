import { db, schema, eq, and, asc, desc, gte, lte } from "@workspace/db"
import type {
  DashboardCampaignMargin,
  DashboardFinanceResume,
  DashboardFinanceTransaction,
  DashboardOlivePriceItem,
  DashboardParcelsFinanceComparison,
  DashboardParcelsSellingWindows,
  DashboardProductionValue,
  DashboardScopeQuery,
  DashboardSellingWindow,
  DashboardTransactionSnapshot,
  OilGrade,
  PaymentMethod,
  TransactionCategory,
  TransactionSelect,
} from "@workspace/schemas"
import {
  DASHBOARD_OIL_GRADES,
  TRANSACTION_CATEGORY_LABELS,
} from "@workspace/schemas"
import {
  getPreviousCampaignName,
  resolveActiveCampaign,
  resolveCampaignById,
  resolveScopeDateRange,
} from "@workspace/api/services/campaigns"
import { getCachedMarketPricesByGrade } from "@workspace/api/services/finance/queries/market-prices-cache"
import { listParcels } from "@workspace/api/services/parcels/queries/list-parcels"
import { todayIso, daysAgoIso } from "@workspace/api/services/shared/date-utils"

const MARKET_HISTORY_DAYS = 90
const RECENT_TRANSACTION_LIMIT = 50
const FINANCE_TRANSACTION_LIMIT = 1000
const TREES_PER_HECTARE = 200

const OLIVE_PRICE_DISPLAY_NAMES: Record<OilGrade, string> = {
  virgen_extra: "Virgen Extra",
  virgen: "Virgen",
  lampante: "Lampante",
}

type MarketPriceRow = { date: string; price: string }

function buildOlivePriceItems(
  pricesByGrade: Record<OilGrade, MarketPriceRow[]>
): DashboardOlivePriceItem[] {
  return (Object.keys(pricesByGrade) as OilGrade[]).map((grade) => {
    const history = pricesByGrade[grade]
    const numericPrices = history.map((row) => Number(row.price))
    const latest = history.at(-1)

    return {
      name: OLIVE_PRICE_DISPLAY_NAMES[grade],
      price: latest ? Number(latest.price) : 0,
      priceMin: numericPrices.length > 0 ? Math.min(...numericPrices) : 0,
      priceMax: numericPrices.length > 0 ? Math.max(...numericPrices) : 0,
      unit: "€/kg",
      updatedAt: latest?.date ?? todayIso(),
      history: history.map((row) => ({
        date: row.date,
        price: Number(row.price),
      })),
    }
  })
}

function mapTransactionCategoryLabel(tx: TransactionSelect): string {
  return (
    TRANSACTION_CATEGORY_LABELS[tx.category as TransactionCategory] ??
    tx.category
  )
}

function mapTransactionToSnapshot(
  tx: TransactionSelect,
  parcelName?: string
): DashboardTransactionSnapshot {
  const paymentMethod = (tx.paymentMethod ?? "otro") as PaymentMethod

  return {
    type: tx.flow === "income" ? "ingreso" : "gasto",
    category: mapTransactionCategoryLabel(tx),
    amount: Number(tx.amount),
    paymentMethod,
    invoiceNumber: tx.invoiceNumber ?? undefined,
    date: tx.date,
    ...(parcelName ? { parcelName } : {}),
  }
}

function mapTransactionToFinanceRow(
  tx: TransactionSelect,
  parcelName?: string
): DashboardFinanceTransaction {
  return {
    id: tx.id,
    userId: tx.userId ?? null,
    concept: tx.concept,
    description: tx.description ?? null,
    type: tx.flow === "income" ? "ingreso" : "gasto",
    category: mapTransactionCategoryLabel(tx),
    amount: Number(tx.amount),
    paymentMethod: tx.paymentMethod ?? null,
    invoiceNumber: tx.invoiceNumber ?? null,
    date: tx.date,
    parcelId: tx.parcelId ?? null,
    ...(parcelName ? { parcelName } : {}),
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  }
}

function aggregateCashflowByDate(
  rows: { date: string; income: string | null; expense: string | null }[]
): { date: string; income: string; expense: string }[] {
  const byDate = new Map<string, { income: number; expense: number }>()

  for (const row of rows) {
    const current = byDate.get(row.date) ?? { income: 0, expense: 0 }
    current.income += Number(row.income ?? 0)
    current.expense += Number(row.expense ?? 0)
    byDate.set(row.date, current)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      income: values.income.toFixed(2),
      expense: values.expense.toFixed(2),
    }))
}

function buildCampaignMarginSeries(
  campaignStart: string,
  dailyRows: { date: string; income: string; expense: string }[]
): DashboardCampaignMargin {
  const sorted = [...dailyRows].sort((a, b) => a.date.localeCompare(b.date))

  let cost = 0
  let value = 0

  const points = sorted.map((row) => {
    cost += Number(row.expense)
    value += Number(row.income)
    return {
      date: row.date,
      cost: Math.round(cost),
      value: Math.round(value),
    }
  })

  return {
    campaignStart,
    points,
  }
}

function buildMonthlyProductionKg(
  dailyRows: { date: string; income: string }[],
  lonjaPrice: number
): number[] {
  const months = Array.from({ length: 12 }, () => 0)

  for (const row of dailyRows) {
    const month = Number(row.date.split("-")[1])
    const index = month >= 10 ? month - 10 : month + 2
    if (index < 0 || index > 11) continue
    const income = Number(row.income)
    if (income > 0 && lonjaPrice > 0) {
      months[index] += Math.round(income / lonjaPrice)
    }
  }

  return months
}

function getCampaignStartYear(campaignStartDate: string): number {
  const [year, month] = campaignStartDate.split("-").map(Number)
  return month! >= 10 ? year! : year! - 1
}

type ScopeContext = {
  parcelId: string | null
  campaignId: string | undefined
  dateRange: { from: string; to: string }
}

async function resolveScopeContext(
  organizationId: string,
  filters: DashboardScopeQuery
): Promise<ScopeContext> {
  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  const dateRange = resolveScopeDateRange(campaign, filters)

  return {
    parcelId: filters.parcelId ?? null,
    campaignId: campaign?.id,
    dateRange,
  }
}

async function listTransactionsForScope(
  organizationId: string,
  dateRange: { from: string; to: string },
  parcelId?: string | null,
  includeParcelNames = false
) {
  const conditions = [
    eq(schema.transactions.organizationId, organizationId),
    gte(schema.transactions.date, dateRange.from),
    lte(schema.transactions.date, dateRange.to),
  ]

  if (parcelId) {
    conditions.push(eq(schema.transactions.parcelId, parcelId))
  }

  const transactions = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.transactions.date)],
  })

  if (!includeParcelNames) {
    return { transactions, parcelNameById: null as Map<string, string> | null }
  }

  const parcels = await listParcels(organizationId)
  const parcelNameById = new Map(parcels.map((p) => [p.id, p.name]))

  return { transactions, parcelNameById }
}

async function loadFinancialSummaries(
  campaignId: string | undefined,
  parcelId: string | null
) {
  if (!campaignId) return []

  return db.query.parcelFinancialSummaries.findMany({
    where: parcelId
      ? and(
          eq(schema.parcelFinancialSummaries.campaignId, campaignId),
          eq(schema.parcelFinancialSummaries.parcelId, parcelId)
        )
      : eq(schema.parcelFinancialSummaries.campaignId, campaignId),
  })
}

async function loadPreviousSummaries(campaignName: string | null) {
  if (!campaignName) return []

  const previousCampaignName = getPreviousCampaignName(campaignName)
  const prev = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, previousCampaignName),
  })

  if (!prev) return []

  return db.query.parcelFinancialSummaries.findMany({
    where: eq(schema.parcelFinancialSummaries.campaignId, prev.id),
  })
}

async function loadCashflowDaily(
  parcelId: string | null,
  campaignId: string | undefined,
  dateRange: { from: string; to: string }
) {
  return db.query.parcelCashflowDaily.findMany({
    where: and(
      ...(parcelId ? [eq(schema.parcelCashflowDaily.parcelId, parcelId)] : []),
      ...(campaignId
        ? [eq(schema.parcelCashflowDaily.campaignId, campaignId)]
        : []),
      gte(schema.parcelCashflowDaily.date, dateRange.from),
      lte(schema.parcelCashflowDaily.date, dateRange.to)
    ),
    orderBy: [asc(schema.parcelCashflowDaily.date)],
  })
}

async function loadPreviousCashflow(
  campaignName: string | null,
  parcelId: string | null
) {
  if (!campaignName) return []

  const previousCampaignName = getPreviousCampaignName(campaignName)
  const prev = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, previousCampaignName),
  })

  if (!prev) return []

  return db.query.parcelCashflowDaily.findMany({
    where: and(
      ...(parcelId ? [eq(schema.parcelCashflowDaily.parcelId, parcelId)] : []),
      eq(schema.parcelCashflowDaily.campaignId, prev.id)
    ),
    orderBy: [asc(schema.parcelCashflowDaily.date)],
  })
}

async function getOlivePriceItemsForDashboard(): Promise<
  DashboardOlivePriceItem[]
> {
  const today = todayIso()
  const marketFrom = daysAgoIso(MARKET_HISTORY_DAYS)
  const pricesByGrade = await getCachedMarketPricesByGrade(marketFrom, today)
  return buildOlivePriceItems(pricesByGrade)
}

async function getVirgenExtraPrice(): Promise<number> {
  const olivePrices = await getOlivePriceItemsForDashboard()
  return olivePrices.find((item) => item.name === "Virgen Extra")?.price ?? 0
}

export async function getOlivePricesForDashboard(): Promise<
  DashboardOlivePriceItem[]
> {
  return getOlivePriceItemsForDashboard()
}

type FinancialSummaryRow = Awaited<
  ReturnType<typeof loadFinancialSummaries>
>[number]

function buildSellingWindowFromSummaries(
  virgenExtraPrice: number,
  financialSummaries: FinancialSummaryRow[]
): DashboardSellingWindow {
  const primarySummary = financialSummaries[0]
  const totalExpectedKg = financialSummaries.reduce(
    (sum, row) => sum + Number(row.expectedYieldKg ?? row.totalKg ?? 0),
    0
  )

  return {
    lonjaPrice: virgenExtraPrice,
    costPerKg: primarySummary?.costPerKg ? Number(primarySummary.costPerKg) : 0,
    lastSalePrice: primarySummary?.revenuePerKg
      ? Number(primarySummary.revenuePerKg)
      : undefined,
    estimatedKg:
      totalExpectedKg || Number(primarySummary?.expectedYieldKg ?? 0),
    campaignTarget: primarySummary?.avgMarketPrice
      ? Number(primarySummary.avgMarketPrice)
      : virgenExtraPrice,
  }
}

export async function getSellingWindowForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardSellingWindow> {
  const { parcelId, campaignId } = await resolveScopeContext(
    organizationId,
    filters
  )
  const [virgenExtraPrice, financialSummaries] = await Promise.all([
    getVirgenExtraPrice(),
    loadFinancialSummaries(campaignId, parcelId),
  ])

  return buildSellingWindowFromSummaries(virgenExtraPrice, financialSummaries)
}

export async function getParcelsSellingWindowsForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardParcelsSellingWindows> {
  const { campaignId } = await resolveScopeContext(organizationId, filters)

  const [parcels, virgenExtraPrice, summaries] = await Promise.all([
    listParcels(organizationId),
    getVirgenExtraPrice(),
    loadFinancialSummaries(campaignId, null),
  ])

  const summariesByParcelId = new Map(
    summaries.map((row) => [row.parcelId, row])
  )

  return {
    parcels: parcels.map((parcel) => {
      const summary = summariesByParcelId.get(parcel.id)
      const sellingWindow = buildSellingWindowFromSummaries(
        virgenExtraPrice,
        summary ? [summary] : []
      )

      return {
        parcelId: parcel.id,
        name: parcel.name,
        ...sellingWindow,
      }
    }),
  }
}

export async function getFinanceResumeForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardFinanceResume> {
  const { parcelId, campaignId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )

  const campaign = campaignId ? await resolveCampaignById(campaignId) : null

  const [txResult, previousSummaries] = await Promise.all([
    listTransactionsForScope(
      organizationId,
      dateRange,
      parcelId,
      parcelId === null
    ),
    loadPreviousSummaries(campaign?.name ?? null),
  ])

  const { transactions, parcelNameById } = txResult

  const previousIncome = previousSummaries.reduce(
    (sum, row) => sum + Number(row.totalIncome ?? 0),
    0
  )
  const previousExpenses = previousSummaries.reduce(
    (sum, row) => sum + Number(row.totalExpense ?? 0),
    0
  )

  return {
    transactions: transactions
      .slice(0, RECENT_TRANSACTION_LIMIT)
      .map((tx) =>
        mapTransactionToSnapshot(
          tx,
          tx.parcelId && parcelNameById
            ? (parcelNameById.get(tx.parcelId) ?? undefined)
            : undefined
        )
      ),
    previousCampaign:
      previousIncome > 0 || previousExpenses > 0
        ? { totalIncome: previousIncome, totalExpenses: previousExpenses }
        : undefined,
  }
}

export async function getCampaignMarginForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardCampaignMargin> {
  const { parcelId, campaignId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )

  const cashflowDaily = await loadCashflowDaily(parcelId, campaignId, dateRange)

  return buildCampaignMarginSeries(
    dateRange.from,
    aggregateCashflowByDate(cashflowDaily)
  )
}

export async function getTransactionsForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardFinanceTransaction[]> {
  const { parcelId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )

  const includeParcelNames = parcelId === null || parcelId === undefined

  const { transactions, parcelNameById } = await listTransactionsForScope(
    organizationId,
    dateRange,
    parcelId,
    includeParcelNames
  )

  return transactions.slice(0, FINANCE_TRANSACTION_LIMIT).map((tx) =>
    mapTransactionToFinanceRow(
      tx,
      tx.parcelId && parcelNameById
        ? (parcelNameById.get(tx.parcelId) ?? undefined)
        : undefined
    )
  )
}

export async function getRecentTransactionsForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery & { limit?: number } = {}
): Promise<DashboardTransactionSnapshot[]> {
  const { parcelId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )
  const limit = filters.limit ?? RECENT_TRANSACTION_LIMIT

  const { transactions, parcelNameById } = await listTransactionsForScope(
    organizationId,
    dateRange,
    parcelId,
    parcelId === null
  )

  return transactions.slice(0, limit).map((tx) =>
    mapTransactionToSnapshot(
      tx,
      tx.parcelId && parcelNameById
        ? (parcelNameById.get(tx.parcelId) ?? undefined)
        : undefined
    )
  )
}

export async function getParcelsFinanceComparisonForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardParcelsFinanceComparison> {
  const { campaignId } = await resolveScopeContext(organizationId, filters)

  const [parcels, summaries] = await Promise.all([
    listParcels(organizationId),
    loadFinancialSummaries(campaignId, null),
  ])

  const summaryByParcelId = new Map(
    summaries.map((row) => [row.parcelId, row])
  )

  return {
    parcels: parcels.map((parcel) => {
      const summary = summaryByParcelId.get(parcel.id)
      const income = Number(summary?.totalIncome ?? 0)
      const expense = Number(summary?.totalExpense ?? 0)
      return {
        parcelId: parcel.id,
        name: parcel.name,
        income,
        expense,
        profit: Number(summary?.profit ?? income - expense),
        totalKg: Number(summary?.totalKg ?? 0),
      }
    }),
  }
}

export async function getProductionValueForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardProductionValue> {
  const { parcelId, campaignId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )

  const campaign = campaignId ? await resolveCampaignById(campaignId) : null

  const [parcels, virgenExtraPrice, cashflowDaily, previousCashflowDaily] =
    await Promise.all([
      listParcels(organizationId),
      getVirgenExtraPrice(),
      loadCashflowDaily(parcelId, campaignId, dateRange),
      loadPreviousCashflow(campaign?.name ?? null, parcelId),
    ])

  const aggregatedCashflow = aggregateCashflowByDate(cashflowDaily)
  const totalAreaHa = parcels.reduce(
    (sum, p) => sum + (p.areaM2 ? p.areaM2 / 10000 : 0),
    0
  )

  return {
    monthlyProductionKg: buildMonthlyProductionKg(
      aggregatedCashflow,
      virgenExtraPrice || 1
    ),
    prevMonthlyProductionKg: buildMonthlyProductionKg(
      aggregateCashflowByDate(previousCashflowDaily),
      virgenExtraPrice || 1
    ),
    lonjaPrice: virgenExtraPrice,
    numOlivos: Math.round(totalAreaHa * TREES_PER_HECTARE),
    campaignStartYear: getCampaignStartYear(dateRange.from),
  }
}
