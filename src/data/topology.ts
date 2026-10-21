import { PROJECTS, type CategoryId, type DeviceType } from './projects'

export interface TopoNode {
  id: string
  label: string
  device: DeviceType
  category: CategoryId | 'core'
  position: [number, number, number]
  projectId?: string
}

// Positions choisies à la main pour une composition lisible (unités de la scène 3D)
const POSITIONS: Record<string, [number, number, number]> = {
  internet: [0, 2.75, -1.4],
  firewall: [0, 1.55, -0.5],
  vlan: [0, 0.25, 0.1],
  ad: [-2.3, 0.75, 0.7],
  glpi: [-2.75, -0.75, -0.5],
  'noha-auto': [2.35, 0.8, 0.5],
  catalogue: [2.8, -0.7, -0.55],
  outils: [0.15, -1.35, 1.15],
  scanner: [-1.45, -2.35, 1.5],
  volley: [-0.35, -2.75, 0.15],
  techshop: [1.05, -2.6, 1.95],
  santa: [1.85, -2.05, 0.75],
}

export const TOPO_NODES: TopoNode[] = [
  { id: 'internet', label: 'Internet', device: 'cloud', category: 'core', position: POSITIONS.internet },
  ...PROJECTS.map((p) => ({
    id: p.id,
    label: p.nodeLabel,
    device: p.device,
    category: p.category,
    position: POSITIONS[p.id],
    projectId: p.id,
  })),
]

export const TOPO_LINKS: [string, string][] = [
  ['internet', 'firewall'],
  ['firewall', 'vlan'],
  ['vlan', 'ad'],
  ['vlan', 'glpi'],
  ['vlan', 'noha-auto'],
  ['vlan', 'catalogue'],
  ['vlan', 'outils'],
  ['ad', 'glpi'],
  ['noha-auto', 'catalogue'],
  ['outils', 'scanner'],
  ['outils', 'volley'],
  ['outils', 'techshop'],
  ['outils', 'santa'],
]
