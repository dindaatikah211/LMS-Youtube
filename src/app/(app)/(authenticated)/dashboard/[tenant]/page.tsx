'use server'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import configPromise from '@payload-config'
import { Course } from '@/payload-types'
import Link from 'next/link'
import { getUser } from '../../actions/getUser'
import Image from 'next/image'
import { Participation } from '@/payload-types'
import ResumeButton from './course/[courseId]/components/ResumeButton'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { tenant: string } }) => {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const { tenant } = await params

  // Get tenant document
  const tenantDoc = await payload.find({
    collection: 'tenants',
    where: {
      slug: { equals: tenant },
    },
    limit: 1,
  })

  if (!tenantDoc.docs.length) {
    return <div>Tenant not found</div>
  }

  const tenantId = tenantDoc.docs[0].id

  // Get courses
  let courses: Course[] = []
  try {
    let coursesRes = await payload.find({
      collection: 'courses',
      limit: 10,
      overrideAccess: false,
      user: user,
      where: {
        tenant: { equals: tenantId },
      },
    })
    courses = coursesRes.docs
  } catch (e) {
    console.log('Error fetching courses:', e)
  }

  // Get participations
  let participations: Participation[] = []
  try {
    let participationRes = await payload.find({
      collection: 'participation',
      where: {
        customer: {
          equals: user.id,
        },
      },
      depth: 2,
      overrideAccess: false,
      user: user,
    })

    // Filter by tenant
    participations = participationRes.docs.filter((p) => {
      if (Array.isArray(p.tenants) && p.tenants.length > 0) {
        const firstTenant = p.tenants[0]
        const pTenantId = typeof firstTenant === 'string' ? firstTenant : firstTenant?.id
        return pTenantId === tenantId
      }
      return false
    })
  } catch (e) {
    console.log('Error fetching participations:', e)
  }

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

      {participations && participations.length > 0 && (
        <div className="text-sm text-teal-400">Your Courses</div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Suspense fallback={<div>Loading...</div>}>
          {participations.map((participation) => {
            return <ResumeButton key={participation.id} participation={participation} />
          })}
        </Suspense>
      </div>

      <div className="text-sm text-teal-400">All Courses</div>
      <div className="grid grid-cols-3 gap-4">
        <Suspense fallback={<div>Loading...</div>}>
          {courses.map((course) => {
            const imageUrl =
              typeof course.image === 'string' ? course.image : course.image?.url || ''

            return (
              <Link
                href={`/dashboard/${tenant}/course/${course.id}`}
                key={course.id}
                className="flex flex-col cursor-pointer relative border border-gray-700 rounded hover:border-white transition ease-in-out duration-100 overflow-hidden"
              >
                <div className="relative w-full aspect-video">
                  {imageUrl && (
                    <Image
                      alt={`${course.title} thumbnail`}
                      src={imageUrl}
                      fill={true}
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white">{course.title}</h3>
                </div>
              </Link>
            )
          })}
        </Suspense>
      </div>
    </div>
  )
}

export default page