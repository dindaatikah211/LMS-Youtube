import type { Access } from 'payload'
import { getUserTenantIDs } from '../../../utils/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { isAccessingSelf } from './isAccessingSelf'
import { isUser } from '@/utils/isUser'

export const updateAndDeleteAccess: Access = ({ req, id }) => {
  const { user } = req

  if (!isUser(user)) {
    return false
  }

  if (isSuperAdmin(user) || isAccessingSelf({ user, id })) {
    return true
  }

  return {
    'tenants.tenant': {
      in: getUserTenantIDs(user, 'tenantadmin'),
    },
  }
}
