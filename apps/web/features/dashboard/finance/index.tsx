"use client"

import { Download } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import customersData from "./data.json"
import type { RecentCustomerRow } from "./table/schema"
import { RecentCustomersTable } from "./table/table"

const customers = customersData as RecentCustomerRow[]

export function FinanceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">18,426 Customers</CardTitle>
        <CardDescription>
          Recent customer records with plan, billing, status, and signup
          activity.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={customers} />
      </CardContent>
    </Card>
  )
}
