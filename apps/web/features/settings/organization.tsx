"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Building2, Users, MoreHorizontal, Mail, UserPlus } from "lucide-react"
import { OrganizationForm } from "@/features/settings/forms/organization"
import type {
  ActiveOrganizationData,
  OrganizationMember,
} from "@workspace/schemas"

export function SettingsOrganizationSection({
  org,
  members,
}: {
  org: ActiveOrganizationData["organization"]
  members: OrganizationMember[]
}) {
  const createdAtFormatted = new Date(org.createdAt).toLocaleDateString(
    "es-ES",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Organization</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and team members.
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization details */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-medium">{org.name}</h3>
              <p className="text-sm text-muted-foreground">
                Created on {createdAtFormatted}
              </p>
            </div>
          </div>
          <OrganizationForm org={org} />
        </div>

        {/* Team members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Team members</h3>
              <Badge variant="secondary" className="font-normal">
                3
              </Badge>
            </div>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </div>

          <div className="divide-y rounded-lg border">
            {members.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback className="bg-muted text-xs">
                      {member.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-normal">
                    {member.role}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send email
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change role</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Remove from team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Pending invitations</p>
              <p className="text-xs text-muted-foreground">
                No pending invitations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
