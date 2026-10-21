import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { PARCOURS } from '../data/content'
import { cx } from '../lib/utils'

export function Parcours() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section id="parcours" className="mx-auto max-w-[1240px] px-5 py-28 md:px-8 md:py-36">
      <div className="grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="section-title">Parcours</h2>
          <p className="lede mt-5">
            De l'entrée en BTS à la recherche d'alternance : les étapes qui ont construit mes compétences en
            administration systèmes et réseaux.
          </p>
        </div>

        <ol ref={listRef} className="relative pl-10">
          <div className="timeline-rail" aria-hidden="true">
            <motion.div className="timeline-fill" style={{ scaleY: fill }} />
          </div>
          {PARCOURS.map((step) => (
            <li key={step.title} className="relative pb-12 last:pb-0">
              <span
                aria-hidden="true"
                className={cx(
                  'absolute top-1.5 -left-10 h-4 w-4 rounded-full border-2 bg-ink',
                  step.current ? 'border-dev' : 'border-line',
                )}
              >
                {step.current && <span className="status-dot absolute inset-[3px] !h-auto !w-auto" />}
              </span>
              <p className={cx('font-mono text-sm', step.current ? 'text-dev' : 'text-muted')}>{step.when}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold md:text-[1.7rem]">{step.title}</h3>
              <p className="mt-2 max-w-[34rem] text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
