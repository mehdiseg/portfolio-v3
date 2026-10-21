import { SKILLS } from '../data/content'
import { CATEGORIES } from '../data/projects'

export function Skills() {
  return (
    <section id="skills" className="border-y border-line bg-deep/40">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-28 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-16 md:px-8 md:py-36">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="section-title">Compétences</h2>
          <p className="lede mt-5">
            Six domaines, rangés comme les unités d'une baie serveur. La couleur du voyant indique la famille de
            compétences, la même que pour les projets.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            {(['infra', 'secu', 'dev'] as const).map((id) => (
              <li key={id} className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: `var(${CATEGORIES[id].cssVar})` }} />
                {CATEGORIES[id].label}
              </li>
            ))}
          </ul>
        </div>

        <div className="rack" role="list" aria-label="Domaines de compétences">
          {SKILLS.map((unit, i) => (
            <article
              key={unit.id}
              role="listitem"
              tabIndex={0}
              className="rack-unit"
              style={{ ['--unit-color' as string]: `var(${CATEGORIES[unit.category].cssVar})` }}
              aria-label={`${unit.title} : ${unit.description}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="rack-led" aria-hidden="true" />
                <span className="font-mono text-[0.7rem] text-muted" aria-hidden="true">
                  U{i + 1}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold md:text-[1.4rem]">{unit.title}</h3>
                <p className="mt-0.5 text-[0.95rem] text-muted">{unit.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {unit.techs.map((t) => (
                    <li key={t} className="rounded-md border border-line bg-ink/60 px-2 py-0.5 text-[0.8rem] text-fg">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rack-vents hidden sm:grid" aria-hidden="true">
                {Array.from({ length: 6 }, (_, k) => (
                  <span key={k} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
