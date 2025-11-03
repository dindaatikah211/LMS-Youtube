'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/assets/logo.svg'

const Page = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch tenants
  const tenants = await payload.find({
    collection: 'tenants',
    depth: 2,
    overrideAccess: false,
    user: null,
  })

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-950/80 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="Logo" width={28} height={28} />
            <span className="font-semibold text-lg tracking-tight">Educate</span>
          </div>

          {/* Login & Signup */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Login
            </Link>
            <div className="h-5 w-px bg-gray-500/40" />
            <Link
              href="/signup"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500">
          Explore. Learn. Create.
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl">
          A modern platform for learning, collaboration, and innovation across multiple disciplines.
        </p>
        <Link
          href="/signup"
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition"
        >
          Start Learning
        </Link>
      </header>

      {/* Dynamic Tenants Section */}
      <section className="py-20 border-t border-gray-800 bg-gray-950/40">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Learning Divisions</h2>

          {tenants.docs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-center">
              {tenants.docs.map((tenant: any) => (
                <div
                  key={tenant.id}
                  className="relative p-6 rounded-2xl border border-gray-800 hover:bg-gray-900 hover:border-teal-500 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold mb-2">{tenant.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {tenant.description || 'Explore courses and start learning'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No tenants available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 text-center bg-gradient-to-t from-gray-950 to-gray-900 border-t border-gray-800">
        <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-gray-400 mb-8">
          Unlock your potential through technology and innovation — join Educate today.
        </p>
        <Link
          href="/signup"
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition"
        >
          Enroll Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Educate. All rights reserved.
      </footer>
    </div>
  )
}

export default Page
