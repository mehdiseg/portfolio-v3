import { FaGithub } from 'react-icons/fa6'
import { DOCS, PROFILE } from '../data/site'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg font-semibold">{PROFILE.name}</p>
          <p className="text-sm text-muted">BTS SIO option SISR, Iris Campus de Nice. © 2026</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>
            <a href={DOCS.veillePage} className="hover:text-fg">
              Veille complète
            </a>
          </li>
          <li>
            <a href={DOCS.synthese.href} download={DOCS.synthese.download} className="hover:text-fg">
              Tableau de synthèse
            </a>
          </li>
          <li>
            <a href="#home" className="hover:text-fg">
              Retour en haut
            </a>
          </li>
          <li>
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:text-fg"
              aria-label="Profil GitHub de Mehdi Seghier"
            >
              <FaGithub size={17} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
