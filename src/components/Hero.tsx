import { Download, Mail } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { CATEGORIES, type CategoryId } from '../data/projects'
import { DOCS, PROFILE } from '../data/site'
import { hasWebGL } from '../lib/utils'
import { TopologyFallback } from '../three/TopologyFallback'
import { Magnetic } from './Magnetic'

const TopologyScene = lazy(() => import('../three/TopologyScene'))

const ease = [0.2, 0.8, 0.2, 1] as const

export function Hero() {
  const { fx, theme, reducedMotion, openProject, spinSignal, setFilter, scrollTo } = useUI()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const webgl = useMemo(hasWebGL, [])
  const [hovered, setHovered] = useState<string | null>(null)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const show3D = fx && webgl

  const reveal = (i: number) =>
    reducedMotion
      ? {}
      : {
          initial: { y: '105%' },
          animate: { y: '0%' },
          transition: { duration: 1, delay: 0.25 + i * 0.12, ease },
        }
  const fade = (delay: number) =>
    reducedMotion
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } }

  return (
    <section id="home" ref={ref} className="relative min-h-[100svh] overflow-hidden" aria-label="Présentation">
      <div className="absolute inset-x-0 top-0 h-[62svh] lg:inset-0 lg:h-auto" aria-hidden="true">
        {show3D ? (
          <Suspense fallback={<TopologyFallback />}>
            <TopologyScene
              active={inView}
              theme={theme}
              reducedMotion={reducedMotion}
              hovered={hovered}
              category={category}
              spinSignal={spinSignal}
              onHover={setHovered}
              onSelect={openProject}
            />
          </Suspense>
        ) : (
          <TopologyFallback />
        )}
      </div>
      <div className="hero-veil pointer-events-none absolute inset-0" />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1240px] flex-col justify-end px-5 pt-[56svh] pb-12 md:px-8 lg:pt-28 lg:pb-16">
        <div className="max-w-[44rem]">
          <motion.p {...fade(0.1)} className="pointer-events-auto mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-deep/70 px-3.5 py-1.5 text-sm text-muted backdrop-blur">
            <span className="status-dot" aria-hidden="true" />
            {PROFILE.status}
          </motion.p>

          <h1 className="font-display text-[clamp(3.6rem,10.5vw,8.6rem)] leading-[0.88] font-semibold tracking-[-0.025em]">
            <span className="pointer-events-auto block w-fit overflow-hidden pb-[0.06em]">
              <motion.span className="block" {...reveal(0)}>
                {PROFILE.firstName}
              </motion.span>
            </span>
            <span className="pointer-events-auto block w-fit overflow-hidden pb-[0.06em]">
              <motion.span className="block" {...reveal(1)}>
                {PROFILE.lastName}
              </motion.span>
            </span>
          </h1>

          <motion.p {...fade(0.65)} className="pointer-events-auto mt-6 w-fit max-w-[36rem] text-[1.15rem] leading-relaxed text-fg md:text-xl">
            {PROFILE.pitch}
          </motion.p>

          <motion.div {...fade(0.8)} className="pointer-events-auto mt-8 flex w-fit flex-wrap gap-3">
            <Magnetic>
              <a href={DOCS.cv.href} download={DOCS.cv.download} className="btn btn-primary">
                <Download size={18} aria-hidden="true" /> Télécharger mon CV
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-ghost">
                <Mail size={18} aria-hidden="true" /> Me contacter
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          {...fade(1.1)}
          className="pointer-events-auto mt-12 flex flex-col gap-4 border-t border-line pt-5 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-sm text-muted">
            {show3D
              ? 'Mes projets, représentés comme un réseau. Survolez un équipement, cliquez pour ouvrir le projet.'
              : 'Mes projets, représentés comme un réseau.'}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Catégories de projets">
            {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg focus-visible:text-fg"
                  onMouseEnter={() => setCategory(id)}
                  onMouseLeave={() => setCategory(null)}
                  onFocus={() => setCategory(id)}
                  onBlur={() => setCategory(null)}
                  onClick={() => {
                    setFilter(id)
                    scrollTo('#projects')
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(${CATEGORIES[id].cssVar})` }} />
                  {CATEGORIES[id].label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
