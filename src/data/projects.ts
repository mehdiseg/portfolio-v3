export type CategoryId = 'infra' | 'secu' | 'dev' | 'stage'

// Chaque catégorie reprend une couleur de câble réseau, utilisée partout (3D, filtres, cartes)
export const CATEGORIES: Record<CategoryId, { label: string; cssVar: string }> = {
  infra: { label: 'Systèmes et réseau', cssVar: '--c-infra' },
  secu: { label: 'Sécurité', cssVar: '--c-secu' },
  dev: { label: 'Développement', cssVar: '--c-dev' },
  stage: { label: 'Stage en entreprise', cssVar: '--c-stage' },
}

export type DeviceType = 'server' | 'switch' | 'firewall' | 'board' | 'app' | 'cloud'

export interface Project {
  id: string
  title: string
  summary: string
  category: CategoryId
  filters: CategoryId[]
  kind?: string
  featured?: boolean
  stack: string[]
  device: DeviceType
  nodeLabel: string
}

export const PROJECTS: Project[] = [
  {
    id: 'noha-auto',
    title: 'Refonte réseau et serveur Raspberry Pi 5 chez Noha Auto',
    summary:
      "Refonte totale de l'infrastructure réseau du garage et mise en place d'un serveur Raspberry Pi 5 pour centraliser les fichiers clients (dossiers magasin, facturation).",
    category: 'stage',
    filters: ['stage', 'infra'],
    kind: 'Stage',
    featured: true,
    stack: ['Raspberry Pi 5', 'Samba', 'Réseau', 'Sauvegarde'],
    device: 'board',
    nodeLabel: 'Raspberry Pi 5 · Samba',
  },
  {
    id: 'ad',
    title: 'Déploiement Active Directory',
    summary: "Mise en place d'un domaine AD avec GPO, OU, gestion centralisée des utilisateurs et des postes.",
    category: 'infra',
    filters: ['infra'],
    stack: ['Windows Server', 'Active Directory', 'GPO', 'DNS/DHCP'],
    device: 'server',
    nodeLabel: 'Contrôleur de domaine',
  },
  {
    id: 'vlan',
    title: 'Segmentation réseau (VLAN)',
    summary: 'Configuration de VLAN sur switch pour séparer les flux et sécuriser le réseau interne.',
    category: 'infra',
    filters: ['infra'],
    stack: ['Cisco IOS', 'VLAN', 'Trunk 802.1Q', 'Switching'],
    device: 'switch',
    nodeLabel: 'Switch cœur · VLAN',
  },
  {
    id: 'firewall',
    title: 'Sécurisation pare-feu et accès distant',
    summary:
      "Serveur Debian personnel durci avec UFW : tout refuser en entrée, n'ouvrir que SSH, puis déployer Nginx, MariaDB et PHP-FPM.",
    category: 'secu',
    filters: ['secu', 'infra'],
    kind: 'Home-lab',
    stack: ['UFW', 'SSH', 'Nginx', 'MariaDB', 'Debian 13'],
    device: 'firewall',
    nodeLabel: 'Pare-feu · Debian',
  },
  {
    id: 'glpi',
    title: 'Gestion de parc avec GLPI',
    summary: "Installation et configuration de GLPI pour le suivi des tickets et l'inventaire du matériel.",
    category: 'infra',
    filters: ['infra'],
    stack: ['GLPI', 'Ticketing', 'Inventaire matériel'],
    device: 'server',
    nodeLabel: 'GLPI',
  },
  {
    id: 'scanner',
    title: 'Scanner réseau en PowerShell',
    summary:
      "Recensement des appareils d'un réseau local : MAC, noms, ports TCP, remarques de sécurité, rapport HTML et CSV. 36 tests automatiques.",
    category: 'secu',
    filters: ['secu', 'infra'],
    kind: 'Projet personnel',
    stack: ['PowerShell', 'ARP / ICMP', 'Ports TCP', 'Sécurité'],
    device: 'app',
    nodeLabel: 'Scanner PowerShell',
  },
  {
    id: 'outils',
    title: 'Boîte à outils réseau',
    summary: 'Calculateur VLSM, TP Wireshark, générateur WireGuard, PKI interne OpenSSL et outil Nmap, tous publics et testés.',
    category: 'infra',
    filters: ['infra', 'secu'],
    kind: 'Projet personnel',
    stack: ['Python', 'Bash', 'Wireshark', 'WireGuard', 'OpenSSL', 'Nmap'],
    device: 'switch',
    nodeLabel: 'Lab réseau',
  },
  {
    id: 'catalogue',
    title: 'Catalogue et stock pour le magasin Noha Auto',
    summary:
      'Application web multi-utilisateurs : catalogue, import Excel, alerte de stock, étiquettes à codes-barres, accès sécurisé en HTTPS.',
    category: 'dev',
    filters: ['dev'],
    kind: 'Projet personnel',
    stack: ['Node.js', 'Express', 'SQLite', 'HTTPS', 'Tailscale Funnel'],
    device: 'server',
    nodeLabel: 'Serveur catalogue',
  },
  {
    id: 'volley',
    title: 'CRM et dashboard pour Nice Volley-Ball',
    summary:
      "Développement en équipe des interfaces d'un CRM pour le club : ma partie portait sur l'interface utilisateur du dashboard.",
    category: 'dev',
    filters: ['dev'],
    kind: "Projet d'équipe",
    stack: ['PHP (Slim 4)', 'PostgreSQL', 'Docker', 'Twig'],
    device: 'app',
    nodeLabel: 'CRM · Docker',
  },
  {
    id: 'techshop',
    title: 'Refonte e-commerce TechShop',
    summary:
      "Refonte complète d'un site e-commerce : accueil, catalogue, panier, paiement, recherche et filtres, mode sombre.",
    category: 'dev',
    filters: ['dev'],
    kind: 'Projet individuel',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'localStorage'],
    device: 'app',
    nodeLabel: 'TechShop',
  },
  {
    id: 'santa',
    title: "Santa's Workshop",
    summary:
      'Outil de suivi de production de cadeaux : catégories, statuts, filtres, export et import JSON, persistance en localStorage.',
    category: 'dev',
    filters: ['dev'],
    kind: 'Projet individuel',
    stack: ['JavaScript', 'Bootstrap 5', 'localStorage', 'JSON'],
    device: 'app',
    nodeLabel: "Santa's Workshop",
  },
]

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id)
