'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Sparkles } from 'lucide-react'
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
    <nav className="bg-card border-b border-border flex-shrink-0 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/campaigns" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-serif text-lg font-medium tracking-wide text-primary">Mystic Quest</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Avatar className="w-7 h-7">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name || user.email}</span>
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
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          <Link
            href="/campaigns"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-colors"
          >
            {t('nav.campaigns')}
          </Link>
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-colors"
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
