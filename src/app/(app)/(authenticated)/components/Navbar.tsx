import Link from 'next/link'
import LogoutButton from './LogoutButton'
import Image from 'next/image'
import Logo from '@/assets/logo.svg'

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-950 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Dashboard Link */}
        <div className="flex items-center gap-3">
          <Image src={Logo} alt="Educate Logo" width={28} height={28} />
          <Link href="/dashboard" className="text-lg font-semibold hover:text-gray-300 transition">
            Dashboard
          </Link>
        </div>

        {/* Icon Links */}
        <div className="flex items-center gap-6">
          {/* Logout Icon */}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
