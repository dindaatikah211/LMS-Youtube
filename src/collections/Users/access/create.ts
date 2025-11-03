import type { Access } from 'payload'

import type { Tenant, User } from '@/payload-types'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getUserTenantIDs } from '../../../utils/getUserTenantIDs'
import { isUser } from '@/utils/isUser'

export const createAccess: Access<User> = ({ req }) => {
  if (!isUser(req.user)) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  if (!isSuperAdmin(req.user) && req.data?.roles?.includes('superadmin')) {
    return false
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenantadmin')

  const requestedTenants: Tenant['id'][] =
    req.data?.tenants?.map((t: { tenant: Tenant['id'] }) => t.tenant) ?? []

  const hasAccessToAllRequestedTenants = requestedTenants.every((tenantID) =>
    adminTenantAccessIDs.includes(tenantID),
  )

  if (hasAccessToAllRequestedTenants) {
    return true
  }

  return false
}
