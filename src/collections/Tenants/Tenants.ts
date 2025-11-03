import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { canMutateTenant, filterByTenantRead } from './access/byTenant'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Administrative',
    defaultColumns: ['name', 'domain', 'owner', 'updatedAt'],
  },
  access: {
    create: isSuperAdminAccess, // hanya superadmin yang bisa buat tenant baru
    update: canMutateTenant, // superadmin / tenantadmin bisa update & delete
    delete: canMutateTenant,
    read: filterByTenantRead, // superadmin bisa semua, user biasa difilter byTenant, anonymous hanya public
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Used for domain-based tenant handling',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'Primary owner/admin of this tenant',
      },
      filterOptions: ({ req }) => {
        const user = req.user as User

        if (user?.roles?.includes('superadmin')) {
          return true
        }
        return {
          roles: { in: ['tenantadmin'] },
        }
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Used for url paths, example: /tenant-slug/page-slug',
      },
    },
    {
      name: 'allowPublicRead',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description:
          'If checked, logging in is not required to read. Useful for building public pages.',
        position: 'sidebar',
      },
    },
  ],
}
