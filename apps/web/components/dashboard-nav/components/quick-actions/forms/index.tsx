"use client"

import type { ComponentType } from "react"

import type { MiniFormProps } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/mini-form-types"
import { ExpenseMiniForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/expense-mini-form"
import { HarvestMiniForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/harvest-mini-form"
import { IncomeMiniForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/income-mini-form"
import { TaskMiniForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/task-mini-form"
import { ParcelDialogForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/parcel-dialog-form"
import { BulkFinanceDialogForm } from "@workspace/web/components/dashboard-nav/components/quick-actions/forms/bulk-finance-dialog-form"

export const formMap: Record<string, ComponentType<MiniFormProps>> = {
  harvest: HarvestMiniForm,
  expense: ExpenseMiniForm,
  income: IncomeMiniForm,
  task: TaskMiniForm,
  parcel: ParcelDialogForm,
  bulkFinance: BulkFinanceDialogForm,
}
