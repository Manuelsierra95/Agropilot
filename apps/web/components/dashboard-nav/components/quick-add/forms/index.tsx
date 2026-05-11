"use client"

import type { ComponentType } from "react"

import type { MiniFormProps } from "./mini-form-types"
import { ExpenseMiniForm } from "./expense-mini-form"
import { HarvestMiniForm } from "./harvest-mini-form"
import { IncomeMiniForm } from "./income-mini-form"
import { IrrigationMiniForm } from "./irrigation-mini-form"
import { ParcelMiniForm } from "./parcel-mini-form"
import { PestMiniForm } from "./pest-mini-form"
import { TaskMiniForm } from "./task-mini-form"
import { TreatmentMiniForm } from "./treatment-mini-form"

export const formMap: Record<string, ComponentType<MiniFormProps>> = {
  irrigation: IrrigationMiniForm,
  treatment: TreatmentMiniForm,
  harvest: HarvestMiniForm,
  pest: PestMiniForm,
  expense: ExpenseMiniForm,
  income: IncomeMiniForm,
  parcel: ParcelMiniForm,
  task: TaskMiniForm,
}
