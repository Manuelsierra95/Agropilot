import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"

const statement = {
  ...defaultStatements,
  parcel: ["read", "create", "update", "delete"],
} as const

export const ac = createAccessControl(statement)

export const viewerRole = ac.newRole({
  ...memberAc.statements,
  parcel: ["read"],
})

export const editorRole = ac.newRole({
  ...memberAc.statements,
  parcel: ["read", "create", "update"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,
  parcel: ["read", "create", "update", "delete"],
})

export const ownerRole = ac.newRole({
  ...ownerAc.statements,
  parcel: ["read", "create", "update", "delete"],
})

export const organizationRoles = {
  owner: ownerRole,
  admin: adminRole,
  editor: editorRole,
  member: viewerRole,
  viewer: viewerRole,
} as const

export type OrganizationRole = keyof typeof organizationRoles

export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  owner: 5,
  admin: 4,
  editor: 3,
  member: 2,
  viewer: 1,
}
