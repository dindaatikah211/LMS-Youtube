import type { User } from '../payload-types'

export function isUser(user: any): user is User {
  return user?.collection === 'users'
}
