"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Badge } from "@workspace/ui/components/badge"
import { Shield, Key, Smartphone, AlertTriangle } from "lucide-react"

export function SettingsAccountSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email address</Label>
              <p className="text-sm text-muted-foreground">
                Your email for notifications and login.
              </p>
            </div>
            <Badge variant="secondary" className="font-normal">
              Verified
            </Badge>
          </div>
          <div className="flex max-w-md items-center gap-3">
            <Input
              type="email"
              defaultValue="john@example.com"
              className="flex-1"
            />
            <Button variant="outline">Change</Button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed 30 days ago.
              </p>
            </div>
            <Button variant="outline">Update password</Button>
          </div>
        </div>

        {/* Two-factor authentication */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Label>Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch />
          </div>
        </div>

        {/* Sessions */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <Label>Active sessions</Label>
              <p className="text-sm text-muted-foreground">
                Manage your active sessions across devices.
              </p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1 space-y-1">
              <Label className="text-destructive">Delete account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
