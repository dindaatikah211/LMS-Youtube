import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../../../actions/getUser'
import { Participation } from '@/payload-types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HiArrowLeft } from 'react-icons/hi'
import CourseViewer from './components/CourseViewer'

export default async function ParticipationPage({
  params,
}: {
  params: { tenant: string, participationId: string }
}) {
  const payload = await getPayload({ config: configPromise })
  const { tenant, participationId } = await params
  const user = await getUser()

  let participation: Participation | null = null

  try {
    const res: Participation = await payload.findByID({
      collection: 'participation',
      id: participationId,
      overrideAccess: false,
      user: user,
    })

    participation = res
  } catch (err) {
    console.error(err)
    return notFound()
  }

  if (!participation) {
    return notFound()
  }

  return (
    <div className="flex flex-col mx-auto w-full max-w-6xl p-7 gap-7 pt-20">
      <Link
        href={`/dashboard/${tenant}`}
        className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition duration-300 ease-in-out"
      >
        <HiArrowLeft className="text-lg" />
        Back{' '}
      </Link>

      <CourseViewer participation={participation} />
    </div>
  )
}