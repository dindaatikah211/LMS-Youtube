import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../../../actions/getUser'
import { Course, Participation } from '@/payload-types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HiArrowLeft, HiPencilAlt, HiVideoCamera } from 'react-icons/hi'
import Image from 'next/image'
import StartCourseButton from './components/StartCourseButton'
import ResumeButton from './components/ResumeButton'

const CoursePage = async ({ params }: { params: { tenant: string; courseId: string } }) => {
  const { tenant, courseId } = await params
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) return notFound()

  // Get tenantId from slug
  let tenantId: string = ''
  try {
    const tenantDoc = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: tenant } },
      limit: 1,
    })

    if (!tenantDoc.docs.length) return notFound()
    tenantId = tenantDoc.docs[0].id
  } catch {
    return notFound()
  }

  // Get course
  let course: Course | null = null
  try {
    const res = await payload.findByID({
      collection: 'courses',
      id: courseId,
      overrideAccess: false,
      user,
    })
    course = res
  } catch {
    return notFound()
  }

  if (!course) return notFound()

  // Check participation
  let participation: Participation | null = null
  try {
    const participationRes = await payload.find({
      collection: 'participation',
      where: {
        and: [
          { course: { equals: courseId } },
          { customer: { equals: user.id } },
          { tenants: { equals: tenantId } },
        ],
      },
      overrideAccess: false,
      user,
    })

    participation = participationRes?.docs[0] || null
  } catch (err) {
    console.error('Error fetching participation:', err)
  }

  const imageUrl = typeof course.image === 'string' ? course.image : course.image?.url || ''

  return (
    <div className="flex flex-col mx-auto w-full max-w-6xl p-6 pt-20 gap-6">
      {/* Back link */}
      <Link
        href={`/dashboard/${tenant}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition duration-200"
      >
        <HiArrowLeft className="text-lg" />
        Back
      </Link>

      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-gray-800 shadow-md">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>

      {/* Course info */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-white tracking-tight">{course.title}</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
          {course.description || 'No description available for this course.'}
        </p>
      </div>

      {/* Curriculum */}
      {course.curriculum && course.curriculum.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-teal-400 mb-3">Curriculum</h2>
          <div className="flex flex-col gap-3">
            {course.curriculum.map((block, id) => {
              if (block.blockType === 'video') {
                return (
                  <div
                    key={id}
                    className="p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-teal-500/60 hover:shadow-md hover:shadow-teal-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 text-teal-400 font-medium">
                      <HiVideoCamera className="text-lg" />
                      {block.title}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {block.duration || 0} minutes
                    </p>
                  </div>
                )
              }

              if (block.blockType === 'quiz') {
                return (
                  <div
                    key={id}
                    className="p-4 rounded-lg bg-gray-900 border border-gray-800 hover:border-yellow-500/50 hover:shadow-md hover:shadow-yellow-400/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 text-yellow-400 font-medium">
                      <HiPencilAlt className="text-lg" />
                      {block.title}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Questions: {block.questions?.length || 0}
                    </p>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )}

      {/* Action button */}
        {participation ? (
          <ResumeButton participation={participation} />
        ) : (
          <StartCourseButton courseId={course.id} />
        )}
      </div>
  )
}

export default CoursePage
