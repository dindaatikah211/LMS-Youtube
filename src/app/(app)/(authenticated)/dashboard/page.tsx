'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/getUser'
import JoinTenantButton from '../components/joinTenantButton'

const Page = async () => {
  const payload = await getPayload({ config: configPromise })

  // Get the user
  const user = await getUser()

  if (!user) {
    return <div>Please login</div>
  }

  // Get tenants
  const tenants = await payload.find({
    collection: 'tenants',
    depth: 2,
    overrideAccess: true,
  })

  // Check membership for each tenant
  const existingTenants = user.tenants || []

  return (
    <div className="flex flex-col mx-auto w-full max-w-6xl p-6 gap-6 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 mt-1">
            Welcome back, <span className="text-teal-400">{user?.email}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800"></div>

      <div>
        <h2 className="text-lg font-semibold text-teal-400 mb-4">Available Tenants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants?.docs.map((tenant: any) => {
            // Check if user is member of this tenant
            const isMember = existingTenants.some((t: any) => {
              const tId = typeof t.tenant === 'string' ? t.tenant : t.tenant?.id
              return tId === tenant.id
            })

            return (
              <div
                key={tenant.id}
                className="relative bg-gray-950 border border-gray-700 rounded-xl p-6 flex flex-col gap-4 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
              >
                {isMember && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-900 text-teal-200 border border-teal-700">
                      Member
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{tenant.name}</h3>
                  <p className="text-sm text-gray-400">
                    {tenant.description || 'Explore courses and start learning'}
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <JoinTenantButton
                    tenantId={tenant.id}
                    tenantSlug={tenant.slug}
                    isMember={isMember}
                    tenantName={tenant.name}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {tenants?.docs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No tenants available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page