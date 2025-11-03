import type { Access, AccessArgs, Where } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utils/getUserTenantIDs'
import { isUser } from '@/utils/isUser'

export const readCustomers: Access = ({ req }: AccessArgs) => {
  if (!req.user) return false

  if (isSuperAdmin(req.user)) return true

  // customer bisa baca dirinya
  if (req.user.collection === 'customers') {
    return { id: { equals: req.user.id } } as Where
  }

  // tenant admin bisa baca customer di tenant mereka
  if (isUser(req.user)) {
    const adminTenantIDs =
      getUserTenantIDs(req.user, 'tenantadmin') || []

    if (adminTenantIDs.length > 0) {
      return {
        'tenants.tenant': {
          in: adminTenantIDs,
        },
      } as Where
    }
  }

  return false
}

export const createCustomers: Access = ({ req }: AccessArgs) => {
  // publik (belum login) bisa daftar
  if (!req.user) return true

  if (isSuperAdmin(req.user)) return true

  // tenant admin boleh buat customer
  if (isUser(req.user)) {
    const adminTenantIDs =
      getUserTenantIDs(req.user, 'tenantadmin') || []

    if (adminTenantIDs.length > 0) return true
  }

  return false
}

export const updateCustomers: Access = ({ req }: AccessArgs) => {
  if (!req.user) return false

  if (isSuperAdmin(req.user)) return true

  // customer hanya boleh update diri sendiri
  if (req.user.collection === 'customers') {
    return { id: { equals: req.user.id } } as Where
  }

  // tenant admin bisa update customer di tenant mereka
  if (isUser(req.user)) {
    const adminTenantIDs =
      getUserTenantIDs(req.user, 'tenantadmin') || []

    if (adminTenantIDs.length > 0) {
      return {
        'tenants.tenant': {
          in: adminTenantIDs,
        },
      } as Where
    }
  }

  return false
}

export const deleteCustomers: Access = ({ req }: AccessArgs) => {
  if (!req.user) return false

  if (isSuperAdmin(req.user)) return true

  if (isUser(req.user)) {
    const adminTenantIDs =
      getUserTenantIDs(req.user, 'tenantadmin') || []

    if (adminTenantIDs.length > 0) {
      return {
        'tenants.tenant': {
          in: adminTenantIDs,
        },
      } as Where
    }
  }

  return false
}
