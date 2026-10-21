# Portfolio de Mehdi Seghier (V3)

Portfolio BTS SIO option SISR : React 19, TypeScript, Vite, React Three Fiber (3D), Motion (animations), Lenis (défilement fluide) et Tailwind CSS 4.

## Lancer en local

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173.

## Construire pour la mise en ligne

```bash
npm run build
```

Le dossier `dist/` contient le site prêt à déployer (GitHub Pages, Netlify, Vercel ou n'importe quel serveur web). Les chemins sont relatifs : le site fonctionne aussi depuis un sous-dossier.

## Où modifier le contenu

| Contenu | Fichier |
| --- | --- |
| Nom, e-mail, téléphone, liens | `src/data/site.ts` |
| Cartes des projets et catégories | `src/data/projects.ts` |
| Fiches détaillées des projets | `src/data/projectDetails.ts` |
| Compétences, parcours, résumé de la veille | `src/data/content.ts` |
| Équipements et liaisons de la topologie 3D | `src/data/topology.ts` |
| Couleurs et typographie | `src/styles/index.css` |

Les PDF, les captures et la veille complète (`veille.html`) sont dans `public/`.

## Raccourcis

- `Ctrl` + `K` (ou `/`) : palette de commandes
- Bouton en bas à gauche : terminal (`help` pour la liste des commandes)
- La 3D peut être coupée depuis la palette ou avec la commande `3d` (mode performance)
