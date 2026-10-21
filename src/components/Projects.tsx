import { AppWindow, Cloud, Cpu, FileText, Network, Server, ShieldCheck, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useUI, type ProjectFilter } from '../context/UIContext'
import { CATEGORIES, PROJECTS, type DeviceType, type Project } from '../data/projects'
import { DOCS } from '../data/site'
import { cx } from '../lib/utils'

export const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'infra', label: 'Systèmes et réseau' },
  { id: 'secu', label: 'Sécurité' },
  { id: 'dev', label: 'Développement' },
  { id: 'stage', label: 'Stage' },
]

export const filterProjects = (filter: ProjectFilter) =>
  filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.filters.includes(filter))

export const DEVICE_ICON: Record<DeviceType, LucideIcon> = {
  server: Server,
  switch: Network,
  firewall: ShieldCheck,
  board: Cpu,
  app: AppWindow,
  cloud: Cloud,
}

const ease = [0.2, 0.8, 0.2, 1] as const

export function Projects() {
  const { filter, setFilter } = useUI()
  const list = filterProjects(filter)

  return (
    <section id="projects" className="mx-auto max-w-[1240px] px-5 py-28 md:px-8 md:py-36">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-title">Projets</h2>
          <p className="lede mt-5">
            Ateliers du BTS, stage en entreprise et projets personnels. Chaque fiche détaille la démarche, avec des
            captures et des extraits de configuration.
          </p>
        </div>
        <a href={DOCS.synthese.href} download={DOCS.synthese.download} className="btn btn-ghost self-start md:self-auto">
          <FileText size={18} aria-hidden="true" /> Tableau de synthèse (PDF)
        </a>
      </div>

      <div className="no-scrollbar -mx-5 mt-10 overflow-x-auto px-5 md:mx-0 md:px-0">
        <div className="inline-flex gap-1 rounded-xl border border-line bg-deep p-1" role="group" aria-label="Filtrer les projets">
          {FILTERS.map((f) => {
            const count = filterProjects(f.id).length
            const on = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f.id)}
                className={cx(
                  'relative inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm whitespace-nowrap transition-colors',
                  on ? 'text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {on && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 -z-0 rounded-lg bg-raise"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                {f.id !== 'all' && (
                  <span
                    className="relative h-2 w-2 rounded-full"
                    style={{ background: `var(${CATEGORIES[f.id as keyof typeof CATEGORIES].cssVar})` }}
                  />
                )}
                <span className="relative">{f.label}</span>
                <span className="relative font-mono text-xs text-muted">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <motion.ul layout className="mt-8 grid grid-flow-dense gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { openProject } = useUI()
  const Icon = DEVICE_ICON[project.device]
  const color = `var(${CATEGORIES[project.category].cssVar})`

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease }}
      className={cx('project-card group', project.featured && 'md:col-span-2')}
      style={{ ['--card-color' as string]: color }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} aria-hidden="true" />
      <div className={cx('flex h-full flex-col p-6 md:p-7', project.featured && 'md:p-9')}>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {CATEGORIES[project.category].label}
          </span>
          {project.kind && (
            <span className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">{project.kind}</span>
          )}
        </div>

        <span
          className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-ink/60"
          style={{ color }}
          aria-hidden="true"
        >
          <Icon size={20} />
        </span>

        <h3
          className={cx(
            'mt-5 font-display font-semibold leading-tight',
            project.featured ? 'text-3xl md:text-[2.4rem]' : 'text-[1.55rem]',
          )}
        >
          {project.title}
        </h3>
        <p className={cx('mt-3 text-muted', project.featured && 'max-w-[40rem] md:text-lg')}>{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {(project.featured ? project.stack : project.stack.slice(0, 3)).map((t) => (
            <li key={t} className="rounded-md bg-raise px-2 py-0.5 text-[0.8rem] text-fg">
              {t}
            </li>
          ))}
        </ul>

        <span className="mt-auto pt-7 text-sm font-medium text-fg underline-offset-4 group-hover:underline">
          Voir le détail
        </span>
      </div>
      <button
        type="button"
        onClick={() => openProject(project.id)}
        className="absolute inset-0 z-10 rounded-[inherit]"
        aria-label={`Voir le détail du projet : ${project.title}`}
      />
    </motion.li>
  )
}
