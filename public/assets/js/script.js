/* =========================================================
   Script commun à toutes les pages du portfolio
   (index.html, veille.html)
   ========================================================= */

(function () {
    'use strict';

    const htmlEl = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== THEME CLAIR / SOMBRE =====
    // L'état initial est appliqué avant le rendu par le script inline dans le <head>,
    // ici on ne fait que synchroniser l'icône et gérer le clic.
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i');

        const syncIcon = () => {
            if (!themeIcon) return;
            const isLight = htmlEl.getAttribute('data-theme') === 'light';
            themeIcon.classList.toggle('fa-sun', isLight);
            themeIcon.classList.toggle('fa-moon', !isLight);
            themeToggle.setAttribute('aria-label',
                isLight ? 'Passer en mode sombre' : 'Passer en mode clair');
        };

        syncIcon();

        themeToggle.addEventListener('click', () => {
            const isLight = htmlEl.getAttribute('data-theme') === 'light';
            if (isLight) {
                htmlEl.removeAttribute('data-theme');
            } else {
                htmlEl.setAttribute('data-theme', 'light');
            }
            try {
                localStorage.setItem('theme', isLight ? 'dark' : 'light');
            } catch (e) { /* stockage indisponible : le thème ne sera pas mémorisé */ }
            syncIcon();
        });
    }

    // ===== MENU HAMBURGER (responsive) =====
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        const setMenu = (open) => {
            hamburger.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
            hamburger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        };

        setMenu(false);

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenu(hamburger.getAttribute('aria-expanded') !== 'true');
        });

        // Fermer au clic sur un lien du menu
        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenu(false));
        });

        // Fermer au clic en dehors
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                setMenu(false);
            }
        });

        // Fermer avec la touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                hamburger.focus();
            }
        });
    }

    // ===== EFFET MACHINE A ECRIRE (titre du hero) =====
    const typewriterEl = document.getElementById('typewriter');

    if (typewriterEl) {
        const phrases = [
            "Étudiant en BTS SIO option SISR",
            "Futur Administrateur Systèmes et Réseaux",
            "En recherche d'alternance"
        ];

        if (prefersReducedMotion) {
            // Pas d'animation : on affiche simplement la première phrase
            typewriterEl.textContent = phrases[0];
        } else {
            let phraseIndex = 0;
            let charIndex = 0;
            let isDeleting = false;

            const typeEffect = () => {
                const currentPhrase = phrases[phraseIndex];

                charIndex += isDeleting ? -1 : 1;
                typewriterEl.textContent = currentPhrase.substring(0, charIndex);

                let typeSpeed = isDeleting ? 45 : 90;

                if (!isDeleting && charIndex === currentPhrase.length) {
                    typeSpeed = 2200; // pause en fin de phrase
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    typeSpeed = 450;
                }

                window.setTimeout(typeEffect, typeSpeed);
            };

            typeEffect();
        }
    }

    // ===== APPARITION AU SCROLL =====
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealElements.forEach((el) => el.classList.add('active'));
        } else {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target); // une seule fois suffit
                    }
                });
            }, { threshold: 0.15 });

            revealElements.forEach((el) => revealObserver.observe(el));
        }
    }

    // ===== GESTION UNIFIEE DU SCROLL (une seule écoute, throttlée par rAF) =====
    const navbar = document.querySelector('.navbar');
    const backToTopBtn = document.getElementById('back-to-top');

    // Ancres internes uniquement (href="#..."), pour la mise en surbrillance du menu
    const hashLinks = Array.from(document.querySelectorAll('.nav-link'))
        .filter((link) => (link.getAttribute('href') || '').startsWith('#'));
    const trackedSections = hashLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const onScroll = () => {
        const y = window.scrollY;

        if (navbar) {
            navbar.classList.toggle('scrolled', y > 50);
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('show', y > 400);
        }

        if (trackedSections.length) {
            let currentId = '';
            trackedSections.forEach((section) => {
                if (y >= section.offsetTop - 120) {
                    currentId = section.id;
                }
            });

            hashLinks.forEach((link) => {
                link.classList.toggle('active-link',
                    link.getAttribute('href') === '#' + currentId);
            });
        }
    };

    let scrollScheduled = false;
    window.addEventListener('scroll', () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        window.requestAnimationFrame(() => {
            onScroll();
            scrollScheduled = false;
        });
    }, { passive: true });

    onScroll();

    // ===== BOUTON RETOUR EN HAUT =====
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // ===== FOND ANIMÉ : réseau de particules, sur tout le site =====
    const bgCanvas = document.getElementById('bg-canvas');

    if (bgCanvas && bgCanvas.getContext) {
        const ctx = bgCanvas.getContext('2d');
        let particles = [];
        let width = 0;
        let height = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let rafId = null;
        let running = false;
        let mouseX = null;
        let mouseY = null;
        const mouseRadius = 130;

        const getAccentColor = () => {
            const value = getComputedStyle(document.documentElement)
                .getPropertyValue('--accent-color').trim();
            return value || '#6c63ff';
        };

        const hexToRgb = (hex) => {
            const m = hex.replace('#', '').match(/.{1,2}/g);
            if (!m || m.length < 3) return { r: 108, g: 99, b: 255 };
            return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
        };

        const resize = () => {
            // Le canvas est fixe au viewport (pas à la page) : il n'a donc jamais
            // besoin de couvrir toute la hauteur du document, seulement l'écran visible.
            width = window.innerWidth;
            height = window.innerHeight;
            bgCanvas.width = width * dpr;
            bgCanvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Densité adaptée à la taille de l'écran, plafonnée pour rester léger
            const targetCount = Math.round((width * height) / 15000);
            const count = Math.max(24, Math.min(70, targetCount));

            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 1.2
            }));
        };

        const maxLinkDist = 140;

        const draw = () => {
            const { r, g, b } = hexToRgb(getAccentColor());
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (!prefersReducedMotion) {
                    // Le réseau "s'écarte" doucement au passage du curseur
                    if (mouseX !== null) {
                        const dxm = p.x - mouseX;
                        const dym = p.y - mouseY;
                        const distM = Math.sqrt(dxm * dxm + dym * dym);
                        if (distM < mouseRadius && distM > 0.01) {
                            const force = (1 - distM / mouseRadius) * 0.6;
                            p.x += (dxm / distM) * force;
                            p.y += (dym / distM) * force;
                        }
                    }

                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x <= 0 || p.x >= width) p.vx *= -1;
                    if (p.y <= 0 || p.y >= height) p.vy *= -1;
                    p.x = Math.min(Math.max(p.x, 0), width);
                    p.y = Math.min(Math.max(p.y, 0), height);
                }

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxLinkDist) {
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.22 * (1 - dist / maxLinkDist)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }

            for (const p of particles) {
                // Halo lumineux discret autour de chaque nœud, plus visible près du curseur
                let glow = 0;
                if (mouseX !== null) {
                    const dxm = p.x - mouseX;
                    const dym = p.y - mouseY;
                    const distM = Math.sqrt(dxm * dxm + dym * dym);
                    if (distM < mouseRadius) glow = 1 - distM / mouseRadius;
                }

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + glow * 0.35})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r + glow * 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            draw();
            if (!prefersReducedMotion) {
                rafId = window.requestAnimationFrame(loop);
            }
        };

        const start = () => {
            if (running) return;
            running = true;
            if (prefersReducedMotion) {
                draw(); // une seule image statique, pas d'animation
            } else {
                rafId = window.requestAnimationFrame(loop);
            }
        };

        const stop = () => {
            running = false;
            if (rafId) window.cancelAnimationFrame(rafId);
            rafId = null;
        };

        // ===== Interaction souris/tactile, sur toute la fenêtre =====
        // Le canvas ne bouge pas au scroll (position: fixed) donc les coordonnées
        // clientX/clientY du curseur correspondent directement à ses coordonnées internes.
        if (!prefersReducedMotion) {
            window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                mouseX = null;
                mouseY = null;
            });

            window.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches[0]) {
                    mouseX = e.touches[0].clientX;
                    mouseY = e.touches[0].clientY;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                mouseX = null;
                mouseY = null;
            });
        }

        resize();
        start();

        window.addEventListener('resize', () => {
            resize();
            // Redessine immédiatement : resize() vide le canvas, et sans ce
            // rappel la variante "prefers-reduced-motion" (dessin unique,
            // pas de boucle) resterait vide jusqu'au prochain toggle d'onglet.
            draw();
        }, { passive: true });

        // Coupe l'animation quand l'onglet est masqué (CPU/batterie)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });
    }

    // ===== FORMULAIRE DE CONTACT =====
    // Pas de backend sur ce site statique : le formulaire ouvre le client mail
    // du visiteur avec un message pré-rempli, adressé au mail perso de Mehdi.
    const contactForm = document.getElementById('contact-form');
    const contactHint = document.getElementById('contact-form-hint');
    const CONTACT_EMAIL = 'mehdiseghier2000@gmail.com';

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const subject = contactForm.subject.value.trim();
            const message = contactForm.message.value.trim();

            const body = `Nom : ${name}\nEmail : ${email}\n\n${message}`;
            const mailtoUrl = `mailto:${CONTACT_EMAIL}`
                + `?subject=${encodeURIComponent(subject)}`
                + `&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoUrl;

            if (contactHint) {
                contactHint.textContent =
                    'Votre client mail va s\'ouvrir avec le message pré-rempli : il ne reste qu\'à cliquer sur Envoyer.';
            }
        });
    }

    // ===== TERMINAL INTERACTIF (easter egg BTS SISR) =====
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalPanel = document.getElementById('terminal-panel');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalForm = document.getElementById('terminal-form');
    const terminalInput = document.getElementById('terminal-input');
    const terminalClose = terminalPanel ? terminalPanel.querySelector('.terminal-close') : null;

    if (terminalToggle && terminalPanel && terminalOutput && terminalForm && terminalInput) {
        const history = [];
        let historyIndex = -1;
        let welcomed = false;

        const print = (text, cssClass) => {
            const line = document.createElement('p');
            line.className = 'terminal-line' + (cssClass ? ' ' + cssClass : '');
            line.textContent = text;
            terminalOutput.appendChild(line);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        };

        const printCmd = (cmd) => {
            const line = document.createElement('p');
            line.className = 'terminal-line terminal-line--cmd';
            line.textContent = cmd;
            terminalOutput.appendChild(line);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        };

        // Navigue vers une section : scroll direct si elle existe sur cette page,
        // sinon renvoie vers index.html#id (utile depuis veille.html).
        const goToSection = (id, label) => {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                print(`→ direction ${label}...`, 'terminal-line--accent');
            } else {
                print(`→ redirection vers le portfolio (${label})...`, 'terminal-line--accent');
                window.setTimeout(() => {
                    window.location.href = `index.html#${id}`;
                }, 400);
            }
        };

        const printWelcome = () => {
            print('Bienvenue sur le terminal du portfolio de Mehdi Seghier.', 'terminal-line--accent');
            print('Tape "help" pour la liste des commandes.');
        };

        const COMMANDS = {
            help: () => {
                print('Commandes disponibles :');
                print('  whoami        — qui je suis');
                print('  skills        — voir les compétences');
                print('  projects      — voir les projets réalisés');
                print('  veille        — voir la veille sur la cryptographie post-quantique');
                print('  contact       — me contacter');
                print('  cv            — télécharger mon CV (PDF)');
                print('  synthese      — télécharger le tableau de synthèse BTS SIO (PDF)');
                print('  neofetch      — infos système (pour rire un peu)');
                print('  spin          — faire tourner la scène 3D');
                print('  3d            — activer / couper la 3D (mode performance)');
                print('  k             — ouvrir la palette de commandes (Ctrl+K)');
                print('  ping <hôte>   — tester la latence (fictif)');
                print('  date          — date et heure actuelles');
                print('  clear         — vider le terminal');
                print('  exit          — fermer le terminal');
            },
            whoami: () => {
                print('mehdi — étudiant en BTS SIO option SISR (Iris Campus, Nice).');
                print('En recherche d\'alternance Administrateur Systèmes et Réseaux.');
            },
            skills: () => goToSection('skills', 'Compétences'),
            competences: () => goToSection('skills', 'Compétences'),
            projects: () => goToSection('projects', 'Projets'),
            projets: () => goToSection('projects', 'Projets'),
            contact: () => goToSection('contact', 'Contact'),
            veille: () => {
                if (window.location.pathname.endsWith('veille.html')) {
                    print('Tu y es déjà : bonne lecture !', 'terminal-line--accent');
                } else {
                    print('→ ouverture de la veille technologique (PQC)...', 'terminal-line--accent');
                    window.setTimeout(() => { window.location.href = 'veille.html'; }, 400);
                }
            },
            cv: () => {
                print('→ téléchargement du CV...', 'terminal-line--accent');
                const link = document.createElement('a');
                link.href = 'documents/cv-mehdi-seghier.pdf';
                link.download = 'CV-Mehdi-Seghier-Alternance-ASR.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
            },
            synthese: () => {
                print('→ téléchargement du tableau de synthèse...', 'terminal-line--accent');
                const link = document.createElement('a');
                link.href = 'documents/tableau-synthese-bts-sio-sisr-mehdi-seghier.pdf';
                link.download = 'Tableau-synthese-BTS-SIO-SISR-Mehdi-Seghier.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
            },
            tableau: () => COMMANDS.synthese(),
            spin: () => {
                if (window.portfolio3D) {
                    window.portfolio3D.spin();
                    print('→ rotation du globe réseau à pleine vitesse !', 'terminal-line--accent');
                } else {
                    print('La scène 3D n\'est pas disponible sur cette page.', 'terminal-line--error');
                }
            },
            '3d': () => {
                if (!window.portfolioFx) {
                    print('Réglage indisponible sur cette page.', 'terminal-line--error');
                    return;
                }
                const on = window.portfolioFx.toggle();
                print(on ? '→ 3D activée.' : '→ mode performance : 3D coupée (réglage mémorisé).', 'terminal-line--accent');
            },
            k: () => {
                if (window.portfolioPalette) {
                    closeTerminal();
                    window.portfolioPalette.open();
                }
            },
            neofetch: () => {
                print('mehdi@sisr');
                print('-----------');
                print('OS         : BTS SIO — option SISR');
                print('École      : Iris Campus, Nice');
                print('Shell      : bash / PowerShell');
                print('Stack      : Linux · Windows Server · Cisco IOS · GLPI');
                print('Uptime     : promotion 2025 – 2027');
                print('Recherche  : alternance Administrateur Systèmes et Réseaux');
            },
            date: () => {
                print(new Date().toLocaleString('fr-FR', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }));
            },
            clear: () => {
                terminalOutput.innerHTML = '';
            },
            exit: () => closeTerminal(),
            quit: () => closeTerminal()
        };

        const runCommand = (raw) => {
            const trimmed = raw.trim();
            printCmd(trimmed);

            if (!trimmed) return;

            const [cmdRaw, ...args] = trimmed.split(/\s+/);
            const cmd = cmdRaw.toLowerCase();

            if (cmd === 'ping') {
                const target = args[0] || 'localhost';
                const ms = Math.floor(Math.random() * 20) + 4;
                print(`Requête vers ${target}... réponse en ${ms} ms.`);
                print('Toujours partant pour un nouveau projet réseau. 🌐', 'terminal-line--accent');
                return;
            }

            if (cmd === 'sudo') {
                print('Permission refusée : seul le formateur SISR a les droits root ici. 🙂', 'terminal-line--error');
                return;
            }

            if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
                COMMANDS[cmd]();
            } else {
                print(`commande introuvable : ${cmd} — tape "help" pour la liste des commandes.`, 'terminal-line--error');
            }
        };

        function openTerminal() {
            terminalPanel.hidden = false;
            terminalToggle.setAttribute('aria-expanded', 'true');
            terminalToggle.setAttribute('aria-label', 'Fermer le terminal');
            if (!welcomed) {
                printWelcome();
                welcomed = true;
            }
            window.setTimeout(() => terminalInput.focus(), 50);
        }

        function closeTerminal() {
            terminalPanel.hidden = true;
            terminalToggle.setAttribute('aria-expanded', 'false');
            terminalToggle.setAttribute('aria-label', 'Ouvrir le terminal');
            terminalToggle.focus();
        }

        terminalToggle.addEventListener('click', () => {
            if (terminalPanel.hidden) {
                openTerminal();
            } else {
                closeTerminal();
            }
        });

        if (terminalClose) {
            terminalClose.addEventListener('click', closeTerminal);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !terminalPanel.hidden) {
                closeTerminal();
            }
        });

        terminalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = terminalInput.value;
            if (value.trim()) {
                history.push(value);
                historyIndex = history.length;
            }
            runCommand(value);
            terminalInput.value = '';
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                if (history.length && historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = history[historyIndex];
                    window.requestAnimationFrame(() => {
                        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
                    });
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    terminalInput.value = history[historyIndex];
                } else {
                    historyIndex = history.length;
                    terminalInput.value = '';
                }
                e.preventDefault();
            }
        });
    }
})();
