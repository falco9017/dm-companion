'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Scroll } from 'lucide-react'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-surface border-b border-border-theme flex-shrink-0 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/campaigns" className="flex items-center gap-2">
              <Scroll className="w-6 h-6 text-accent-purple-light" />
              <span className="text-xl font-bold gradient-text">DM Companion</span>
            </Link>
          </div>

          {/* Desktop user info */}
          <div className="hidden md:flex items-center">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-7 h-7 rounded-full ring-2 ring-accent-purple/30"
                />
              )}
              <span>{user.name || user.email}</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-text-secondary hover:text-text-primary p-2"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-theme bg-surface-elevated px-4 py-3 space-y-2">
          <Link
            href="/campaigns"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            Campaigns
          </Link>
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
          >
            {user.image && (
              <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
            )}
            <span>{user.name || user.email}</span>
          </Link>
        </div>
      )}
    </nav>
  )
}
