import type { Access, AccessArgs, Where } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { isUser } from '@/utils/isUser'
import { getUserTenantIDs } from '@/utils/getUserTenantIDs'

export const updateAndDeleteAccess: Access = ({ req }: AccessArgs) => {
  if (!req.user) return false

  // superadmin boleh semua
  if (isSuperAdmin(req.user)) return true

  // tenant admin boleh update/delete media yang punya tenant-nya
  if (isUser(req.user)) {
    const tenantAdminIDs = getUserTenantIDs(req.user, 'tenantadmin') || []
    if (tenantAdminIDs.length > 0) {
      return {
        tenants: {
          in: tenantAdminIDs, // karena field-nya array langsung
        },
      } as Where
    }
  }

  return false
}
