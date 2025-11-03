'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './getUser'

export async function leaveTenant(tenantId: string) {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) {
    throw new Error('User not found')
  }

  try {
    const existingTenants = user.tenants || []

    //untuk hapus tenant dari customer
    const updatedTenants = existingTenants.filter((t: any) => {
      const tId = typeof t.tenant === 'string' ? t.tenant : t.tenant?.id
      return tId !== tenantId
    })

    //update user
    const updatedUser = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        tenants: updatedTenants,
      } as any,
      overrideAccess: true,
    })

    //hapus participation customer di tenant
    const participationsToDelete = await payload.find({
      collection: 'participation',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { customer: { equals: user.id } },
        ],
      },
      depth: 0,
      overrideAccess: true,
    })

    if (participationsToDelete.docs.length > 0) {
      for (const participation of participationsToDelete.docs) {
        await payload.delete({
          collection: 'participation',
          id: participation.id,
          overrideAccess: true,
        })
      }
      console.log(
        `Deleted ${participationsToDelete.docs.length} participations for user ${user.email} in tenant ${tenantId}`
      )
    }

    console.log(`User ${user.email} left tenant ${tenantId}`)
    return { success: true, user: updatedUser }
  } catch (err) {
    console.error(err)
    throw new Error('Error leaving tenant')
  }
}