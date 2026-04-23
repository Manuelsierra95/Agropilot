"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { CreditCard, Download, Zap } from "lucide-react"

export function SettingsBillingSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current plan */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Pro Plan</h3>
                <Badge className="bg-foreground text-background">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                $29/month · Renews on May 1, 2026
              </p>
            </div>
            <Button variant="outline">Change plan</Button>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Usage this period:</span>
              <span className="font-medium">2,450 / 10,000 requests</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[24.5%] rounded-full bg-foreground" />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Payment method</h3>
            <Button variant="ghost" size="sm">
              Add new
            </Button>
          </div>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">•••• •••• •••• 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/2027</p>
            </div>
            <Badge variant="outline" className="font-normal">
              Default
            </Badge>
          </div>
        </div>

        {/* Billing history */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Billing history</h3>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="divide-y rounded-lg border">
            {[
              { date: "Apr 1, 2026", amount: "$29.00", status: "Paid" },
              { date: "Mar 1, 2026", amount: "$29.00", status: "Paid" },
              { date: "Feb 1, 2026", amount: "$29.00", status: "Paid" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{invoice.date}</p>
                  <p className="text-xs text-muted-foreground">
                    Pro Plan - Monthly
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{invoice.amount}</span>
                  <Badge variant="secondary" className="font-normal">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
