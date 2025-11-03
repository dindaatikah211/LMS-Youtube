import type { CollectionConfig } from 'payload'
import { createCustomers, deleteCustomers, readCustomers, updateCustomers } from './access/customersAccess'
import { preventCrossTenantDelete } from './hook/beforedelete'
import { preventCrossTenantEdit } from './hook/beforeChange'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: readCustomers,
    create: createCustomers,
    update: updateCustomers,
    delete: deleteCustomers,
  },
  hooks: {
    beforeChange: [preventCrossTenantEdit],
    beforeDelete: [preventCrossTenantDelete],
  },
  fields: [
    {
      name: 'tenants',
      type: 'array',
      required: false, // biar boleh kosong
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true, // tetap required di dalam array
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['customer'],
          options: [{ label: 'Customer', value: 'customer' }],
        },
      ],
    },
  ],
}
