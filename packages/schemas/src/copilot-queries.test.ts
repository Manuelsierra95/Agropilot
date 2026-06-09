import {
  COPILOT_DATA_SOURCES,
  querySpecSchema,
  transactionsQuerySchema,
} from "./copilot-queries"
import { transactionCategorySchema } from "./finance"

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

const catalogSources = Object.keys(COPILOT_DATA_SOURCES)
const querySources = querySpecSchema.options.map(
  (option) => option.shape.source.value
)

assert(
  catalogSources.length === querySources.length,
  `Catalog sources (${catalogSources.join(", ")}) must match querySpec sources (${querySources.join(", ")})`
)

for (const source of querySources) {
  assert(
    catalogSources.includes(source),
    `Missing catalog entry for query source: ${source}`
  )
}

for (const category of transactionCategorySchema.options) {
  const parsed = transactionsQuerySchema.safeParse({
    source: "transactions",
    category,
    from: "2025-10-01",
    to: "2026-06-08",
  })
  assert(
    parsed.success,
    `transactionsQuerySchema must accept category from transactionCategorySchema: ${category}`
  )
}

const example = querySpecSchema.safeParse({
  source: "transactions",
  flow: "expense",
  category: "fertilization",
  from: "2025-10-01",
  to: "2026-06-08",
})

assert(example.success, "Example transactions query must validate")

console.log("copilot-queries.test.ts: all assertions passed")
