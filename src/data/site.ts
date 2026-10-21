export const PROFILE = {
  name: 'Mehdi Seghier',
  firstName: 'Mehdi',
  lastName: 'Seghier',
  status: "En recherche d'alternance",
  headline: 'Administration systèmes et réseaux',
  pitch:
    "Étudiant en BTS SIO option SISR à l'Iris Campus de Nice, je cherche une alternance d'administrateur systèmes et réseaux dans les Alpes-Maritimes.",
  lead:
    'Curieux, rigoureux et passionné par les systèmes et la gestion de serveurs, je suis prêt à mettre mes compétences au service de votre infrastructure IT.',
  email: 'Pro.M.seghier@outlook.fr',
  formEmail: 'mehdiseghier2000@gmail.com',
  phone: '06 68 56 85 37',
  phoneHref: 'tel:+33668568537',
  location: 'Le Cannet (06), mobile sur Nice et Sophia Antipolis',
  github: 'https://github.com/mehdiseg',
} as const

export const DOCS = {
  cv: { href: 'documents/cv-mehdi-seghier.pdf', download: 'CV-Mehdi-Seghier-Alternance-ASR.pdf' },
  synthese: {
    href: 'documents/tableau-synthese-bts-sio-sisr-mehdi-seghier.pdf',
    download: 'Tableau-synthese-BTS-SIO-SISR-Mehdi-Seghier.pdf',
  },
  veillePdf: {
    href: 'documents/veille-technologique-pqc.pdf',
    download: 'Veille-Technologique-PQC-Mehdi-Seghier.pdf',
  },
  veillePage: 'veille.html',
} as const

export const NAV = [
  { id: 'parcours', label: 'Parcours' },
  { id: 'skills', label: 'Compétences' },
  { id: 'projects', label: 'Projets' },
  { id: 'veille', label: 'Veille' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof NAV)[number]['id'] | 'home'
