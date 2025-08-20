import { redirect } from 'next/navigation'
import React, { FC, ReactNode } from 'react'
import { getUser } from './actions/getUser'
import Navbar from './components/Navbar'

interface TemplateProps {
  children: ReactNode
}

const Template: FC<TemplateProps> = async ({ children }) => {
  const user = await getUser()
  if (!user) {
    redirect('/login')
    return null
  }

  return (
    <div>
      <Navbar></Navbar>
      {children}
    </div>
  )
}

export default Template
