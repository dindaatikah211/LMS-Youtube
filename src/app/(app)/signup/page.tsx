import SignupForm from './components/SingupForm'
import { ReactElement } from 'react'

export default async function page(): Promise<ReactElement> {
  return (
    <div className="h-[calc(100vh-3rem)]">
      <SignupForm></SignupForm>
    </div>
  )
}
