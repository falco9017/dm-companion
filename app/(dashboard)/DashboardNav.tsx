'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Scroll } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <nav className="bg-card border-b flex-shrink-0 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/campaigns" className="flex items-center gap-2">
              <Scroll className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold gradient-text">DM Companion</span>
            </Link>
          </div>

          {/* Desktop nav links + user info */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Avatar className="w-7 h-7">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="text-xs">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.name || user.email}</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-2">
          <Link
            href="/campaigns"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            {t('nav.campaigns')}
          </Link>
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            {user.image && (
              <Image src={user.image} alt="" width={20} height={20} className="w-5 h-5 rounded-full" />
            )}
            <span>{user.name || user.email}</span>
          </Link>
        </div>
      )}
    </nav>
  )
}
