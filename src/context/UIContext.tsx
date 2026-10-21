import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { CategoryId } from '../data/projects'

export type Theme = 'dark' | 'light'
export type ProjectFilter = 'all' | CategoryId

export interface Toast {
  id: number
  message: string
}

interface UIContextValue {
  theme: Theme
  toggleTheme: () => void
  fx: boolean
  setFx: (on: boolean) => void
  reducedMotion: boolean
  projectId: string | null
  openProject: (id: string) => void
  closeProject: () => void
  filter: ProjectFilter
  setFilter: (filter: ProjectFilter) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  terminalOpen: boolean
  setTerminalOpen: (open: boolean) => void
  toasts: Toast[]
  toast: (message: string) => void
  scrollTo: (target: string) => void
  spinSignal: number
  spin: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

const readTheme = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
const readFx = () => !document.documentElement.classList.contains('fx-off')

export function UIProvider({ children }: { children: ReactNode }) {
  const reducedMotion = !!useReducedMotion()
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [fx, setFxState] = useState(readFx)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [spinSignal, setSpinSignal] = useState(0)
  const lenisRef = useRef<Lenis | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  // Défilement fluide (désactivé si l'utilisateur préfère réduire les animations)
  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1 })
    lenisRef.current = lenis
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  const scrollTo = useCallback(
    (target: string) => {
      if (target === 'top' || target === '#home') {
        if (lenisRef.current) lenisRef.current.scrollTo(0)
        else window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
        return
      }
      const el = document.querySelector<HTMLElement>(target)
      if (!el) return
      if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -72 })
      else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
    },
    [reducedMotion],
  )

  // Liens d'ancre internes : défilement fluide et URL mise à jour
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href === '#') return
      e.preventDefault()
      scrollTo(href)
      history.replaceState(null, '', href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [scrollTo])

  // Verrouille le défilement quand une fenêtre est ouverte
  const locked = projectId !== null || paletteOpen
  useEffect(() => {
    const lenis = lenisRef.current
    if (locked) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [locked])

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === 'light' ? 'dark' : 'light'
    if (next === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* stockage indisponible : le thème ne sera pas mémorisé */
    }
    setTheme(next)
  }, [])

  const setFx = useCallback((on: boolean) => {
    document.documentElement.classList.toggle('fx-off', !on)
    try {
      localStorage.setItem('fx', on ? 'on' : 'off')
    } catch {
      /* ignoré */
    }
    setFxState(on)
  }, [])

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2600)
  }, [])

  const openProject = useCallback((id: string) => {
    if (!lastFocus.current || !document.getElementById('project-dialog')?.contains(document.activeElement)) {
      lastFocus.current = document.activeElement as HTMLElement | null
    }
    setProjectId(id)
  }, [])

  const closeProject = useCallback(() => {
    setProjectId(null)
    const el = lastFocus.current
    lastFocus.current = null
    window.setTimeout(() => el?.focus?.({ preventScroll: true }), 30)
  }, [])

  const spin = useCallback(() => setSpinSignal((n) => n + 1), [])

  const value = useMemo<UIContextValue>(
    () => ({
      theme,
      toggleTheme,
      fx,
      setFx,
      reducedMotion,
      projectId,
      openProject,
      closeProject,
      filter,
      setFilter,
      paletteOpen,
      setPaletteOpen,
      terminalOpen,
      setTerminalOpen,
      toasts,
      toast,
      scrollTo,
      spinSignal,
      spin,
    }),
    [theme, toggleTheme, fx, setFx, reducedMotion, projectId, openProject, closeProject, filter, paletteOpen, terminalOpen, toasts, toast, scrollTo, spinSignal, spin],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI doit être utilisé dans <UIProvider>')
  return ctx
}
