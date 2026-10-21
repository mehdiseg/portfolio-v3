import { BookOpen, FileDown } from 'lucide-react'
import { useInView } from 'motion/react'
import { lazy, Suspense, useMemo, useRef } from 'react'
import { useUI } from '../context/UIContext'
import { VEILLE } from '../data/content'
import { DOCS } from '../data/site'
import { cx, hasWebGL } from '../lib/utils'

const LatticeScene = lazy(() => import('../three/LatticeScene'))

function LatticeFallback() {
  const dots = []
  for (let i = -3; i <= 3; i++)
    for (let j = -3; j <= 3; j++) dots.push({ x: i * 34 + j * 9, y: j * 30 - i * 6, k: `${i}${j}` })
  return (
    <svg viewBox="-150 -130 300 260" className="h-full w-full" role="presentation">
      {dots.map((d) => (
        <circle key={d.k} cx={d.x} cy={d.y} r={3.2} fill="var(--accent)" opacity={0.8} />
      ))}
    </svg>
  )
}

export function Veille() {
  const { theme, reducedMotion, fx } = useUI()
  const canvasRef = useRef<HTMLDivElement>(null)
  const inView = useInView(canvasRef, { margin: '120px 0px' })
  const webgl = useMemo(hasWebGL, [])

  return (
    <section id="veille" className="border-y border-line bg-deep/40">
      <div className="mx-auto max-w-[1240px] px-5 py-28 md:px-8 md:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="section-title">Veille technologique</h2>
            <p className="mt-6 font-display text-[1.7rem] leading-snug font-medium md:text-[2rem]">{VEILLE.subject}</p>
            <p className="mt-5 max-w-[40rem] text-muted">{VEILLE.intro}</p>

            <ul className="mt-8 space-y-4">
              {VEILLE.points.map((p) => (
                <li key={p} className="relative max-w-[40rem] pl-6">
                  <span className="absolute top-[0.6em] left-0 h-2 w-2 rotate-45 rounded-[2px] bg-accent" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[40rem] text-muted">{VEILLE.why}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href={DOCS.veillePage} className="btn btn-primary">
                <BookOpen size={18} aria-hidden="true" /> Lire la veille complète
              </a>
              <a href={DOCS.veillePdf.href} download={DOCS.veillePdf.download} className="btn btn-ghost">
                <FileDown size={18} aria-hidden="true" /> Télécharger le PDF
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">Mise à jour le {VEILLE.updated}.</p>
          </div>

          <figure className="self-start overflow-hidden rounded-2xl border border-line bg-deep lg:col-span-5">
            <div ref={canvasRef} className="aspect-square w-full" aria-hidden="true">
              {fx && webgl ? (
                <Suspense fallback={<LatticeFallback />}>
                  <LatticeScene active={inView} theme={theme} reducedMotion={reducedMotion} />
                </Suspense>
              ) : (
                <LatticeFallback />
              )}
            </div>
            <figcaption className="border-t border-line px-5 py-4 text-sm text-muted">
              Un réseau euclidien (lattice), la structure mathématique sur laquelle reposent ML-KEM et ML-DSA. Les points
              décalés illustrent le « bruit » qui rend le problème difficile, même pour un ordinateur quantique.
              {fx && webgl && ' Faites-le tourner à la souris.'}
            </figcaption>
          </figure>
        </div>

        <div className="mt-20 space-y-16">
          <div>
            <h3 className="font-display text-2xl font-semibold">Repères</h3>
            <div className="no-scrollbar -mx-5 mt-6 overflow-x-auto px-5 md:mx-0 md:px-0" data-lenis-prevent-wheel>
              <ol className="relative grid min-w-[760px] grid-cols-7 gap-4 pt-7">
                <span className="absolute top-[0.55rem] right-0 left-0 h-px bg-line" aria-hidden="true" />
                {VEILLE.milestones.map((m) => (
                  <li key={m.year} className="relative pr-2">
                    <span
                      aria-hidden="true"
                      className={cx(
                        'absolute -top-7 left-0 h-3.5 w-3.5 rounded-full border-2 bg-ink',
                        m.now ? 'border-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_25%,transparent)]' : 'border-line',
                      )}
                    />
                    <p className={cx('font-mono text-sm', m.now ? 'text-accent' : 'text-fg')}>{m.year}</p>
                    <p className="mt-1 text-[0.85rem] leading-snug text-muted">{m.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-semibold">Dernières actualités</h3>
            <ul className="mt-6 grid border-t border-line md:grid-cols-2 md:gap-x-12">
              {VEILLE.news.map((n) => (
                <li key={n.iso} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-line py-3.5">
                  <time dateTime={n.iso} className="font-mono text-sm text-muted">
                    {n.date}
                  </time>
                  <span className="text-[0.95rem]">{n.title}</span>
                </li>
              ))}
            </ul>
            <a href={`${DOCS.veillePage}#actualites`} className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
              Les détails et les sources de chaque actualité
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
