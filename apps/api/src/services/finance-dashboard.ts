import { db, schema, eq, and, asc, desc, gte, lte } from "@workspace/db"
import type {
  DashboardCampaignMargin,
  DashboardFinanceResume,
  DashboardOlivePriceItem,
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
} from "@/services/campaign"
import { queryMarketPrices, type MarketPriceRow } from "@/services/finance"
import { listParcels, resolveParcelIdForOrg } from "@/services/parcel"

const MARKET_HISTORY_DAYS = 90
const RECENT_TRANSACTION_LIMIT = 50
const TREES_PER_HECTARE = 200

const OLIVE_PRICE_DISPLAY_NAMES: Record<OilGrade, string> = {
  virgen_extra: "Virgen Extra",
  virgen: "Virgen",
  lampante: "Lampante",
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

async function fetchMarketPricesByGrade(
  from: string,
  to: string
): Promise<Record<OilGrade, MarketPriceRow[]>> {
  const entries = await Promise.all(
    DASHBOARD_OIL_GRADES.map(async (grade) => {
      const rows = await queryMarketPrices({ grade, from, to })
      return [grade, rows] as const
    })
  )

  return Object.fromEntries(entries) as Record<OilGrade, MarketPriceRow[]>
}

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

function mapTransactionToSnapshot(
  tx: TransactionSelect
): DashboardTransactionSnapshot {
  const paymentMethod = (tx.paymentMethod ?? "otro") as PaymentMethod

  return {
    type: tx.flow === "income" ? "ingreso" : "gasto",
    category:
      TRANSACTION_CATEGORY_LABELS[tx.category as TransactionCategory] ??
      tx.category,
    amount: Number(tx.amount),
    paymentMethod,
    invoiceNumber: tx.invoiceNumber ?? undefined,
    date: tx.date,
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
  const resolvedParcelId = await resolveParcelIdForOrg(
    organizationId,
    filters.parcelId
  )

  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  const dateRange = resolveScopeDateRange(campaign, filters)

  return {
    parcelId: resolvedParcelId,
    campaignId: campaign?.id,
    dateRange,
  }
}

async function listTransactionsForScope(
  organizationId: string,
  dateRange: { from: string; to: string },
  parcelId?: string | null
) {
  const conditions = [
    eq(schema.transactions.organizationId, organizationId),
    gte(schema.transactions.date, dateRange.from),
    lte(schema.transactions.date, dateRange.to),
  ]

  if (parcelId) {
    conditions.push(eq(schema.transactions.parcelId, parcelId))
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.transactions.date)],
  })
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

async function getVirgenExtraPrice(): Promise<number> {
  const today = todayIso()
  const marketFrom = daysAgoIso(MARKET_HISTORY_DAYS)
  const pricesByGrade = await fetchMarketPricesByGrade(marketFrom, today)
  const olivePrices = buildOlivePriceItems(pricesByGrade)
  return olivePrices.find((item) => item.name === "Virgen Extra")?.price ?? 0
}

export async function getOlivePricesForDashboard(): Promise<
  DashboardOlivePriceItem[]
> {
  const today = todayIso()
  const marketFrom = daysAgoIso(MARKET_HISTORY_DAYS)
  const pricesByGrade = await fetchMarketPricesByGrade(marketFrom, today)
  return buildOlivePriceItems(pricesByGrade)
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

  const primarySummary = financialSummaries[0]
  const totalExpectedKg = financialSummaries.reduce(
    (sum, row) => sum + Number(row.expectedYieldKg ?? row.totalKg ?? 0),
    0
  )

  return {
    lonjaPrice: virgenExtraPrice,
    costPerKg: primarySummary?.costPerKg
      ? Number(primarySummary.costPerKg)
      : 0,
    lastSalePrice: primarySummary?.revenuePerKg
      ? Number(primarySummary.revenuePerKg)
      : undefined,
    estimatedKg: totalExpectedKg || Number(primarySummary?.expectedYieldKg ?? 0),
    campaignTarget: primarySummary?.avgMarketPrice
      ? Number(primarySummary.avgMarketPrice)
      : virgenExtraPrice,
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

  const campaign = campaignId
    ? await resolveCampaignById(campaignId)
    : null

  const [transactions, previousSummaries] = await Promise.all([
    listTransactionsForScope(organizationId, dateRange, parcelId),
    loadPreviousSummaries(campaign?.name ?? null),
  ])

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
      .map(mapTransactionToSnapshot),
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

  const cashflowDaily = await loadCashflowDaily(
    parcelId,
    campaignId,
    dateRange
  )

  return buildCampaignMarginSeries(
    dateRange.from,
    aggregateCashflowByDate(cashflowDaily)
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

  const transactions = await listTransactionsForScope(
    organizationId,
    dateRange,
    parcelId
  )

  return transactions.slice(0, limit).map(mapTransactionToSnapshot)
}

export async function getProductionValueForDashboard(
  organizationId: string,
  filters: DashboardScopeQuery = {}
): Promise<DashboardProductionValue> {
  const { parcelId, campaignId, dateRange } = await resolveScopeContext(
    organizationId,
    filters
  )

  const campaign = campaignId
    ? await resolveCampaignById(campaignId)
    : null

  const [parcels, virgenExtraPrice, cashflowDaily, previousCashflowDaily] =
    await Promise.all([
      listParcels(organizationId),
      getVirgenExtraPrice(),
      loadCashflowDaily(parcelId, campaignId, dateRange),
      loadPreviousCashflow(campaign?.name ?? null, parcelId),
    ])

  const aggregatedCashflow = aggregateCashflowByDate(cashflowDaily)
  const totalAreaHa = parcels.reduce(
    (sum, p) => sum + (p.areaHa ? Number(p.areaHa) : 0),
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
