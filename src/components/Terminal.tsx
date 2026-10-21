import { TerminalSquare, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useUI } from '../context/UIContext'
import { DOCS } from '../data/site'
import { cx, downloadFile } from '../lib/utils'

type Line = { text: string; kind?: 'cmd' | 'accent' | 'error' }

const HELP = [
  'Commandes disponibles :',
  '  whoami      qui je suis',
  '  skills      voir les compétences',
  '  projects    voir les projets',
  '  veille      lire la veille sur la cryptographie post-quantique',
  '  contact     me contacter',
  '  cv          télécharger mon CV (PDF)',
  '  synthese    télécharger le tableau de synthèse (PDF)',
  '  neofetch    infos système',
  '  ping <hôte> tester la latence (fictif)',
  '  spin        faire tourner la topologie 3D',
  '  3d          activer ou couper la 3D',
  '  theme       changer de thème',
  '  date        date et heure',
  '  clear       vider le terminal',
  '  exit        fermer le terminal',
]

export function Terminal() {
  const ui = useUI()
  const { terminalOpen, setTerminalOpen } = ui
  const [lines, setLines] = useState<Line[]>([
    { text: 'Bienvenue sur le terminal du portfolio de Mehdi Seghier.', kind: 'accent' },
    { text: 'Tape "help" pour la liste des commandes.' },
  ])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (terminalOpen) window.setTimeout(() => inputRef.current?.focus(), 40)
  }, [terminalOpen])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    if (!terminalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTerminalOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [terminalOpen, setTerminalOpen])

  const print = (...out: Line[]) => setLines((l) => [...l, ...out])
  const go = (id: string, label: string) => {
    ui.scrollTo(`#${id}`)
    print({ text: `→ direction ${label}…`, kind: 'accent' })
  }

  const run = (raw: string) => {
    const trimmed = raw.trim()
    print({ text: trimmed, kind: 'cmd' })
    if (!trimmed) return
    const [cmdRaw, ...args] = trimmed.split(/\s+/)
    const cmd = cmdRaw.toLowerCase()
    switch (cmd) {
      case 'help':
        print(...HELP.map((text) => ({ text })))
        break
      case 'whoami':
        print(
          { text: "mehdi, étudiant en BTS SIO option SISR (Iris Campus, Nice)." },
          { text: "En recherche d'alternance d'administrateur systèmes et réseaux." },
        )
        break
      case 'skills':
      case 'competences':
        go('skills', 'Compétences')
        break
      case 'projects':
      case 'projets':
        go('projects', 'Projets')
        break
      case 'contact':
        go('contact', 'Contact')
        break
      case 'veille':
        print({ text: '→ ouverture de la veille technologique…', kind: 'accent' })
        window.setTimeout(() => (window.location.href = DOCS.veillePage), 400)
        break
      case 'cv':
        print({ text: '→ téléchargement du CV…', kind: 'accent' })
        downloadFile(DOCS.cv.href, DOCS.cv.download)
        break
      case 'synthese':
      case 'tableau':
        print({ text: '→ téléchargement du tableau de synthèse…', kind: 'accent' })
        downloadFile(DOCS.synthese.href, DOCS.synthese.download)
        break
      case 'neofetch':
        print(
          { text: 'mehdi@sisr', kind: 'accent' },
          { text: '----------' },
          { text: 'OS        BTS SIO, option SISR' },
          { text: 'École     Iris Campus, Nice' },
          { text: 'Shell     bash / PowerShell' },
          { text: 'Stack     Linux, Windows Server, Cisco IOS, GLPI' },
          { text: 'Uptime    promotion 2025 – 2027' },
          { text: "Recherche alternance administrateur systèmes et réseaux" },
        )
        break
      case 'ping': {
        const ms = Math.floor(Math.random() * 20) + 4
        print({ text: `Requête vers ${args[0] || 'localhost'}… réponse en ${ms} ms.` })
        break
      }
      case 'spin':
        ui.scrollTo('top')
        ui.spin()
        print({ text: '→ la topologie tourne à pleine vitesse.', kind: 'accent' })
        break
      case '3d':
        ui.setFx(!ui.fx)
        print({ text: ui.fx ? '→ mode performance : 3D coupée (réglage mémorisé).' : '→ 3D réactivée.', kind: 'accent' })
        break
      case 'theme':
        ui.toggleTheme()
        print({ text: '→ thème changé.', kind: 'accent' })
        break
      case 'sudo':
        print({ text: 'Permission refusée : seul le formateur SISR a les droits root ici.', kind: 'error' })
        break
      case 'date':
        print({
          text: new Date().toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
      case 'quit':
        setTerminalOpen(false)
        toggleRef.current?.focus()
        break
      default:
        print({ text: `commande introuvable : ${cmd}. Tape "help" pour la liste des commandes.`, kind: 'error' })
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      history.current.push(value)
      historyIndex.current = history.current.length
    }
    run(value)
    setValue('')
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setTerminalOpen(!terminalOpen)}
        className={cx(
          'no-print fixed bottom-5 left-5 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line shadow-lg backdrop-blur transition-colors',
          terminalOpen ? 'bg-fg text-ink' : 'bg-deep/80 text-muted hover:text-fg',
        )}
        aria-label={terminalOpen ? 'Fermer le terminal' : 'Ouvrir le terminal'}
        aria-expanded={terminalOpen}
        aria-controls="terminal-panel"
      >
        <TerminalSquare size={20} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {terminalOpen && (
          <motion.div
            id="terminal-panel"
            role="dialog"
            aria-label="Terminal interactif"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed right-3 bottom-20 left-3 z-[60] flex max-h-[min(460px,70vh)] flex-col overflow-hidden rounded-2xl border border-[#1d2843] bg-[#060a12] font-mono text-[0.82rem] text-[#d5def0] shadow-2xl sm:right-auto sm:left-5 sm:w-[460px]"
          >
            <div className="flex items-center gap-2 border-b border-[#1d2843] bg-[#0c1322] px-3.5 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" aria-hidden="true" />
              <span className="flex-1 text-center text-xs text-[#8f9cb6]">mehdi@sisr: ~</span>
              <button type="button" onClick={() => setTerminalOpen(false)} className="text-[#8f9cb6] hover:text-white" aria-label="Fermer le terminal">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-3 leading-relaxed" role="log" aria-live="polite" data-lenis-prevent>
              {lines.map((l, i) => (
                <p
                  key={i}
                  className={cx(
                    'mb-1 break-words whitespace-pre-wrap',
                    l.kind === 'cmd' && 'text-[#7effa0]',
                    l.kind === 'accent' && 'text-[#b4a9ff]',
                    l.kind === 'error' && 'text-[#ff8f8f]',
                  )}
                >
                  {l.kind === 'cmd' && <span className="text-[#9d8cff]">mehdi@sisr:~$ </span>}
                  {l.text}
                </p>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#1d2843] bg-[#0a0f1a] px-4 py-2.5">
              <label htmlFor="terminal-input" className="sr-only">
                Commande
              </label>
              <span className="text-[#9d8cff]" aria-hidden="true">
                mehdi@sisr:~$
              </span>
              <input
                ref={inputRef}
                id="terminal-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' && history.current.length && historyIndex.current > 0) {
                    e.preventDefault()
                    historyIndex.current -= 1
                    setValue(history.current[historyIndex.current])
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (historyIndex.current < history.current.length - 1) {
                      historyIndex.current += 1
                      setValue(history.current[historyIndex.current])
                    } else {
                      historyIndex.current = history.current.length
                      setValue('')
                    }
                  }
                }}
                className="flex-1 bg-transparent text-white outline-none"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
