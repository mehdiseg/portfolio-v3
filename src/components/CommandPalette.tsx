import {
  BookOpen,
  Box,
  Copy,
  Download,
  FileText,
  Home,
  Mail,
  Moon,
  RotateCw,
  Search,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useUI } from '../context/UIContext'
import { PROJECTS } from '../data/projects'
import { DOCS, NAV, PROFILE } from '../data/site'
import { cx, downloadFile, isMac, normalize } from '../lib/utils'
import { DEVICE_ICON } from './Projects'

interface Item {
  group: string
  label: string
  icon: LucideIcon | ComponentType<{ size?: number }>
  keywords?: string
  run: () => void
}

export function CommandPalette() {
  const ui = useUI()
  const { paletteOpen, setPaletteOpen } = ui
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = !!target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(!paletteOpen)
      } else if (e.key === '/' && !typing && !paletteOpen) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen, setPaletteOpen])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setActive(0)
      window.setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [paletteOpen])

  const items = useMemo<Item[]>(() => {
    const close = () => setPaletteOpen(false)
    const nav = (id: string) => () => {
      close()
      ui.scrollTo(`#${id}`)
    }
    return [
      { group: 'Navigation', label: 'Accueil', icon: Home, run: nav('home') },
      ...NAV.map((n) => ({ group: 'Navigation', label: n.label, icon: Search, run: nav(n.id) })),
      ...PROJECTS.map((p) => ({
        group: 'Projets',
        label: p.title,
        icon: DEVICE_ICON[p.device],
        keywords: `${p.summary} ${p.stack.join(' ')}`,
        run: () => {
          close()
          ui.openProject(p.id)
        },
      })),
      {
        group: 'Actions',
        label: 'Télécharger mon CV (PDF)',
        icon: Download,
        keywords: 'cv resume',
        run: () => {
          close()
          downloadFile(DOCS.cv.href, DOCS.cv.download)
        },
      },
      {
        group: 'Actions',
        label: 'Télécharger le tableau de synthèse (PDF)',
        icon: FileText,
        keywords: 'synthese bts annexe',
        run: () => {
          close()
          downloadFile(DOCS.synthese.href, DOCS.synthese.download)
        },
      },
      {
        group: 'Actions',
        label: 'Lire la veille complète',
        icon: BookOpen,
        keywords: 'pqc quantique cryptographie',
        run: () => {
          window.location.href = DOCS.veillePage
        },
      },
      {
        group: 'Actions',
        label: "Copier l'adresse e-mail",
        icon: Copy,
        keywords: 'mail courriel contact',
        run: () => {
          close()
          navigator.clipboard
            ?.writeText(PROFILE.email)
            .then(() => ui.toast('Adresse e-mail copiée'))
            .catch(() => (window.location.href = `mailto:${PROFILE.email}`))
        },
      },
      {
        group: 'Actions',
        label: 'Écrire un e-mail',
        icon: Mail,
        run: () => {
          window.location.href = `mailto:${PROFILE.email}`
        },
      },
      {
        group: 'Actions',
        label: ui.theme === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair',
        icon: Moon,
        keywords: 'theme dark light nuit jour',
        run: () => {
          close()
          ui.toggleTheme()
        },
      },
      {
        group: 'Actions',
        label: ui.fx ? 'Couper la 3D (mode performance)' : 'Réactiver la 3D',
        icon: Box,
        keywords: '3d webgl performance animation',
        run: () => {
          close()
          ui.setFx(!ui.fx)
          ui.toast(ui.fx ? 'Mode performance : 3D coupée' : '3D réactivée')
        },
      },
      {
        group: 'Actions',
        label: 'Faire tourner la topologie 3D',
        icon: RotateCw,
        keywords: 'spin reseau globe',
        run: () => {
          close()
          ui.scrollTo('top')
          ui.spin()
        },
      },
      {
        group: 'Actions',
        label: 'Ouvrir le terminal',
        icon: TerminalSquare,
        keywords: 'bash console commande',
        run: () => {
          close()
          ui.setTerminalOpen(true)
        },
      },
      {
        group: 'Actions',
        label: 'Voir mon GitHub',
        icon: FaGithub,
        keywords: 'code depot',
        run: () => {
          close()
          window.open(PROFILE.github, '_blank', 'noopener')
        },
      },
    ]
  }, [ui, setPaletteOpen])

  const shown = useMemo(() => {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean)
    return items.filter((it) => {
      const hay = normalize(`${it.label} ${it.group} ${it.keywords ?? ''}`)
      return words.every((w) => hay.includes(w))
    })
  }, [items, query])

  useEffect(() => {
    if (active >= shown.length) setActive(Math.max(shown.length - 1, 0))
  }, [shown, active])

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % Math.max(shown.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + shown.length) % Math.max(shown.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      shown[active]?.run()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setPaletteOpen(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  let lastGroup = ''

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setPaletteOpen(false)} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            className="relative flex max-h-[70vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-line bg-deep shadow-2xl"
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={shown[active] ? `palette-${active}` : undefined}
                placeholder="Rechercher une section, un projet, une action"
                className="h-14 flex-1 bg-transparent text-[1.02rem] outline-none placeholder:text-muted"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd>Échap</kbd>
            </div>
            <ul ref={listRef} id="palette-list" role="listbox" className="overflow-y-auto p-2" data-lenis-prevent>
              {shown.length === 0 && <li className="px-4 py-10 text-center text-muted">Aucun résultat pour « {query} »</li>}
              {shown.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null
                lastGroup = it.group
                const Icon = it.icon
                return (
                  <li key={`${it.group}-${it.label}`} role="presentation">
                    {header && <p className="px-3 pt-3 pb-1.5 text-xs text-muted">{header}</p>}
                    <div
                      id={`palette-${i}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => i !== active && setActive(i)}
                      onClick={() => it.run()}
                      className={cx(
                        'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem]',
                        i === active ? 'bg-raise text-fg' : 'text-fg/85',
                      )}
                    >
                      <span
                        className={cx(
                          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                          i === active ? 'border-accent text-accent' : 'border-line text-muted',
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="truncate">{it.label}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="hidden items-center gap-5 border-t border-line px-4 py-2.5 text-xs text-muted sm:flex">
              <span className="inline-flex items-center gap-1">
                <kbd>↑</kbd>
                <kbd>↓</kbd> naviguer
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd>Entrée</kbd> ouvrir
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd>{isMac() ? '⌘' : 'Ctrl'}</kbd>
                <kbd>K</kbd> ouvrir ou fermer
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
