'use server'

import { getPayload } from 'payload'
import { getUser } from './getUser'
import configPromise from '@payload-config'

export async function participate({ courseId }: { courseId: string }) {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) {
    throw new Error('User not found')
  }

  try {
    const createParticipation = await payload.create({
      collection: 'participation',
      data: {
        course: courseId,
        customer: user.id,
        progress: 0,
      },
      overrideAccess: false,
      user: user,
    })

    return createParticipation
  } catch (err) {
    console.error(err)
    throw new Error('Error creating participation')
  }
}
