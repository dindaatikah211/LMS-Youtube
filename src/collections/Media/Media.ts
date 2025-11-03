import type { CollectionConfig } from 'payload'
import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteMediaAccess } from './access/updateAndDelete'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true, // aktifkan upload file
  admin: {
    group: 'Tenant Collections',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'tenants', 'updatedAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user), // siapa pun yang login bisa upload
    read: () => true, // public bisa lihat
    update: updateAndDeleteMediaAccess, // superadmin/tenantadmin
    delete: updateAndDeleteMediaAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'tenants',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true, // satu media bisa dipakai banyak tenant
      required: true,
      admin: {
        description: 'Tenant(s) that own this media',
        position: 'sidebar',
      },
      defaultValue: undefined,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if ((operation === 'create' || operation === 'update') && !data.tenants) {
          const user = req.user as any
          // ambil semua tenant dari user
          const userTenants =
            user?.tenants?.map((t: any) =>
              typeof t.tenant === 'string' ? t.tenant : t.tenant.id,
            ) || []

          if (userTenants.length > 0) {
            data.tenants = userTenants
          }
        }
        return data
      },
    ],
  },
}
