import { ReactElement } from 'react'

export default function SubmitButton({
  loading,
  text,
  loadingText = 'Processing...',
}: {
  loading: boolean
  text: string
  loadingText?: string
}): ReactElement {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`relative w-full p-2 rounded-md transition text-white font-medium ${
        loading
          ? 'bg-teal-700 opacity-80 cursor-not-allowed'
          : 'bg-teal-600 hover:bg-teal-700'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
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
          {loadingText}
        </span>
      ) : (
        text
      )}
    </button>
  )
}
