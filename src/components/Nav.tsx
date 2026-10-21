import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useUI } from '../context/UIContext'
import { DOCS, NAV, PROFILE } from '../data/site'
import { useActiveSection } from '../hooks/useActiveSection'
import { cx, isMac } from '../lib/utils'

const IDS = NAV.map((n) => n.id)

export function Nav() {
  const { theme, toggleTheme, setPaletteOpen } = useUI()
  const active = useActiveSection(IDS)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled || open ? 'border-line bg-ink/80 backdrop-blur-xl' : 'border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5 md:px-8" aria-label="Navigation principale">
        <a href="#home" className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
          {PROFILE.name}
        </a>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                className={cx(
                  'relative block rounded-lg px-3 py-2 text-[0.95rem] transition-colors',
                  active === item.id ? 'text-fg' : 'text-muted hover:text-fg',
                )}
                aria-current={active === item.id ? 'true' : undefined}
              >
                {active === item.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-lg bg-raise"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:text-fg"
            aria-label="Rechercher (palette de commandes)"
          >
            <Search size={16} aria-hidden="true" />
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd>{isMac() ? '⌘' : 'Ctrl'}</kbd>
              <kbd>K</kbd>
            </span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-fg"
            aria-label={theme === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair'}
          >
            {theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
          </button>
          <a href={DOCS.cv.href} download={DOCS.cv.download} className="btn btn-primary btn-sm hidden md:inline-flex">
            Mon CV
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <ul className="mx-auto flex max-w-[1240px] flex-col gap-1 px-5 py-4">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 font-display text-2xl font-medium hover:bg-raise"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a href={DOCS.cv.href} download={DOCS.cv.download} className="btn btn-primary w-full justify-center">
                  Télécharger mon CV
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
