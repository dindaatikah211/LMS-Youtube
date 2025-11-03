import type { CollectionBeforeChangeHook } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utils/getUserTenantIDs'
import { isUser } from '@/utils/isUser'

export const preventCrossTenantEdit: CollectionBeforeChangeHook = async ({
  req,
  data,
  originalDoc,
}) => {
  const user = req.user

  //Jika tidak ada user (misalnya dari endpoint publik joinTenant), jangan blokir
  // Biarkan proses ini jalan agar customer bisa join tenant lewat endpoint publik
  if (!user) {
    return data
  }

  //Superadmin bebas
  if (isSuperAdmin(user)) return data

  //Tenant admin (user biasa di sistem multi-tenant)
  if (isUser(user)) {
    const adminTenantIDs: string[] = getUserTenantIDs(user, 'tenantadmin') || []

    const before: string[] =
      (originalDoc?.tenants?.map((t: any) => String(t.tenant)) as string[]) || []
    const after: string[] =
      (data?.tenants?.map((t: any) => String(t.tenant)) as string[]) || []

    const removed: string[] = before.filter((t) => !after.includes(t))

    const removedOthers = removed.some(
      (tenantId: string) => !adminTenantIDs.includes(tenantId)
    )

    if (removedOthers) {
      throw new Error('You cannot remove a tenant you do not manage.')
    }

    return data
  }

  //Kalau user bukan admin (misal customer login ke akun sendiri)
  // izinkan perubahan milik sendiri (misalnya update profil)
  if (user.collection === 'customers') {
    return data
  }

  //Selain itu, tolak
  throw new Error('Forbidden')
}
