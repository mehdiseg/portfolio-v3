import { Check, Copy, MapPin, Phone, Send } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { useState, type FormEvent } from 'react'
import { useUI } from '../context/UIContext'
import { PROFILE } from '../data/site'

export function Contact() {
  const { toast } = useUI()
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState('')

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      toast('Adresse e-mail copiée')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${PROFILE.email}`
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()
    const body = `Nom : ${get('name')}\nEmail : ${get('email')}\n\n${get('message')}`
    window.location.href = `mailto:${PROFILE.formEmail}?subject=${encodeURIComponent(get('subject'))}&body=${encodeURIComponent(body)}`
    setHint("Votre messagerie s'ouvre avec le message prérempli : il ne reste qu'à l'envoyer.")
  }

  const field =
    'mt-2 w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent'

  return (
    <section id="contact" className="mx-auto max-w-[1240px] px-5 py-28 md:px-8 md:py-36">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <h2 className="section-title">Contact</h2>
          <p className="mt-6 max-w-[30rem] font-display text-[1.9rem] leading-tight font-medium md:text-[2.4rem]">
            Une alternance en administration systèmes et réseaux&nbsp;? Parlons-en.
          </p>

          <div className="mt-10">
            <p className="text-sm text-muted">E-mail</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <a href={`mailto:${PROFILE.email}`} className="font-display text-2xl font-medium break-all hover:text-accent md:text-3xl">
                {PROFILE.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:text-fg"
              >
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                {copied ? 'Copiée' : 'Copier'}
              </button>
            </div>
          </div>

          <ul className="mt-8 space-y-3 text-[1.02rem]">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-muted" aria-hidden="true" />
              <a href={PROFILE.phoneHref} className="hover:text-accent">
                {PROFILE.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-muted" aria-hidden="true" />
              {PROFILE.location}
            </li>
            <li className="flex items-center gap-3">
              <FaGithub size={18} className="text-muted" aria-hidden="true" />
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                github.com/mehdiseg
              </a>
            </li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-deep p-6 md:p-8 lg:col-span-6" aria-describedby="form-hint">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              Nom
              <input name="name" autoComplete="name" required className={field} />
            </label>
            <label className="block text-sm text-muted">
              Votre e-mail
              <input name="email" type="email" autoComplete="email" required className={field} />
            </label>
          </div>
          <label className="mt-5 block text-sm text-muted">
            Sujet
            <input name="subject" required className={field} />
          </label>
          <label className="mt-5 block text-sm text-muted">
            Message
            <textarea name="message" rows={5} required className={`${field} resize-y`} />
          </label>
          <button type="submit" className="btn btn-primary mt-6">
            <Send size={17} aria-hidden="true" /> Envoyer avec ma messagerie
          </button>
          <p id="form-hint" role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm text-muted">
            {hint}
          </p>
        </form>
      </div>
    </section>
  )
}
