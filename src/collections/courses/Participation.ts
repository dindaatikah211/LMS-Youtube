import type { CollectionConfig } from 'payload'
import { updateAndDeleteAccess } from './access/updateAndDelete'

export const Participation: CollectionConfig = {
  slug: 'participation',
  admin: {
    useAsTitle: 'id',
    group: 'Tenant Collections',
    defaultColumns: ['customer', 'course', 'tenants', 'progress', 'updatedAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: updateAndDeleteAccess,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      // izinkan kalau customer sendiri yang punya participation
      if (req.user.collection === 'customers') {
        return {
          customer: {
            equals: req.user.id,
          },
        }
      }
      // fallback ke superadmin / tenantadmin
      return updateAndDeleteAccess({ req })
    },
  },
  fields: [
    {
      name: 'customer',
      label: 'Customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'course',
      label: 'Course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      // single tenant, required
      name: 'tenants',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: true,
    },
    {
      name: 'progress',
      label: 'Progress',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
