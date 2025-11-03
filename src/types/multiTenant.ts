import type { AccessArgs } from 'payload'

export type MultiTenantAccessArgs = AccessArgs & {
  context?: {
    tenants?: string[]
  }
}
