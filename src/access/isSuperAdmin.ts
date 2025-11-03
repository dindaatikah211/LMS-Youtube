import type { Access } from 'payload'
import type { User } from '../payload-types'
import { isUser } from '../utils/isUser'

export const isSuperAdmin = (user: unknown): boolean => {
  if (isUser(user)) {
    return Boolean(user.roles?.includes('superadmin'))
  }
  return false
}

export const isSuperAdminAccess: Access = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}
