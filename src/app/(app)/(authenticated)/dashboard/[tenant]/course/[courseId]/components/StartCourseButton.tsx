'use client'

import { participate } from '@/app/(app)/(authenticated)/actions/participate'
import { Participation } from '@/payload-types'
import { useParams, useRouter } from 'next/navigation'
import { useState, MouseEvent } from 'react'
import { HiExclamationCircle, HiPlay } from 'react-icons/hi'

export default function StartCourseButton({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const tenant = params.tenant

  async function handleStartCourse(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const participation: Participation = await participate({ courseId })

      if (!participation) {
        throw new Error('Failed to create participation')
      }

      router.push(`/dashboard/${tenant}/participation/${participation.id}`)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError('Failed to start course. Please try again.')
    }
  }

  const isLoading = status === 'loading'
  const isError = status === 'error'

  return (
    <div className="mt-6">
      <button
        onClick={handleStartCourse}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded transition duration-300 ease-in-out
                    ${isError ? 'bg-red-600 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Starting Course...
          </span>
        ) : isError ? (
          <span className="flex items-center gap-2">
            <HiExclamationCircle className="text-xl" />
            Try Again
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <HiPlay className="text-xl" />
            Start Course
          </span>
        )}
      </button>

      {isError && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <HiExclamationCircle className="text-lg" />
          {error}
        </p>
      )}
    </div>
  )
}
