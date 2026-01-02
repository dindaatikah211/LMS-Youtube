'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Customer } from '@/payload-types'
import { cookies } from 'next/headers'

interface SignupParams {
  email: string
  password: string
}

export interface SignupResponse {
  success: boolean
  error?: string
}

export type Result = {
  exp?: number
  token?: string
  user?: Customer
}

export async function signup({ email, password }: SignupParams): Promise<SignupResponse> {
  const payload = await getPayload({ config })
  try {
    await payload.create({
      collection: 'customers',
      data: {
        email,
        password,
      },
    })
    const result: Result = await payload.login({
      collection: 'customers',
      data: {
        email,
        password,
      },
    })
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set({
        name: 'payload-token',
        value: result.token,
        httpOnly: true,
        path: '/',
      })
      return { success: true }
    } else {
      return { success: false, error: 'Login failed' }
    }
  } catch (error) {
    return { success: false, error: 'Signup failed' }
  }
}
