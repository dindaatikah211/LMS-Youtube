import type { User } from '@/payload-types'
import type { Access, Where } from 'payload'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'

import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getUserTenantIDs } from '../../../utils/getUserTenantIDs'
import { isAccessingSelf } from './isAccessingSelf'
import { getCollectionIDType } from '@/utils/getCollectionIDType'
import { isUser } from '@/utils/isUser'

export const readAccess: Access<User> = ({ req, id }) => {
  if (!isUser(req?.user)) {
    return false
  }

  // boleh akses dirinya sendiri
  if (isAccessingSelf({ id, user: req.user })) {
    return true
  }

  // superadmin bisa akses SEMUA user tanpa filter
  if (isSuperAdmin(req.user)) {
    return true
  }

  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenantadmin')

  if (selectedTenant) {
    const hasTenantAccess = adminTenantAccessIDs.some((id) => id === selectedTenant)
    if (hasTenantAccess) {
      return {
        'tenants.tenant': {
          equals: selectedTenant,
        },
      }
    }
  }

  return {
    or: [{ id: { equals: req.user.id } }, { 'tenants.tenant': { in: adminTenantAccessIDs } }],
  } as Where
}
