/* =========================================================
   Détail des projets + logique de la modale (index.html)
   ========================================================= */

(function () {
    'use strict';

    const IMG = 'assets/img/projects/';

    // Notes de transparence : les visuels marqués "illustration générée"
    // sont des reconstitutions (mêmes couleurs / mêmes écrans que le vrai
    // projet quand la source est connue) et non des captures d'écran
    // d'origine. Les 3 photos du home-lab sont de vraies captures.
    const PROJECTS = {
        ad: {
            badge: 'Compétence pratiquée — Iris Campus',
            title: 'Déploiement Active Directory',
            context: 'Ateliers professionnels — Windows Server',
            tags: ['Windows Server', 'Active Directory', 'GPO', 'DNS/DHCP'],
            images: [],
            bodyHtml: [
                '<p>',
                'Mise en place d\'un domaine Active Directory : structure d\'unités d\'organisation (OU) par ',
                'service, création et gestion des comptes utilisateurs, et stratégies de groupe (GPO) pour ',
                'homogénéiser la configuration des postes (restrictions, déploiement de logiciels, scripts ',
                'de connexion).',
                '</p>',
                '<h4><i class="fas fa-terminal" aria-hidden="true"></i> Exemples de commandes utilisées</h4>',
                '<p class="project-modal-code-label">PowerShell — création d\'un utilisateur et d\'une GPO</p>',
                '<pre><code>New-ADOrganizationalUnit -Name "Commercial" -Path "DC=noha-auto,DC=local"\n\n' +
                'New-ADUser -Name "J. Petit" -SamAccountName "jpetit" -Path "OU=Commercial,DC=noha-auto,DC=local" -Enabled $true -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force)\n\n' +
                'New-GPO -Name "Restriction-PanneauConfig" | New-GPLink -Target "OU=Commercial,DC=noha-auto,DC=local"</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (recensement des ',
                'ressources, habilitations), mise à disposition d\'un service informatique.</p>'
            ].join('\n')
        },

        vlan: {
            badge: 'Compétence pratiquée — Iris Campus',
            title: 'Segmentation Réseau (VLAN)',
            context: 'Ateliers professionnels — Cisco IOS',
            tags: ['Cisco IOS', 'VLAN', 'Trunk 802.1Q', 'Switching'],
            images: [],
            bodyHtml: [
                '<p>',
                'Segmentation d\'un réseau local en plusieurs VLAN (postes, serveurs, invités) pour isoler les ',
                'flux et limiter la surface d\'attaque : un poste invité ne peut pas atteindre le VLAN serveurs, ',
                'même connecté au même switch physique.',
                '</p>',
                '<h4><i class="fas fa-terminal" aria-hidden="true"></i> Extrait de configuration</h4>',
                '<p class="project-modal-code-label">Cisco IOS — création des VLAN et port trunk</p>',
                '<pre><code>Switch(config)# vlan 10\n' +
                'Switch(config-vlan)# name POSTES\n' +
                'Switch(config-vlan)# exit\n' +
                'Switch(config)# vlan 20\n' +
                'Switch(config-vlan)# name SERVEURS\n' +
                'Switch(config-vlan)# exit\n\n' +
                'Switch(config)# interface range fa0/1-12\n' +
                'Switch(config-if-range)# switchport mode access\n' +
                'Switch(config-if-range)# switchport access vlan 10\n\n' +
                'Switch(config)# interface gi0/1\n' +
                'Switch(config-if)# switchport mode trunk\n' +
                'Switch(config-if)# switchport trunk allowed vlan 10,20</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (continuité et ',
                'sécurité du service), mise à disposition d\'un service informatique.</p>',
                '<p><a href="https://github.com/mehdiseg/labs-reseau-cisco" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir les TP Cisco sur GitHub (labs-reseau-cisco)</a></p>'
            ].join('\n')
        },

        'noha-auto': {
            badge: 'Stage — Noha Auto, Cannes',
            title: 'Refonte réseau & serveur Raspberry Pi 5',
            context: 'Stage 1ère année · dates à préciser',
            tags: ['Raspberry Pi 5', 'Samba', 'Réseau', 'Sauvegarde'],
            images: [],
            bodyHtml: [
                '<p>',
                'Refonte complète de l\'infrastructure réseau du garage <strong>Noha Auto</strong> (Cannes), et ',
                'mise en place d\'un serveur sur <strong>Raspberry Pi 5</strong> pour centraliser le stockage des ',
                'fichiers clients : dossiers du magasin, facturation, etc. Objectif : remplacer des fichiers ',
                'dispersés sur les postes individuels par un partage réseau unique, accessible et sauvegardé.',
                '</p>',
                '<div class="project-modal-note">',
                '⚠ Les captures d\'écran d\'origine n\'ont pas été conservées pendant le stage. Les extraits ',
                'ci-dessous sont des exemples représentatifs, reconstitués pour préparer l\'oral — à adapter ',
                'avec les vraies valeurs (IP, nom des dossiers) avant la présentation.',
                '</div>',
                '<h4><i class="fas fa-network-wired" aria-hidden="true"></i> 1. Adressage IP fixe du Raspberry Pi</h4>',
                '<pre><code># Sur Raspberry Pi OS (Bookworm / NetworkManager)\n' +
                'sudo nmcli con mod "Wired connection 1" ipv4.addresses 192.168.1.50/24\n' +
                'sudo nmcli con mod "Wired connection 1" ipv4.gateway 192.168.1.1\n' +
                'sudo nmcli con mod "Wired connection 1" ipv4.dns "192.168.1.1"\n' +
                'sudo nmcli con mod "Wired connection 1" ipv4.method manual\n' +
                'sudo nmcli con up "Wired connection 1"</code></pre>',
                '<h4><i class="fas fa-folder-open" aria-hidden="true"></i> 2. Partage réseau Samba pour les postes Windows</h4>',
                '<p class="project-modal-code-label">/etc/samba/smb.conf</p>',
                '<pre><code>[clients]\n' +
                '   path = /srv/nohaauto/clients\n' +
                '   comment = Dossiers clients - Noha Auto\n' +
                '   valid users = @nohaauto\n' +
                '   read only = no\n' +
                '   browsable = yes\n' +
                '   create mask = 0660\n' +
                '   directory mask = 0770\n\n' +
                '[facturation]\n' +
                '   path = /srv/nohaauto/facturation\n' +
                '   valid users = @compta\n' +
                '   read only = no</code></pre>',
                '<pre><code>sudo apt install samba -y\n' +
                'sudo groupadd nohaauto\n' +
                'sudo useradd -M -G nohaauto secretariat\n' +
                'sudo smbpasswd -a secretariat\n' +
                'sudo systemctl enable --now smbd</code></pre>',
                '<h4><i class="fas fa-clock-rotate-left" aria-hidden="true"></i> 3. Sauvegarde automatisée</h4>',
                '<p class="project-modal-code-label">/usr/local/bin/backup-clients.sh + crontab</p>',
                '<pre><code>#!/bin/bash\n' +
                '# Sauvegarde quotidienne des dossiers clients vers un disque USB dédié\n' +
                'SRC="/srv/nohaauto"\n' +
                'DEST="/mnt/backup-usb/$(date +%Y-%m-%d)"\n\n' +
                'mkdir -p "$DEST"\n' +
                'rsync -a --delete "$SRC/" "$DEST/"\n\n' +
                '# Purge des sauvegardes de plus de 30 jours\n' +
                'find /mnt/backup-usb -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \\;</code></pre>',
                '<pre><code># crontab -e (exécution chaque nuit à 2h)\n' +
                '0 2 * * * /usr/local/bin/backup-clients.sh >> /var/log/backup-clients.log 2>&1</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (sauvegardes, ',
                'continuité de service), travailler en mode projet (refonte planifiée), mise à disposition d\'un ',
                'service informatique aux utilisateurs du magasin.</p>'
            ].join('\n')
        },

        firewall: {
            badge: 'Home-lab personnel',
            title: 'Sécurisation Pare-feu / VPN',
            context: 'Serveur Debian personnel — août 2026',
            tags: ['UFW', 'SSH', 'Nginx', 'MariaDB', 'Debian 13'],
            images: [
                { src: IMG + 'homelab-01-ssh.png', caption: 'Connexion SSH à la machine Debian et passage en root' },
                { src: IMG + 'homelab-02-lemp.png', caption: 'Installation de la pile Nginx + MariaDB + PHP-FPM' },
                { src: IMG + 'homelab-03-ufw.png', caption: 'Pare-feu UFW : tout bloquer en entrée, autoriser uniquement le SSH' }
            ],
            bodyHtml: [
                '<p>',
                'Sur un serveur Debian personnel (home-lab), durcissement de la sécurité réseau avec ',
                '<strong>UFW</strong> (Uncomplicated Firewall) : politique par défaut « tout refuser en entrée », ',
                'puis ouverture explicite du seul port nécessaire (SSH), avant déploiement d\'une pile applicative ',
                '(Nginx, MariaDB, PHP-FPM).',
                '</p>',
                '<h4><i class="fas fa-terminal" aria-hidden="true"></i> Commandes clés</h4>',
                '<pre><code>sudo apt install ufw -y\n' +
                'sudo ufw default deny incoming\n' +
                'sudo ufw default allow outgoing\n' +
                'sudo ufw allow ssh\n' +
                'sudo ufw enable\n' +
                'sudo ufw status verbose</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (respect des ',
                'règles de sécurité), mise à disposition d\'un service informatique.</p>',
                '<p><a href="https://github.com/mehdiseg/serveur-debian-lemp-securise" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir la documentation sur GitHub (serveur-debian-lemp-securise)</a></p>'
            ].join('\n')
        },

        glpi: {
            badge: 'Compétence pratiquée — illustration générée',
            title: 'Gestion de Parc (GLPI)',
            context: 'Iris Campus / La Plateforme',
            tags: ['GLPI', 'Ticketing', 'Inventaire matériel'],
            images: [
                { src: IMG + 'glpi-tickets.png', caption: 'Illustration : vue de la liste des tickets GLPI (interface reconstituée, données fictives)' }
            ],
            bodyHtml: [
                '<p>',
                'Installation et configuration de <strong>GLPI</strong> pour centraliser le suivi des demandes ',
                'd\'assistance (tickets) et l\'inventaire du matériel informatique : postes, imprimantes, ',
                'périphériques réseau.',
                '</p>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (inventaire, ',
                'habilitations), réponse aux incidents et aux demandes d\'assistance, mise à disposition d\'un ',
                'service informatique.</p>'
            ].join('\n')
        },

        volley: {
            badge: 'Projet d\'équipe — Nice Volley-Ball',
            title: 'CRM / Dashboard — Nice Volley-Ball',
            context: 'Développement en binôme — 15 au 19 juin 2026',
            tags: ['PHP (Slim 4)', 'PostgreSQL', 'Docker', 'Twig', 'API Brevo / Weezevent'],
            images: [
                { src: IMG + 'crm-volley-dashboard.png', caption: 'Illustration : tableau de bord (mêmes composants et couleurs que le vrai projet, données fictives)' }
            ],
            bodyHtml: [
                '<p>',
                'CRM développé en équipe pour le club <strong>Nice Volley-Ball</strong> : centralisation des ',
                'contacts, gestion des événements, synchronisation avec les API externes ',
                '<strong>Weezevent</strong> (billetterie) et <strong>Brevo</strong> (emailing), et tableau de ',
                'bord de statistiques (fréquentation, répartition invitations/ventes).',
                '</p>',
                '<p>',
                'Ma partie portait sur le <strong>développement des interfaces</strong> (dashboard, gestion des ',
                'contacts) en Tailwind CSS / Twig, en équipe.',
                '</p>',
                '<h4><i class="fas fa-layer-group" aria-hidden="true"></i> Stack technique</h4>',
                '<ul>',
                '<li><strong>Backend :</strong> PHP 8 / Slim 4, architecture Modèle–Repository–Route (PSR-4)</li>',
                '<li><strong>Base de données :</strong> PostgreSQL, requêtes préparées (protection injection SQL)</li>',
                '<li><strong>Frontend :</strong> Twig, Tailwind CSS, Vite</li>',
                '<li><strong>Infrastructure :</strong> Docker Compose (PHP, Nginx, PostgreSQL, Adminer)</li>',
                '<li><strong>Intégrations :</strong> API Weezevent (billetterie), API Brevo (emailing)</li>',
                '</ul>',
                '<h4><i class="fas fa-code" aria-hidden="true"></i> Extrait réel du code (Repository des contacts)</h4>',
                '<pre><code>final class ContactRepository\n' +
                '{\n' +
                '    private PDO $db;\n\n' +
                '    public function __construct()\n' +
                '    {\n' +
                '        $this->db = \\Database::getConnection();\n' +
                '    }\n\n' +
                '    /** @return Contact[] */\n' +
                '    public function findAll(int $limit = 100, int $offset = 0, ?string $search = null): array\n' +
                '    {\n' +
                '        $sql = "SELECT * FROM contact";\n' +
                '        $params = [];\n\n' +
                '        if ($search) {\n' +
                '            $sql .= " WHERE nom ILIKE :search OR prenom ILIKE :search\n' +
                '                      OR email ILIKE :search OR phone ILIKE :search";\n' +
                '            $params[\'search\'] = \'%\' . $search . \'%\';\n' +
                '        }\n\n' +
                '        $sql .= " ORDER BY date_creation DESC LIMIT :limit OFFSET :offset";\n' +
                '        // ... requête préparée, protégée contre les injections SQL\n' +
                '    }\n' +
                '}</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> travailler en mode projet (équipe, répartition des ',
                'tâches), mise à disposition d\'un service informatique.</p>',
                '<p><a href="https://github.com/HaGotHem/CRM-Club-Volley" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir le dépôt de l\'équipe sur GitHub</a> ',
                '<span style="opacity:.7;">(compte de mon coéquipier, dépôt partagé)</span></p>'
            ].join('\n')
        },

        techshop: {
            badge: 'Projet individuel — 10 déc. 2025 au 7 janv. 2026',
            title: 'Refonte e-commerce — TechShop',
            context: 'Formation Iris Campus — projet de 3 jours',
            tags: ['HTML5', 'CSS3', 'JavaScript vanilla', 'localStorage', 'Responsive'],
            images: [
                { src: IMG + 'techshop-home.png', caption: 'Page d\'accueil : slider hero, navigation, panier' },
                { src: IMG + 'techshop-produits.png', caption: 'Catalogue : recherche en temps réel, tri, filtres par catégorie' }
            ],
            bodyHtml: [
                '<p>',
                'Refonte complète du site e-commerce fictif <strong>TechShop</strong> : interface obsolète ',
                'transformée en expérience moderne, responsive mobile-first, avec panier fonctionnel, page de ',
                'paiement complète, recherche en temps réel, mode sombre, liste de souhaits et système de coupons.',
                '</p>',
                '<h4><i class="fas fa-layer-group" aria-hidden="true"></i> Fonctionnalités principales</h4>',
                '<ul>',
                '<li>Panier persistant (localStorage), modification des quantités, calcul automatique du total</li>',
                '<li>Page de paiement avec validation complète des champs et codes promo</li>',
                '<li>Recherche en temps réel, tri (prix, nom) et filtres par catégorie</li>',
                '<li>Mode sombre avec persistance de la préférence</li>',
                '<li>Design mobile-first, responsive sur mobile / tablette / desktop</li>',
                '</ul>',
                '<p><strong>Compétences mobilisées :</strong> développer la présence en ligne de l\'organisation ',
                '(refonte d\'un site exploitant les données de l\'organisation), travailler en mode projet ',
                '(planning en 3 jours : analyse, développement, interactivité), mise à disposition d\'un service ',
                'informatique.</p>',
                '<p><a href="https://github.com/mehdiseg/techshop" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir le code sur GitHub</a></p>'
            ].join('\n')
        },

        santa: {
            badge: 'Projet individuel — 17 décembre 2025',
            title: 'Santa\'s Workshop',
            context: 'Outil de gestion de production de cadeaux',
            tags: ['JavaScript vanilla', 'Bootstrap 5', 'localStorage', 'Export/Import JSON'],
            images: [
                { src: IMG + 'pere-noel.png', caption: 'Interface : formulaire d\'ajout, filtres et suivi des statuts par cadeau' }
            ],
            bodyHtml: [
                '<p>',
                'Petit outil de suivi de production de cadeaux, sur le thème de Noël : ajout d\'un cadeau ',
                '(nom, catégorie, statut, destinataire), filtres par catégorie et par statut (à fabriquer / en ',
                'cours / livré), barre de progression, et export/import des données au format JSON.',
                '</p>',
                '<p><strong>Compétences mobilisées :</strong> mise à disposition d\'un service informatique ',
                '(outil fonctionnel et déployé).</p>',
                '<p><a href="https://github.com/mehdiseg/santas-workshop" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir le code sur GitHub</a></p>'
            ].join('\n')
        },

        scanner: {
            badge: 'Projet personnel — testé',
            title: 'Scanner réseau en PowerShell',
            context: 'Outil d\'audit du réseau local — septembre 2026',
            tags: ['PowerShell', 'Réseau', 'ARP / ICMP', 'Ports TCP', 'Sécurité'],
            images: [],
            bodyHtml: [
                '<p>',
                'Module PowerShell sans dépendance qui <strong>recense les appareils d\'un réseau local</strong> : ',
                'découverte par ping en parallèle complétée par la table ARP (pour retrouver aussi les appareils qui ',
                'ne répondent pas au ping), adresse MAC, nom d\'hôte, test de ports TCP courants ou choisis, puis ',
                'rapport HTML et CSV.',
                '</p>',
                '<h4><i class="fas fa-layer-group" aria-hidden="true"></i> Points de conception</h4>',
                '<ul>',
                '<li><strong>Garde-fous :</strong> les adresses publiques et les réseaux de plus de 1024 adresses sont ',
                'refusés par défaut (options explicites pour les autoriser).</li>',
                '<li><strong>Remarques de sécurité :</strong> Telnet et FTP (non chiffrés), SMB, RDP et VNC signalés.</li>',
                '<li><strong>Tests :</strong> 36 vérifications automatiques (analyse des ports et plages, calcul des ',
                'adresses, refus des réseaux dangereux).</li>',
                '</ul>',
                '<p class="project-modal-code-label">PowerShell — exemples</p>',
                '<pre><code>.\\Scan-Reseau.ps1\n' +
                '.\\Scan-Reseau.ps1 -Reseau 192.168.1.0/24 -Ports 22,80,443,8000-8010 -Sortie .\\rapports\n' +
                '.\\Scan-Reseau.ps1 -Reseau 192.168.1.0/24 -SansPorts</code></pre>',
                '<p><strong>Compétences mobilisées :</strong> gestion du patrimoine informatique (recensement des ',
                'équipements), assurer la cybersécurité (repérage des services exposés), scripting.</p>',
                '<p><a href="https://github.com/mehdiseg/scanner-reseau-powershell" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> Voir le code sur GitHub</a></p>'
            ].join('\n')
        },

        catalogue: {
            badge: 'Projet personnel — magasin Noha Auto',
            title: 'Application de catalogue et de stock — Noha Auto',
            context: 'Serveur web multi-utilisateurs — septembre 2026',
            tags: ['Node.js', 'Express', 'SQLite', 'HTTPS', 'Tailscale Funnel', 'Codes-barres'],
            images: [
                { src: IMG + 'noha-catalogue-mobile.png', caption: 'Catalogue sur téléphone (données de démonstration)' },
                { src: IMG + 'noha-catalogue-ordinateur.png', caption: 'Catalogue sur ordinateur (données de démonstration)' }
            ],
            bodyHtml: [
                '<p>',
                'Application web pour gérer le catalogue d\'articles d\'un magasin de pièces auto : recherche, ajout à la ',
                'main ou <strong>import Excel</strong>, stock avec alerte « à commander » (seuil réglable par article), ',
                'et <strong>étiquettes à codes-barres</strong> pour une douchette USB.',
                '</p>',
                '<div class="project-modal-note">',
                'Projet conçu à partir des besoins du magasin, <strong>avec l\'aide de l\'assistant IA Claude</strong> ',
                'pour l\'écriture du code. Il fonctionne sur mon PC, joignable par HTTPS ; l\'installation définitive ',
                'et le démarrage automatique du serveur sont en cours de validation.',
                '</div>',
                '<h4><i class="fas fa-shield-alt" aria-hidden="true"></i> Sécurité (le serveur est joignable depuis internet)</h4>',
                '<ul>',
                '<li>Comptes avec identifiant et mot de passe (hachage scrypt), rôles administrateur et employé : ',
                'l\'employé ne voit pas les prix d\'achat, y compris dans les réponses du serveur.</li>',
                '<li>Sessions par cookie <code>HttpOnly</code>/<code>Secure</code>, protection CSRF, en-têtes de sécurité ',
                '(CSP stricte), blocage temporaire après 8 échecs de connexion.</li>',
                '<li>Le serveur n\'écoute qu\'en local (<code>127.0.0.1</code>) ; c\'est <strong>Tailscale Funnel</strong> qui ',
                'le publie en HTTPS, sans redirection de port sur la box.</li>',
                '<li>Journal d\'activité, sauvegardes quotidiennes de la base, 10 scénarios de test de bout en bout.</li>',
                '</ul>',
                '<p><strong>Compétences mobilisées :</strong> mise à disposition d\'un service informatique, gestion du ',
                'patrimoine informatique (catalogue, stock), assurer la cybersécurité d\'un service.</p>',
                '<p>Le dépôt GitHub est <strong>privé</strong> (il décrit le fonctionnement interne d\'un serveur exposé) : ',
                'le code peut être présenté sur demande. Le retour d\'expérience sur la publication en HTTPS est public : ',
                '<a href="https://github.com/mehdiseg/tailscale-funnel-serveur-maison" target="_blank" rel="noopener noreferrer">',
                '<i class="fab fa-github" aria-hidden="true"></i> tailscale-funnel-serveur-maison</a>.</p>'
            ].join('\n')
        },

        outils: {
            badge: 'Projets personnels — testés',
            title: 'Boîte à outils réseau (Python, Bash)',
            context: 'Cinq petits outils publics, avec tests automatiques — septembre 2026',
            tags: ['Python', 'Bash', 'Wireshark', 'WireGuard', 'OpenSSL', 'Nmap'],
            images: [],
            bodyHtml: [
                '<p>',
                'Des outils pour s\'entraîner et travailler proprement. Chacun a des tests, exécutés aussi à chaque ',
                '<code>push</code> par GitHub Actions.',
                '</p>',
                '<ul>',
                '<li><a href="https://github.com/mehdiseg/calculateur-sous-reseaux" target="_blank" rel="noopener noreferrer">',
                'calculateur-sous-reseaux</a> : informations d\'un réseau, découpage et <strong>VLSM</strong> (14 tests).</li>',
                '<li><a href="https://github.com/mehdiseg/tp-wireshark-analyse-trafic" target="_blank" rel="noopener noreferrer">',
                'tp-wireshark-analyse-trafic</a> : capture synthétique et 18 exercices de filtres, chaque réponse vérifiée avec ',
                '<code>tshark</code>.</li>',
                '<li><a href="https://github.com/mehdiseg/wireguard-generateur-config" target="_blank" rel="noopener noreferrer">',
                'wireguard-generateur-config</a> : configuration <strong>WireGuard</strong> serveur + clients, clés vérifiées avec ',
                '<code>wg</code> (16 tests).</li>',
                '<li><a href="https://github.com/mehdiseg/pki-interne-openssl" target="_blank" rel="noopener noreferrer">',
                'pki-interne-openssl</a> : autorité de certification interne et certificats avec SAN, testée jusqu\'à une vraie ',
                'connexion TLS.</li>',
                '<li><a href="https://github.com/mehdiseg/nmap-audit-reseau-local" target="_blank" rel="noopener noreferrer">',
                'nmap-audit-reseau-local</a> : mémo <strong>Nmap</strong> et outil de comparaison de scans (16 tests).</li>',
                '</ul>',
                '<p>',
                'D\'autres guides (labs Cisco, pfSense, Zabbix, Suricata...) sont préparés mais <strong>pas encore réalisés</strong> : ',
                'ils sont listés, avec leur statut, dans la ',
                '<a href="https://github.com/mehdiseg/roadmap-reseau-bts-sio" target="_blank" rel="noopener noreferrer">feuille de route</a>.',
                '</p>',
                '<p><strong>Compétences mobilisées :</strong> assurer la cybersécurité, gestion du patrimoine informatique, ',
                'scripting et tests automatisés.</p>'
            ].join('\n')
        }
    };

    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const dialog = modal.querySelector('.project-modal-dialog');
    const badgeEl = document.getElementById('project-modal-badge');
    const titleEl = document.getElementById('project-modal-title');
    const contextEl = document.getElementById('project-modal-context');
    const tagsEl = document.getElementById('project-modal-tags');
    const galleryEl = document.getElementById('project-modal-gallery');
    const bodyEl = document.getElementById('project-modal-body');

    let lastFocused = null;

    function openProject(id) {
        const data = PROJECTS[id];
        if (!data) return;

        badgeEl.textContent = data.badge || '';
        titleEl.textContent = data.title || '';
        contextEl.textContent = data.context || '';

        tagsEl.innerHTML = '';
        (data.tags || []).forEach((tag) => {
            const li = document.createElement('li');
            li.textContent = tag;
            tagsEl.appendChild(li);
        });

        galleryEl.innerHTML = '';
        (data.images || []).forEach((img) => {
            const figure = document.createElement('figure');
            const image = document.createElement('img');
            image.src = img.src;
            image.alt = img.caption || data.title;
            image.loading = 'lazy';
            figure.appendChild(image);
            if (img.caption) {
                const caption = document.createElement('figcaption');
                caption.textContent = img.caption;
                figure.appendChild(caption);
            }
            galleryEl.appendChild(figure);
        });

        bodyEl.innerHTML = data.bodyHtml || '';

        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        dialog.scrollTop = 0;
        modal.querySelector('.project-modal-close').focus();
    }

    function closeProject() {
        modal.hidden = true;
        document.body.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    document.querySelectorAll('[data-project]').forEach((card) => {
        card.addEventListener('click', () => openProject(card.getAttribute('data-project')));
    });

    modal.querySelectorAll('[data-close-modal]').forEach((el) => {
        el.addEventListener('click', closeProject);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) {
            closeProject();
        }
    });
})();
