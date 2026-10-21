import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { PROJECT_DETAILS } from '../data/projectDetails'
import { CATEGORIES, PROJECTS, projectById } from '../data/projects'
import { filterProjects } from './Projects'

const ease = [0.2, 0.8, 0.2, 1] as const

// Les fiches viennent de la V2 : on retire les icônes Font Awesome, absentes ici
const cleanHtml = (html: string) => html.replace(/<i class="[^"]*"[^>]*><\/i>\s*/g, '')

export function ProjectModal() {
  const { projectId, openProject, closeProject, filter } = useUI()
  const project = projectId ? projectById(projectId) : undefined
  const detail = projectId ? PROJECT_DETAILS[projectId] : undefined
  const [direction, setDirection] = useState(1)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const filtered = filterProjects(filter)
  const ids = (projectId && filtered.some((p) => p.id === projectId) ? filtered : PROJECTS).map((p) => p.id)
  const index = projectId ? ids.indexOf(projectId) : -1

  const go = (d: number) => {
    if (index < 0) return
    setDirection(d)
    setLightbox(null)
    openProject(ids[(index + d + ids.length) % ids.length])
  }

  useEffect(() => {
    if (!projectId) return
    scrollRef.current?.scrollTo({ top: 0 })
    closeRef.current?.focus({ preventScroll: true })
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (lightbox !== null) setLightbox(null)
        else closeProject()
      } else if (e.key === 'ArrowRight' && lightbox === null) {
        go(1)
      } else if (e.key === 'ArrowLeft' && lightbox === null) {
        go(-1)
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const color = project ? `var(${CATEGORIES[project.category].cssVar})` : 'var(--accent)'

  return (
    <AnimatePresence>
      {project && detail && (
        <motion.div
          key="project-modal"
          className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-ink/75 backdrop-blur-md" onClick={closeProject} aria-hidden="true" />

          <motion.div
            ref={dialogRef}
            id="project-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            className="relative flex max-h-[94svh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-2xl border border-line bg-deep shadow-2xl md:max-h-[90vh] md:rounded-2xl"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="h-1 shrink-0" style={{ background: color }} aria-hidden="true" />
            <button
              ref={closeRef}
              type="button"
              onClick={closeProject}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-deep text-muted transition-colors hover:text-fg"
              aria-label="Fermer la fiche projet"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <div ref={scrollRef} className="overflow-y-auto overscroll-contain" data-lenis-prevent>
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.article
                  key={project.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -28 }}
                  transition={{ duration: 0.3, ease }}
                  className="px-6 pt-8 pb-10 md:px-10"
                >
                  <p className="inline-flex items-center gap-2 text-sm text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    {detail.badge}
                  </p>
                  <h2 id="project-title" className="mt-3 pr-12 font-display text-3xl leading-tight font-semibold md:text-[2.6rem]">
                    {detail.title}
                  </h2>
                  {detail.context && <p className="mt-2 text-muted">{detail.context}</p>}
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {detail.tags.map((t) => (
                      <li key={t} className="rounded-md border border-line px-2 py-0.5 text-[0.8rem]">
                        {t}
                      </li>
                    ))}
                  </ul>

                  {detail.images.length > 0 && (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {detail.images.map((img, i) => (
                        <figure key={img.src} className="overflow-hidden rounded-xl border border-line bg-ink">
                          <button
                            type="button"
                            className="block w-full cursor-zoom-in"
                            onClick={() => setLightbox(i)}
                            aria-label={`Agrandir : ${img.caption ?? detail.title}`}
                          >
                            <motion.img
                              layoutId={`shot-${project.id}-${i}`}
                              src={img.src}
                              alt={img.caption ?? detail.title}
                              className="block max-h-[420px] w-full object-cover object-top"
                            />
                          </button>
                          {img.caption && <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">{img.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}

                  <div className="prose-project mt-8" dangerouslySetInnerHTML={{ __html: cleanHtml(detail.bodyHtml) }} />
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-4 py-3 md:px-6">
              <button type="button" onClick={() => go(-1)} className="btn btn-ghost btn-sm" aria-label="Projet précédent">
                <ArrowLeft size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Précédent</span>
              </button>
              <span className="font-mono text-sm text-muted" aria-live="polite">
                {index + 1} / {ids.length}
              </span>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost btn-sm" aria-label="Projet suivant">
                <span className="hidden sm:inline">Suivant</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {lightbox !== null && detail.images[lightbox] && (
              <motion.div
                key="lightbox"
                className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-ink/90 p-4 backdrop-blur-sm md:p-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightbox(null)}
              >
                <motion.img
                  layoutId={`shot-${project.id}-${lightbox}`}
                  src={detail.images[lightbox].src}
                  alt={detail.images[lightbox].caption ?? detail.title}
                  className="max-h-full max-w-full rounded-xl border border-line shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
