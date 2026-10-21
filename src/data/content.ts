import type { CategoryId } from './projects'

export interface SkillUnit {
  id: string
  title: string
  description: string
  techs: string[]
  category: CategoryId
}

// Chaque domaine est une "unité" de la baie serveur de la section Compétences
export const SKILLS: SkillUnit[] = [
  {
    id: 'sys',
    title: 'Administration systèmes',
    description: 'Windows Server, Active Directory, GPO, gestion des droits et des utilisateurs.',
    techs: ['Windows Server', 'Active Directory', 'GPO', 'DNS / DHCP', 'Debian 13'],
    category: 'infra',
  },
  {
    id: 'net',
    title: 'Réseaux',
    description: 'Configuration de switchs et routeurs, VLAN, TCP/IP, supervision réseau.',
    techs: ['Cisco IOS', 'VLAN', 'Trunk 802.1Q', 'TCP/IP', 'VLSM'],
    category: 'infra',
  },
  {
    id: 'sec',
    title: 'Sécurité',
    description: 'Pare-feu, VPN, bonnes pratiques de sécurisation des infrastructures.',
    techs: ['UFW', 'SSH', 'WireGuard', 'OpenSSL / PKI', 'Nmap'],
    category: 'secu',
  },
  {
    id: 'virt',
    title: 'Virtualisation',
    description: 'Hyper-V, VMware, déploiement et gestion de machines virtuelles.',
    techs: ['Hyper-V', 'VMware', 'Docker'],
    category: 'infra',
  },
  {
    id: 'script',
    title: 'Scripting',
    description: "PowerShell, Bash, automatisation de tâches d'administration.",
    techs: ['PowerShell', 'Bash', 'Python'],
    category: 'dev',
  },
  {
    id: 'support',
    title: 'Support utilisateurs',
    description: "Diagnostic, résolution d'incidents, gestion de tickets avec GLPI.",
    techs: ['GLPI', 'Ticketing', 'Inventaire', 'Diagnostic'],
    category: 'infra',
  },
]

export interface Milestone {
  when: string
  title: string
  text: string
  current?: boolean
}

export const PARCOURS: Milestone[] = [
  {
    when: '2025',
    title: 'Entrée en BTS SIO option SISR',
    text: "Iris Campus, Nice. Ateliers professionnels autour de Windows Server, Active Directory, des VLAN et de GLPI.",
  },
  {
    when: '1re année',
    title: 'Stage chez Noha Auto, à Cannes',
    text: "Refonte du réseau du garage et serveur de fichiers sur Raspberry Pi 5, puis une application de catalogue et de stock pour le magasin.",
  },
  {
    when: '2026',
    title: 'Home-lab et outils réseau',
    text: "Serveur Debian durci (UFW, Nginx, MariaDB), scanner réseau en PowerShell, calculateur VLSM, PKI OpenSSL et veille sur la cryptographie post-quantique.",
  },
  {
    when: 'Aujourd’hui',
    title: "Recherche d'une alternance",
    text: 'Administrateur systèmes et réseaux, dans les Alpes-Maritimes (Nice, Sophia Antipolis, Cannes).',
    current: true,
  },
  {
    when: '2027',
    title: 'Obtention du BTS SIO SISR visée',
    text: 'Fin de la formation, avec le tableau de synthèse des réalisations professionnelles.',
  },
]

export const VEILLE = {
  subject: "L'impact de l'ordinateur quantique sur le chiffrement des données",
  updated: '21 octobre 2026',
  intro:
    "Les ordinateurs quantiques existent déjà (Google Willow, IBM Nighthawk, Quantinuum Helios, Pasqal…) et progressent vite. Une fois assez puissants, ils casseront les algorithmes asymétriques actuels (RSA, ECC) qui protègent le HTTPS, les VPN et les certificats. La cryptographie post-quantique (PQC) développe des algorithmes résistants à ces attaques.",
  why:
    "En tant que futur administrateur systèmes et réseaux, je serai amené à faire évoluer exactement ces briques : VPN, certificats X.509 et TLS.",
  points: [
    'En août 2024, le NIST a publié ML-KEM (FIPS 203), ML-DSA (FIPS 204) et SLH-DSA (FIPS 205).',
    'Le principe « Store Now, Decrypt Later » rend le risque actuel : les données interceptées aujourd’hui pourront être déchiffrées demain.',
    'Le nombre de qubits estimé pour casser RSA-2048 est passé de 20 millions (2019) à moins d’un million (2025).',
    "L'ANSSI impose l'hybridation, arrêtera de certifier les produits sans PQC à partir de 2027 et fixe 2030 comme repère pour les achats.",
  ],
  milestones: [
    { year: '2019', text: '20 millions de qubits estimés pour casser RSA-2048' },
    { year: '2024', text: 'Le NIST publie ML-KEM, ML-DSA et SLH-DSA' },
    { year: '2025', text: 'Estimation ramenée à moins d’un million de qubits' },
    { year: '2026', text: "Appel à l'action du G7, proposé par l'ANSSI", now: true },
    { year: '2027', text: "L'ANSSI ne certifie plus les produits sans PQC" },
    { year: '2029', text: 'Migration post-quantique visée par Google et Cloudflare' },
    { year: '2030', text: "Plus d'achat de produits sans support PQC" },
  ],
  news: [
    { date: '16 oct. 2026', iso: '2026-10-16', title: "L'Allemagne fixe fin 2030 pour migrer ses usages à haut risque" },
    { date: '12 oct. 2026', iso: '2026-10-12', title: 'Google Meet passe à la cryptographie post-quantique' },
    { date: '24 sept. 2026', iso: '2026-09-24', title: 'Infleqtion annonce 30 qubits logiques intriqués' },
    { date: '3 sept. 2026', iso: '2026-09-03', title: "Le G7 publie un appel à l'action proposé par l'ANSSI" },
    { date: '30 juil. 2026', iso: '2026-07-30', title: 'IBM réalise un calcul sur 70 qubits logiques' },
    { date: '22 juin 2026', iso: '2026-06-22', title: 'États-Unis : décret présidentiel EO 14412' },
  ],
}
