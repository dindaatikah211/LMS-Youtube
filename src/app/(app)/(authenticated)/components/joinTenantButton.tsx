'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinTenant } from '../actions/joinTenant'
import { leaveTenant } from '../actions/leaveTenant'

interface JoinTenantButtonProps {
  tenantId: string
  tenantSlug: string
  isMember: boolean
  tenantName?: string
}

export default function JoinTenantButton({
  tenantId,
  tenantSlug,
  isMember,
  tenantName = 'this tenant',
}: JoinTenantButtonProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [action, setAction] = useState<'join' | 'leave'>('join')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    try {
      const result = await joinTenant(tenantId)
      setShowPopup(false)

      // Kalau join berhasil, langsung redirect ke dashboard tenant-nya
      if (result?.success) {
        router.push(`/dashboard/${tenantSlug}`)
      } else {
        router.refresh() // fallback kalau gagal redirect
      }
    } catch (error) {
      console.error('Error joining tenant:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    setLoading(true)
    try {
      await leaveTenant(tenantId)
      setShowPopup(false)
      router.refresh()
    } catch (error) {
      console.error('Error leaving tenant:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    router.push(`/dashboard/${tenantSlug}`)
  }

  const openJoinPopup = () => {
    setAction('join')
    setShowPopup(true)
  }

  const openLeavePopup = () => {
    setAction('leave')
    setShowPopup(true)
  }

  if (isMember) {
    return (
      <>
        <div className="flex gap-2 w-full justify-center">
          <button
            onClick={handleOpen}
            className="flex-1 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium"
          >
            Open
          </button>
          <button
            onClick={openLeavePopup}
            className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Leave
          </button>
        </div>

        {showPopup && action === 'leave' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">Leave Tenant</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to leave{' '}
                <span className="text-teal-400 font-semibold">{tenantName}</span>? You will lose
                access to all courses.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPopup(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeave}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Leaving...
                    </span>
                    ) : (
                    'Leave'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={openJoinPopup}
        className="w-full px-6 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium"
      >
        Join
      </button>

      {showPopup && action === 'join' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Join Tenant</h3>
            <p className="text-gray-300 mb-6">
              Do you want to join{' '}
              <span className="text-teal-400 font-semibold">{tenantName}</span>? You will get access
              to all courses.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPopup(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Joining...
                  </span>
                ) : (
                  'Join'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}