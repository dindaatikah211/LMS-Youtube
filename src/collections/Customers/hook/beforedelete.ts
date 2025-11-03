import type { CollectionBeforeDeleteHook } from 'payload'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utils/getUserTenantIDs'
import { isUser } from '@/utils/isUser'

export const preventCrossTenantDelete: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  const user = req.user
  if (!user) throw new Error('Unauthorized')

  // Superadmin bebas hapus
  if (isSuperAdmin(user)) return

  // Ambil dokumen customer
  const customer = await req.payload.findByID({
    collection: 'customers',
    id,
  })

  if (!customer) throw new Error('Customer not found')

  // Cek untuk user biasa (tenant admin)
  if (isUser(user)) {
    const adminTenantIDs: string[] = (getUserTenantIDs(user, 'tenantadmin') || []).map(String)

    // Daftar tenant customer
    const customerTenants: string[] =
      (customer.tenants || []).map((t: any) => {
        const val = t?.tenant
        if (!val) return ''
        if (typeof val === 'string') return val
        if (typeof val === 'object') return String(val?.id ?? val?._id ?? '')
        return String(val)
      }).filter(Boolean)

    // Cek: apakah semua tenant customer termasuk dalam tenant admin?
    // dan pastikan tidak lebih dari tenant admin
    const allInAdminScope = customerTenants.every((tid) =>
      adminTenantIDs.includes(tid)
    )

    // Jika customer join ke tenant lain juga (di luar adminTenantIDs), blok
    const hasOtherTenants = customerTenants.some(
      (tid) => !adminTenantIDs.includes(tid)
    )

    // Hanya boleh hapus jika semua tenant-nya milik admin, dan tidak ada tenant lain
    if (allInAdminScope && !hasOtherTenants) {
      return //izinkan hapus
    }

    //selain itu, blok penghapusan
    throw new Error('You cannot delete a customer who also belongs to other tenants.')
  }

  throw new Error('Forbidden')
}
