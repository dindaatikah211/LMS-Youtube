import type { Access, Where } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { isUser } from '@/utils/isUser'

export const filterByTenantRead: Access = ({ req }) => {
  if (!req.user) {
    //Anonymous user → hanya tenant publik
    return {
      allowPublicRead: {
        equals: true,
      },
    } as Where
  }

  // Superadmin → semua tenant
  if (isSuperAdmin(req.user)) {
    return true
  }

  type UserTenant = {
    roles: string[]
    tenant: string | { id: string }
  }

  const userTenants = (req.user?.tenants as UserTenant[] | undefined) || []

  // Tenantadmin → tenant di mana dia tenantadmin
  const adminTenantIDs = userTenants
    .filter(({ roles }) => roles.includes('tenantadmin'))
    .map(({ tenant }) => (typeof tenant === 'string' ? tenant : tenant.id))

  // Semua tenant yang user tergabung di dalamnya (termasuk sebagai customer/member)
  const memberTenantIDs = userTenants.map(({ tenant }) =>
    typeof tenant === 'string' ? tenant : tenant.id,
  )

  // Gabungkan semua ID (admin + member), hapus duplikat
  const allowedTenantIDs = [...new Set([...adminTenantIDs, ...memberTenantIDs])]

  if (allowedTenantIDs.length > 0) {
    // Customer bisa baca tenant tempat dia tergabung + tenant publik
    return {
      or: [
        { id: { in: allowedTenantIDs } },
        { allowPublicRead: { equals: true } },
      ],
    } as Where
  }

  // Kalau belum join tenant manapun, tetap bisa lihat publik
  return {
    allowPublicRead: {
      equals: true,
    },
  } as Where
}

/**
 * Mutasi tenant hanya oleh superadmin atau tenantadmin di tenant terkait.
 */
export const canMutateTenant: Access = ({ req }) => {
  if (!isUser(req.user)) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  // Tenantadmin boleh ubah tenant yang mereka kelola
  return {
    id: {
      in:
        req.user?.tenants
          ?.map(({ roles, tenant }) =>
            roles?.includes('tenantadmin')
              ? typeof tenant === 'string'
                ? tenant
                : tenant.id
              : null,
          )
          .filter(Boolean) || [],
    },
  }
}
