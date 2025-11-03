'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './getUser'

export async function joinTenant(tenantId: string) {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) {
    throw new Error('User not found')
  }

  try {
    // Ambil existing tenants dari user
    const existingTenants = user.tenants || []
    
    // Cek apakah user sudah member
    const isMember = existingTenants.some((t: any) => {
      const tId = typeof t.tenant === 'string' ? t.tenant : t.tenant?.id
      return tId === tenantId
    })

    if (isMember) {
      return { success: true, alreadyMember: true }
    }

    // Update user dengan tenant baru
    const updatedUser = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        tenants: [
          ...existingTenants,
          {
            tenant: tenantId,
            roles: ['customer'],
          },
        ],
      } as any,
      overrideAccess: true,
    })

    console.log(`User ${user.email} joined tenant ${tenantId}`)
    return { success: true, user: updatedUser }
  } catch (err) {
    console.error(err)
    throw new Error('Error joining tenant')
  }
}