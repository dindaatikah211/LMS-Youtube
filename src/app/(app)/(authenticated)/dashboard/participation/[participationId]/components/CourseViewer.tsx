'use client'

import { Course, Participation } from '@/payload-types'
import { useState, useEffect } from 'react'
import Curriculum from './Curriculum'
import CourseModule from './CourseModule'

export default function CourseViewer({ participation }: { participation: Participation }) {
  const [currentProgress, setCurrentProgress] = useState(participation.progress ?? 0)
  const [currentParticipation, setCurrentParticipation] = useState<Participation>(participation)
  const course = participation.course as Course

  useEffect(() => {
    setCurrentProgress(participation.progress ?? 0)
    setCurrentParticipation(participation)
  }, [participation])

  async function handleComplete(nextIndex: number) {
    console.log('Handling complete:', nextIndex)
    setCurrentProgress(nextIndex)
    setCurrentParticipation((prev) => ({
      ...prev,
      progress: nextIndex,
    }))
  }

  if (!course || !course.curriculum) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {course.curriculum[currentProgress] ? (
        <CourseModule
          onCompleted={handleComplete}
          module={course.curriculum[currentProgress]}
          participation={currentParticipation}
          key={currentProgress}
        />
      ) : (
        <div>Course completed!</div>
      )}

      <Curriculum course={course} currentProgress={currentProgress} />
    </div>
  )
}
