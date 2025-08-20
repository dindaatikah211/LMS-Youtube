'use server'

import { Participation } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '@/app/(app)/(authenticated)/actions/getUser'

export async function markProgress(participation: Participation) {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!participation || typeof participation.progress !== 'number') {
    console.error('Invalid participation data')
    return null
  }

  const nextProgress = participation.progress + 1

  try {
    console.log('Updating progress to:', nextProgress)

    const updateRes = await payload.update({
      collection: 'participation',
      id: participation.id,
      data: {
        progress: nextProgress,
      },
      overrideAccess: false,
      user: user,
    })

    if (!updateRes) {
      throw new Error('Failed to update participation')
    }

    console.log('Update successful:', updateRes)
    return updateRes
  } catch (err) {
    console.error('Error updating participation progress:', err)
    return null
  }
}
