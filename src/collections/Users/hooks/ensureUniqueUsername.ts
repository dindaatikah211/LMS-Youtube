import type { FieldHook, Where } from 'payload'

import { ValidationError } from 'payload'

import { getUserTenantIDs } from '../../../utils/getUserTenantIDs'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import { getCollectionIDType } from '@/utils/getCollectionIDType'
import { isUser } from '@/utils/isUser'

// Hook untuk memastikan username unik di setiap tenant
export const ensureUniqueUsername: FieldHook = async ({ data, originalDoc, req, value }) => {
  // if value is unchanged, skip validation
  if (originalDoc.username === value) {
    return value
  }

  const constraints: Where[] = [
    {
      username: {
        equals: value,
      },
    },
  ]

  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )

  if (selectedTenant) {
    constraints.push({
      'tenants.tenant': {
        equals: selectedTenant,
      },
    })
  }

  const findDuplicateUsers = await req.payload.find({
    collection: 'users',
    where: {
      and: constraints,
    },
  })

  if (findDuplicateUsers.docs.length > 0 && isUser(req.user)) {
    const tenantIDs = getUserTenantIDs(req.user)
    // if the user is an admin or has access to more than 1 tenant
    // provide a more specific error message
    if (req.user.roles?.includes('superadmin') || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        // @ts-ignore - selectedTenant will match DB ID type
        id: selectedTenant,
        collection: 'tenants',
      })

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a user with the username "${value}". Usernames must be unique per tenant.`,
            path: 'username',
          },
        ],
      })
    }

    throw new ValidationError({
      errors: [
        {
          message: `A user with the username ${value} already exists. Usernames must be unique per tenant.`,
          path: 'username',
        },
      ],
    })
  }

  return value
}
