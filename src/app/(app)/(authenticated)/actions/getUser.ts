'use server'

import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Customer, User } from '@/payload-types'

export async function getUser(): Promise<User | Customer | null> {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  console.log('Auth user:', user) //debug

  const fullUser = await payload.findByID({
    collection: (user as any).collection ?? 'customers', //fallback ke 'customers'
    id: user.id,
    depth: 1, //biar tenants ikut dimuat
  })

  return fullUser as User | Customer
}
