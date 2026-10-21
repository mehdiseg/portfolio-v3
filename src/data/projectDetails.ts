// Généré depuis la V2 (assets/js/projects-data.js) : contenu détaillé des fiches projet.
export interface ProjectImage { src: string; caption?: string }
export interface ProjectDetail {
  badge: string
  title: string
  context: string
  tags: string[]
  images: ProjectImage[]
  bodyHtml: string
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  "ad": {
    "badge": "Compétence pratiquée — Iris Campus",
    "title": "Déploiement Active Directory",
    "context": "Ateliers professionnels — Windows Server",
    "tags": [
      "Windows Server",
      "Active Directory",
      "GPO",
      "DNS/DHCP"
    ],
    "images": [],
    "bodyHtml": "<p>\nMise en place d'un domaine Active Directory : structure d'unités d'organisation (OU) par \nservice, création et gestion des comptes utilisateurs, et stratégies de groupe (GPO) pour \nhomogénéiser la configuration des postes (restrictions, déploiement de logiciels, scripts \nde connexion).\n</p>\n<h4><i class=\"fas fa-terminal\" aria-hidden=\"true\"></i> Exemples de commandes utilisées</h4>\n<p class=\"project-modal-code-label\">PowerShell — création d'un utilisateur et d'une GPO</p>\n<pre><code>New-ADOrganizationalUnit -Name \"Commercial\" -Path \"DC=noha-auto,DC=local\"\n\nNew-ADUser -Name \"J. Petit\" -SamAccountName \"jpetit\" -Path \"OU=Commercial,DC=noha-auto,DC=local\" -Enabled $true -AccountPassword (ConvertTo-SecureString \"P@ssw0rd!\" -AsPlainText -Force)\n\nNew-GPO -Name \"Restriction-PanneauConfig\" | New-GPLink -Target \"OU=Commercial,DC=noha-auto,DC=local\"</code></pre>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (recensement des \nressources, habilitations), mise à disposition d'un service informatique.</p>"
  },
  "vlan": {
    "badge": "Compétence pratiquée — Iris Campus",
    "title": "Segmentation Réseau (VLAN)",
    "context": "Ateliers professionnels — Cisco IOS",
    "tags": [
      "Cisco IOS",
      "VLAN",
      "Trunk 802.1Q",
      "Switching"
    ],
    "images": [],
    "bodyHtml": "<p>\nSegmentation d'un réseau local en plusieurs VLAN (postes, serveurs, invités) pour isoler les \nflux et limiter la surface d'attaque : un poste invité ne peut pas atteindre le VLAN serveurs, \nmême connecté au même switch physique.\n</p>\n<h4><i class=\"fas fa-terminal\" aria-hidden=\"true\"></i> Extrait de configuration</h4>\n<p class=\"project-modal-code-label\">Cisco IOS — création des VLAN et port trunk</p>\n<pre><code>Switch(config)# vlan 10\nSwitch(config-vlan)# name POSTES\nSwitch(config-vlan)# exit\nSwitch(config)# vlan 20\nSwitch(config-vlan)# name SERVEURS\nSwitch(config-vlan)# exit\n\nSwitch(config)# interface range fa0/1-12\nSwitch(config-if-range)# switchport mode access\nSwitch(config-if-range)# switchport access vlan 10\n\nSwitch(config)# interface gi0/1\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk allowed vlan 10,20</code></pre>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (continuité et \nsécurité du service), mise à disposition d'un service informatique.</p>\n<p><a href=\"https://github.com/mehdiseg/labs-reseau-cisco\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir les TP Cisco sur GitHub (labs-reseau-cisco)</a></p>"
  },
  "noha-auto": {
    "badge": "Stage — Noha Auto, Cannes",
    "title": "Refonte réseau & serveur Raspberry Pi 5",
    "context": "Stage 1ère année · dates à préciser",
    "tags": [
      "Raspberry Pi 5",
      "Samba",
      "Réseau",
      "Sauvegarde"
    ],
    "images": [],
    "bodyHtml": "<p>\nRefonte complète de l'infrastructure réseau du garage <strong>Noha Auto</strong> (Cannes), et \nmise en place d'un serveur sur <strong>Raspberry Pi 5</strong> pour centraliser le stockage des \nfichiers clients : dossiers du magasin, facturation, etc. Objectif : remplacer des fichiers \ndispersés sur les postes individuels par un partage réseau unique, accessible et sauvegardé.\n</p>\n<div class=\"project-modal-note\">\n⚠ Les captures d'écran d'origine n'ont pas été conservées pendant le stage. Les extraits \nci-dessous sont des exemples représentatifs, reconstitués pour préparer l'oral — à adapter \navec les vraies valeurs (IP, nom des dossiers) avant la présentation.\n</div>\n<h4><i class=\"fas fa-network-wired\" aria-hidden=\"true\"></i> 1. Adressage IP fixe du Raspberry Pi</h4>\n<pre><code># Sur Raspberry Pi OS (Bookworm / NetworkManager)\nsudo nmcli con mod \"Wired connection 1\" ipv4.addresses 192.168.1.50/24\nsudo nmcli con mod \"Wired connection 1\" ipv4.gateway 192.168.1.1\nsudo nmcli con mod \"Wired connection 1\" ipv4.dns \"192.168.1.1\"\nsudo nmcli con mod \"Wired connection 1\" ipv4.method manual\nsudo nmcli con up \"Wired connection 1\"</code></pre>\n<h4><i class=\"fas fa-folder-open\" aria-hidden=\"true\"></i> 2. Partage réseau Samba pour les postes Windows</h4>\n<p class=\"project-modal-code-label\">/etc/samba/smb.conf</p>\n<pre><code>[clients]\n   path = /srv/nohaauto/clients\n   comment = Dossiers clients - Noha Auto\n   valid users = @nohaauto\n   read only = no\n   browsable = yes\n   create mask = 0660\n   directory mask = 0770\n\n[facturation]\n   path = /srv/nohaauto/facturation\n   valid users = @compta\n   read only = no</code></pre>\n<pre><code>sudo apt install samba -y\nsudo groupadd nohaauto\nsudo useradd -M -G nohaauto secretariat\nsudo smbpasswd -a secretariat\nsudo systemctl enable --now smbd</code></pre>\n<h4><i class=\"fas fa-clock-rotate-left\" aria-hidden=\"true\"></i> 3. Sauvegarde automatisée</h4>\n<p class=\"project-modal-code-label\">/usr/local/bin/backup-clients.sh + crontab</p>\n<pre><code>#!/bin/bash\n# Sauvegarde quotidienne des dossiers clients vers un disque USB dédié\nSRC=\"/srv/nohaauto\"\nDEST=\"/mnt/backup-usb/$(date +%Y-%m-%d)\"\n\nmkdir -p \"$DEST\"\nrsync -a --delete \"$SRC/\" \"$DEST/\"\n\n# Purge des sauvegardes de plus de 30 jours\nfind /mnt/backup-usb -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \\;</code></pre>\n<pre><code># crontab -e (exécution chaque nuit à 2h)\n0 2 * * * /usr/local/bin/backup-clients.sh >> /var/log/backup-clients.log 2>&1</code></pre>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (sauvegardes, \ncontinuité de service), travailler en mode projet (refonte planifiée), mise à disposition d'un \nservice informatique aux utilisateurs du magasin.</p>"
  },
  "firewall": {
    "badge": "Home-lab personnel",
    "title": "Sécurisation Pare-feu / VPN",
    "context": "Serveur Debian personnel — août 2026",
    "tags": [
      "UFW",
      "SSH",
      "Nginx",
      "MariaDB",
      "Debian 13"
    ],
    "images": [
      {
        "src": "assets/img/projects/homelab-01-ssh.png",
        "caption": "Connexion SSH à la machine Debian et passage en root"
      },
      {
        "src": "assets/img/projects/homelab-02-lemp.png",
        "caption": "Installation de la pile Nginx + MariaDB + PHP-FPM"
      },
      {
        "src": "assets/img/projects/homelab-03-ufw.png",
        "caption": "Pare-feu UFW : tout bloquer en entrée, autoriser uniquement le SSH"
      }
    ],
    "bodyHtml": "<p>\nSur un serveur Debian personnel (home-lab), durcissement de la sécurité réseau avec \n<strong>UFW</strong> (Uncomplicated Firewall) : politique par défaut « tout refuser en entrée », \npuis ouverture explicite du seul port nécessaire (SSH), avant déploiement d'une pile applicative \n(Nginx, MariaDB, PHP-FPM).\n</p>\n<h4><i class=\"fas fa-terminal\" aria-hidden=\"true\"></i> Commandes clés</h4>\n<pre><code>sudo apt install ufw -y\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow ssh\nsudo ufw enable\nsudo ufw status verbose</code></pre>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (respect des \nrègles de sécurité), mise à disposition d'un service informatique.</p>\n<p><a href=\"https://github.com/mehdiseg/serveur-debian-lemp-securise\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir la documentation sur GitHub (serveur-debian-lemp-securise)</a></p>"
  },
  "glpi": {
    "badge": "Compétence pratiquée — illustration générée",
    "title": "Gestion de Parc (GLPI)",
    "context": "Iris Campus / La Plateforme",
    "tags": [
      "GLPI",
      "Ticketing",
      "Inventaire matériel"
    ],
    "images": [
      {
        "src": "assets/img/projects/glpi-tickets.png",
        "caption": "Illustration : vue de la liste des tickets GLPI (interface reconstituée, données fictives)"
      }
    ],
    "bodyHtml": "<p>\nInstallation et configuration de <strong>GLPI</strong> pour centraliser le suivi des demandes \nd'assistance (tickets) et l'inventaire du matériel informatique : postes, imprimantes, \npériphériques réseau.\n</p>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (inventaire, \nhabilitations), réponse aux incidents et aux demandes d'assistance, mise à disposition d'un \nservice informatique.</p>"
  },
  "volley": {
    "badge": "Projet d'équipe — Nice Volley-Ball",
    "title": "CRM / Dashboard — Nice Volley-Ball",
    "context": "Développement en binôme — 15 au 19 juin 2026",
    "tags": [
      "PHP (Slim 4)",
      "PostgreSQL",
      "Docker",
      "Twig",
      "API Brevo / Weezevent"
    ],
    "images": [
      {
        "src": "assets/img/projects/crm-volley-dashboard.png",
        "caption": "Illustration : tableau de bord (mêmes composants et couleurs que le vrai projet, données fictives)"
      }
    ],
    "bodyHtml": "<p>\nCRM développé en équipe pour le club <strong>Nice Volley-Ball</strong> : centralisation des \ncontacts, gestion des événements, synchronisation avec les API externes \n<strong>Weezevent</strong> (billetterie) et <strong>Brevo</strong> (emailing), et tableau de \nbord de statistiques (fréquentation, répartition invitations/ventes).\n</p>\n<p>\nMa partie portait sur le <strong>développement des interfaces</strong> (dashboard, gestion des \ncontacts) en Tailwind CSS / Twig, en équipe.\n</p>\n<h4><i class=\"fas fa-layer-group\" aria-hidden=\"true\"></i> Stack technique</h4>\n<ul>\n<li><strong>Backend :</strong> PHP 8 / Slim 4, architecture Modèle–Repository–Route (PSR-4)</li>\n<li><strong>Base de données :</strong> PostgreSQL, requêtes préparées (protection injection SQL)</li>\n<li><strong>Frontend :</strong> Twig, Tailwind CSS, Vite</li>\n<li><strong>Infrastructure :</strong> Docker Compose (PHP, Nginx, PostgreSQL, Adminer)</li>\n<li><strong>Intégrations :</strong> API Weezevent (billetterie), API Brevo (emailing)</li>\n</ul>\n<h4><i class=\"fas fa-code\" aria-hidden=\"true\"></i> Extrait réel du code (Repository des contacts)</h4>\n<pre><code>final class ContactRepository\n{\n    private PDO $db;\n\n    public function __construct()\n    {\n        $this->db = \\Database::getConnection();\n    }\n\n    /** @return Contact[] */\n    public function findAll(int $limit = 100, int $offset = 0, ?string $search = null): array\n    {\n        $sql = \"SELECT * FROM contact\";\n        $params = [];\n\n        if ($search) {\n            $sql .= \" WHERE nom ILIKE :search OR prenom ILIKE :search\n                      OR email ILIKE :search OR phone ILIKE :search\";\n            $params['search'] = '%' . $search . '%';\n        }\n\n        $sql .= \" ORDER BY date_creation DESC LIMIT :limit OFFSET :offset\";\n        // ... requête préparée, protégée contre les injections SQL\n    }\n}</code></pre>\n<p><strong>Compétences mobilisées :</strong> travailler en mode projet (équipe, répartition des \ntâches), mise à disposition d'un service informatique.</p>\n<p><a href=\"https://github.com/HaGotHem/CRM-Club-Volley\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir le dépôt de l'équipe sur GitHub</a> \n<span style=\"opacity:.7;\">(compte de mon coéquipier, dépôt partagé)</span></p>"
  },
  "techshop": {
    "badge": "Projet individuel — 10 déc. 2025 au 7 janv. 2026",
    "title": "Refonte e-commerce — TechShop",
    "context": "Formation Iris Campus — projet de 3 jours",
    "tags": [
      "HTML5",
      "CSS3",
      "JavaScript vanilla",
      "localStorage",
      "Responsive"
    ],
    "images": [
      {
        "src": "assets/img/projects/techshop-home.png",
        "caption": "Page d'accueil : slider hero, navigation, panier"
      },
      {
        "src": "assets/img/projects/techshop-produits.png",
        "caption": "Catalogue : recherche en temps réel, tri, filtres par catégorie"
      }
    ],
    "bodyHtml": "<p>\nRefonte complète du site e-commerce fictif <strong>TechShop</strong> : interface obsolète \ntransformée en expérience moderne, responsive mobile-first, avec panier fonctionnel, page de \npaiement complète, recherche en temps réel, mode sombre, liste de souhaits et système de coupons.\n</p>\n<h4><i class=\"fas fa-layer-group\" aria-hidden=\"true\"></i> Fonctionnalités principales</h4>\n<ul>\n<li>Panier persistant (localStorage), modification des quantités, calcul automatique du total</li>\n<li>Page de paiement avec validation complète des champs et codes promo</li>\n<li>Recherche en temps réel, tri (prix, nom) et filtres par catégorie</li>\n<li>Mode sombre avec persistance de la préférence</li>\n<li>Design mobile-first, responsive sur mobile / tablette / desktop</li>\n</ul>\n<p><strong>Compétences mobilisées :</strong> développer la présence en ligne de l'organisation \n(refonte d'un site exploitant les données de l'organisation), travailler en mode projet \n(planning en 3 jours : analyse, développement, interactivité), mise à disposition d'un service \ninformatique.</p>\n<p><a href=\"https://github.com/mehdiseg/techshop\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir le code sur GitHub</a></p>"
  },
  "santa": {
    "badge": "Projet individuel — 17 décembre 2025",
    "title": "Santa's Workshop",
    "context": "Outil de gestion de production de cadeaux",
    "tags": [
      "JavaScript vanilla",
      "Bootstrap 5",
      "localStorage",
      "Export/Import JSON"
    ],
    "images": [
      {
        "src": "assets/img/projects/pere-noel.png",
        "caption": "Interface : formulaire d'ajout, filtres et suivi des statuts par cadeau"
      }
    ],
    "bodyHtml": "<p>\nPetit outil de suivi de production de cadeaux, sur le thème de Noël : ajout d'un cadeau \n(nom, catégorie, statut, destinataire), filtres par catégorie et par statut (à fabriquer / en \ncours / livré), barre de progression, et export/import des données au format JSON.\n</p>\n<p><strong>Compétences mobilisées :</strong> mise à disposition d'un service informatique \n(outil fonctionnel et déployé).</p>\n<p><a href=\"https://github.com/mehdiseg/santas-workshop\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir le code sur GitHub</a></p>"
  },
  "scanner": {
    "badge": "Projet personnel — testé",
    "title": "Scanner réseau en PowerShell",
    "context": "Outil d'audit du réseau local — septembre 2026",
    "tags": [
      "PowerShell",
      "Réseau",
      "ARP / ICMP",
      "Ports TCP",
      "Sécurité"
    ],
    "images": [],
    "bodyHtml": "<p>\nModule PowerShell sans dépendance qui <strong>recense les appareils d'un réseau local</strong> : \ndécouverte par ping en parallèle complétée par la table ARP (pour retrouver aussi les appareils qui \nne répondent pas au ping), adresse MAC, nom d'hôte, test de ports TCP courants ou choisis, puis \nrapport HTML et CSV.\n</p>\n<h4><i class=\"fas fa-layer-group\" aria-hidden=\"true\"></i> Points de conception</h4>\n<ul>\n<li><strong>Garde-fous :</strong> les adresses publiques et les réseaux de plus de 1024 adresses sont \nrefusés par défaut (options explicites pour les autoriser).</li>\n<li><strong>Remarques de sécurité :</strong> Telnet et FTP (non chiffrés), SMB, RDP et VNC signalés.</li>\n<li><strong>Tests :</strong> 36 vérifications automatiques (analyse des ports et plages, calcul des \nadresses, refus des réseaux dangereux).</li>\n</ul>\n<p class=\"project-modal-code-label\">PowerShell — exemples</p>\n<pre><code>.\\Scan-Reseau.ps1\n.\\Scan-Reseau.ps1 -Reseau 192.168.1.0/24 -Ports 22,80,443,8000-8010 -Sortie .\\rapports\n.\\Scan-Reseau.ps1 -Reseau 192.168.1.0/24 -SansPorts</code></pre>\n<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (recensement des \néquipements), assurer la cybersécurité (repérage des services exposés), scripting.</p>\n<p><a href=\"https://github.com/mehdiseg/scanner-reseau-powershell\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> Voir le code sur GitHub</a></p>"
  },
  "catalogue": {
    "badge": "Projet personnel — magasin Noha Auto",
    "title": "Application de catalogue et de stock — Noha Auto",
    "context": "Serveur web multi-utilisateurs — septembre 2026",
    "tags": [
      "Node.js",
      "Express",
      "SQLite",
      "HTTPS",
      "Tailscale Funnel",
      "Codes-barres"
    ],
    "images": [
      {
        "src": "assets/img/projects/noha-catalogue-mobile.png",
        "caption": "Catalogue sur téléphone (données de démonstration)"
      },
      {
        "src": "assets/img/projects/noha-catalogue-ordinateur.png",
        "caption": "Catalogue sur ordinateur (données de démonstration)"
      }
    ],
    "bodyHtml": "<p>\nApplication web pour gérer le catalogue d'articles d'un magasin de pièces auto : recherche, ajout à la \nmain ou <strong>import Excel</strong>, stock avec alerte « à commander » (seuil réglable par article), \net <strong>étiquettes à codes-barres</strong> pour une douchette USB.\n</p>\n<div class=\"project-modal-note\">\nProjet conçu à partir des besoins du magasin, <strong>avec l'aide de l'assistant IA Claude</strong> \npour l'écriture du code. Il fonctionne sur mon PC, joignable par HTTPS ; l'installation définitive \net le démarrage automatique du serveur sont en cours de validation.\n</div>\n<h4><i class=\"fas fa-shield-alt\" aria-hidden=\"true\"></i> Sécurité (le serveur est joignable depuis internet)</h4>\n<ul>\n<li>Comptes avec identifiant et mot de passe (hachage scrypt), rôles administrateur et employé : \nl'employé ne voit pas les prix d'achat, y compris dans les réponses du serveur.</li>\n<li>Sessions par cookie <code>HttpOnly</code>/<code>Secure</code>, protection CSRF, en-têtes de sécurité \n(CSP stricte), blocage temporaire après 8 échecs de connexion.</li>\n<li>Le serveur n'écoute qu'en local (<code>127.0.0.1</code>) ; c'est <strong>Tailscale Funnel</strong> qui \nle publie en HTTPS, sans redirection de port sur la box.</li>\n<li>Journal d'activité, sauvegardes quotidiennes de la base, 10 scénarios de test de bout en bout.</li>\n</ul>\n<p><strong>Compétences mobilisées :</strong> mise à disposition d'un service informatique, gestion du \npatrimoine informatique (catalogue, stock), assurer la cybersécurité d'un service.</p>\n<p>Le dépôt GitHub est <strong>privé</strong> (il décrit le fonctionnement interne d'un serveur exposé) : \nle code peut être présenté sur demande. Le retour d'expérience sur la publication en HTTPS est public : \n<a href=\"https://github.com/mehdiseg/tailscale-funnel-serveur-maison\" target=\"_blank\" rel=\"noopener noreferrer\">\n<i class=\"fab fa-github\" aria-hidden=\"true\"></i> tailscale-funnel-serveur-maison</a>.</p>"
  },
  "outils": {
    "badge": "Projets personnels — testés",
    "title": "Boîte à outils réseau (Python, Bash)",
    "context": "Cinq petits outils publics, avec tests automatiques — septembre 2026",
    "tags": [
      "Python",
      "Bash",
      "Wireshark",
      "WireGuard",
      "OpenSSL",
      "Nmap"
    ],
    "images": [],
    "bodyHtml": "<p>\nDes outils pour s'entraîner et travailler proprement. Chacun a des tests, exécutés aussi à chaque \n<code>push</code> par GitHub Actions.\n</p>\n<ul>\n<li><a href=\"https://github.com/mehdiseg/calculateur-sous-reseaux\" target=\"_blank\" rel=\"noopener noreferrer\">\ncalculateur-sous-reseaux</a> : informations d'un réseau, découpage et <strong>VLSM</strong> (14 tests).</li>\n<li><a href=\"https://github.com/mehdiseg/tp-wireshark-analyse-trafic\" target=\"_blank\" rel=\"noopener noreferrer\">\ntp-wireshark-analyse-trafic</a> : capture synthétique et 18 exercices de filtres, chaque réponse vérifiée avec \n<code>tshark</code>.</li>\n<li><a href=\"https://github.com/mehdiseg/wireguard-generateur-config\" target=\"_blank\" rel=\"noopener noreferrer\">\nwireguard-generateur-config</a> : configuration <strong>WireGuard</strong> serveur + clients, clés vérifiées avec \n<code>wg</code> (16 tests).</li>\n<li><a href=\"https://github.com/mehdiseg/pki-interne-openssl\" target=\"_blank\" rel=\"noopener noreferrer\">\npki-interne-openssl</a> : autorité de certification interne et certificats avec SAN, testée jusqu'à une vraie \nconnexion TLS.</li>\n<li><a href=\"https://github.com/mehdiseg/nmap-audit-reseau-local\" target=\"_blank\" rel=\"noopener noreferrer\">\nnmap-audit-reseau-local</a> : mémo <strong>Nmap</strong> et outil de comparaison de scans (16 tests).</li>\n</ul>\n<p>\nD'autres guides (labs Cisco, pfSense, Zabbix, Suricata...) sont préparés mais <strong>pas encore réalisés</strong> : \nils sont listés, avec leur statut, dans la \n<a href=\"https://github.com/mehdiseg/roadmap-reseau-bts-sio\" target=\"_blank\" rel=\"noopener noreferrer\">feuille de route</a>.\n</p>\n<p><strong>Compétences mobilisées :</strong> assurer la cybersécurité, gestion du patrimoine informatique, \nscripting et tests automatisés.</p>"
  }
}
