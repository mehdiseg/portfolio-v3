/* =========================================================
   V2 — Interactions : démarrage, titre animé, curseur,
   cartes 3D, boutons magnétiques, compteurs, nuage 3D,
   filtres de projets.
   ========================================================= */

(function () {
    'use strict';

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const afterBoot = (fn) => {
        if (root.classList.contains('is-booting')) {
            window.addEventListener('boot:done', fn, { once: true });
        } else {
            fn();
        }
    };

    // ===== SÉQUENCE DE DÉMARRAGE (une fois par session) =====
    const boot = document.querySelector('.boot');
    if (boot && root.classList.contains('is-booting')) {
        boot.querySelectorAll('.boot-lines li').forEach((li, i) => {
            window.setTimeout(() => li.classList.add('on'), 150 + i * 230);
        });
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            root.classList.add('boot-leaving');
            try { sessionStorage.setItem('booted', '1'); } catch (e) { /* ignoré */ }
            window.setTimeout(() => {
                root.classList.remove('is-booting', 'boot-leaving');
                window.dispatchEvent(new Event('boot:done'));
            }, 650);
        };
        window.setTimeout(finish, 1550);
        boot.addEventListener('click', finish);
        window.addEventListener('keydown', finish, { once: true });
    }

    // ===== TITRE : découpage lettre par lettre =====
    document.querySelectorAll('[data-split]').forEach((el, line) => {
        const chars = Array.from(el.textContent.trim());
        el.textContent = '';
        el.style.setProperty('--n', chars.length);
        chars.forEach((ch, i) => {
            const s = document.createElement('span');
            s.className = 'split-char';
            s.textContent = ch === ' ' ? ' ' : ch;
            s.style.setProperty('--i', i);
            s.style.setProperty('--d', (line * 220) + 'ms');
            s.setAttribute('aria-hidden', 'true');
            el.appendChild(s);
        });
        el.classList.add('is-split');
    });

    // ===== BARRE DE PROGRESSION DU SCROLL =====
    const progress = document.querySelector('.scroll-progress span');
    if (progress) {
        let queued = false;
        const update = () => {
            const max = root.scrollHeight - window.innerHeight;
            progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
            queued = false;
        };
        window.addEventListener('scroll', () => {
            if (!queued) {
                queued = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    // ===== HALO + ANNEAU QUI SUIVENT LE CURSEUR =====
    const glow = document.querySelector('.cursor-glow');
    const ring = document.querySelector('.cursor-ring');
    if (finePointer && !reduced && glow && ring) {
        let tx = window.innerWidth / 2;
        let ty = window.innerHeight / 2;
        let gx = tx, gy = ty, rx = tx, ry = ty;
        let active = false;

        window.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            tx = e.clientX;
            ty = e.clientY;
            if (!active) {
                active = true;
                gx = rx = tx;
                gy = ry = ty;
                root.classList.add('cursor-on');
            }
        }, { passive: true });

        document.documentElement.addEventListener('mouseleave', () => {
            active = false;
            root.classList.remove('cursor-on');
        });

        const interactive = 'a, button, input, textarea, label, [data-tilt], .tag-sphere, .hero-visual';
        document.addEventListener('pointerover', (e) => {
            ring.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(interactive)));
        });
        document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
        document.addEventListener('pointerup', () => ring.classList.remove('is-down'));

        const tick = () => {
            gx += (tx - gx) * 0.1;
            gy += (ty - gy) * 0.1;
            rx += (tx - rx) * 0.28;
            ry += (ty - ry) * 0.28;
            glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            window.requestAnimationFrame(tick);
        };
        tick();
    }

    // ===== CARTES 3D (inclinaison + reflet) =====
    if (finePointer && !reduced) {
        document.querySelectorAll('[data-tilt]').forEach((card) => {
            const max = parseFloat(card.getAttribute('data-tilt')) || 8;
            let raf = null;
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                card.classList.add('is-tilting');
                if (raf) window.cancelAnimationFrame(raf);
                raf = window.requestAnimationFrame(() => {
                    card.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
                    card.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
                    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
                });
            });
            card.addEventListener('pointerleave', () => {
                if (raf) window.cancelAnimationFrame(raf);
                card.classList.remove('is-tilting');
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });

        // ===== BOUTONS MAGNÉTIQUES =====
        document.querySelectorAll('[data-magnetic]').forEach((btn) => {
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                btn.style.setProperty('--tx', (x * 0.22).toFixed(1) + 'px');
                btn.style.setProperty('--ty', (y * 0.32).toFixed(1) + 'px');
            });
            btn.addEventListener('pointerleave', () => {
                btn.style.setProperty('--tx', '0px');
                btn.style.setProperty('--ty', '0px');
            });
        });
    }

    // ===== APPARITION EN CASCADE DANS LES GRILLES =====
    document.querySelectorAll('.skills-grid, .projects-grid').forEach((grid) => {
        Array.from(grid.children).forEach((el, i) => {
            if (!el.classList.contains('reveal')) return;
            el.style.transitionDelay = ((i % 6) * 70) + 'ms';
            const clear = (e) => {
                if (e.target !== el || e.propertyName !== 'opacity') return;
                el.style.transitionDelay = '';
                el.removeEventListener('transitionend', clear);
            };
            el.addEventListener('transitionend', clear);
        });
    });

    // ===== COMPTEURS ANIMÉS =====
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length && !reduced && 'IntersectionObserver' in window) {
        const run = (el) => {
            const end = parseInt(el.getAttribute('data-count'), 10) || 0;
            const duration = 1300;
            const t0 = performance.now();
            const step = (now) => {
                const t = Math.min((now - t0) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = String(Math.round(end * eased));
                if (t < 1) window.requestAnimationFrame(step);
            };
            el.textContent = '0';
            window.requestAnimationFrame(step);
        };
        afterBoot(() => {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        run(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.6 });
            counters.forEach((c) => io.observe(c));
        });
    }

    // ===== NUAGE DE TECHNOLOGIES EN 3D =====
    const sphere = document.getElementById('tag-sphere');
    if (sphere) {
        const tags = Array.from(sphere.querySelectorAll('span'));
        const n = tags.length;
        const golden = Math.PI * (3 - Math.sqrt(5));
        const pts = tags.map((_, i) => {
            const y = 1 - ((i + 0.5) / n) * 2;
            const r = Math.sqrt(1 - y * y);
            return { x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r };
        });

        let radius = 150;
        let vx = 0.0022;
        let vy = 0.0032;
        let targetVx = vx;
        let targetVy = vy;
        let hovering = false;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let visible = false;
        let raf = null;

        const rotate = (p, a, b) => {
            const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
            const y1 = p.y * ca - p.z * sa;
            const z1 = p.y * sa + p.z * ca;
            const x2 = p.x * cb + z1 * sb;
            const z2 = -p.x * sb + z1 * cb;
            p.x = x2; p.y = y1; p.z = z2;
        };

        const paint = () => {
            for (let i = 0; i < n; i++) {
                const p = pts[i];
                const depth = (p.z + 1) / 2;
                const s = 0.6 + depth * 0.55;
                const el = tags[i];
                el.style.transform = `translate(-50%, -50%) translate3d(${(p.x * radius).toFixed(1)}px, ${(p.y * radius).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
                el.style.opacity = (0.22 + depth * 0.78).toFixed(2);
                el.style.zIndex = String(Math.round(depth * 100));
                el.classList.toggle('is-front', depth > 0.82);
            }
        };

        const measure = () => {
            radius = Math.max(90, Math.min(sphere.clientWidth, sphere.clientHeight || sphere.clientWidth) * 0.4);
            paint();
        };

        const loop = () => {
            raf = null;
            if (!visible || document.hidden) return;
            if (!dragging) {
                const slow = hovering ? 0.35 : 1;
                vx += (targetVx * slow - vx) * 0.05;
                vy += (targetVy * slow - vy) * 0.05;
            }
            for (let i = 0; i < n; i++) rotate(pts[i], vx, vy);
            paint();
            if (!reduced || dragging || Math.abs(vx) + Math.abs(vy) > 0.0002) {
                raf = window.requestAnimationFrame(loop);
            }
        };
        const kick = () => {
            if (!raf) raf = window.requestAnimationFrame(loop);
        };

        if (reduced) {
            vx = vy = targetVx = targetVy = 0;
        }

        sphere.addEventListener('pointerenter', () => { hovering = true; });
        sphere.addEventListener('pointerleave', () => { hovering = false; });
        sphere.addEventListener('pointermove', (e) => {
            const r = sphere.getBoundingClientRect();
            if (dragging) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                vy = dx * 0.006;
                vx = -dy * 0.006;
                lastX = e.clientX;
                lastY = e.clientY;
                kick();
                return;
            }
            if (reduced) return;
            const mx = (e.clientX - r.left) / r.width - 0.5;
            const my = (e.clientY - r.top) / r.height - 0.5;
            targetVy = mx * 0.02;
            targetVx = -my * 0.02;
        });
        sphere.addEventListener('pointerdown', (e) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            sphere.setPointerCapture(e.pointerId);
            sphere.classList.add('is-dragging');
            kick();
        });
        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            sphere.classList.remove('is-dragging');
            if (reduced) { vx = vy = 0; }
        };
        sphere.addEventListener('pointerup', endDrag);
        sphere.addEventListener('pointercancel', endDrag);
        sphere.addEventListener('lostpointercapture', endDrag);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                if (visible) kick();
            }).observe(sphere);
        } else {
            visible = true;
        }
        document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
        window.addEventListener('resize', measure, { passive: true });
        measure();
        kick();
    }

    // ===== FILTRES DE PROJETS =====
    const chips = document.querySelectorAll('.filter-chip');
    const cards = Array.from(document.querySelectorAll('.project-card[data-cat]'));
    if (chips.length && cards.length) {
        const matches = (card, f) => f === 'all' || card.getAttribute('data-cat').split(' ').includes(f);

        chips.forEach((chip) => {
            const f = chip.getAttribute('data-filter');
            const count = chip.querySelector('.filter-count');
            if (count) count.textContent = String(cards.filter((c) => matches(c, f)).length);

            chip.addEventListener('click', () => {
                chips.forEach((c) => {
                    const on = c === chip;
                    c.classList.toggle('is-active', on);
                    c.setAttribute('aria-pressed', String(on));
                });
                cards.forEach((card, i) => {
                    const show = matches(card, f);
                    card.hidden = !show;
                    card.classList.remove('is-filtered-in');
                    if (show) {
                        card.classList.add('active');
                        if (!reduced) {
                            card.style.animationDelay = ((i % 6) * 45) + 'ms';
                            void card.offsetWidth;
                            card.classList.add('is-filtered-in');
                        }
                    }
                });
            });
        });
    }

    // ===== MODE PERFORMANCE (coupe la 3D, mémorisé) =====
    const setFx = (on) => {
        root.classList.toggle('fx-off', !on);
        try { localStorage.setItem('fx', on ? 'on' : 'off'); } catch (e) { /* ignoré */ }
        if (window.portfolio3D && window.portfolio3D.setEnabled) window.portfolio3D.setEnabled(on);
        return on;
    };
    window.portfolioFx = {
        toggle: () => setFx(root.classList.contains('fx-off')),
        isOn: () => !root.classList.contains('fx-off')
    };

    // ===== NAVIGATION ENTRE PROJETS DANS LA MODALE =====
    const modal = document.getElementById('project-modal');
    if (modal) {
        const dialog = modal.querySelector('.project-modal-dialog');
        const allCards = Array.from(document.querySelectorAll('[data-project]'));
        let currentId = null;

        const nav = document.createElement('div');
        nav.className = 'project-modal-nav';
        nav.innerHTML =
            '<button type="button" class="project-nav-btn" data-dir="-1" aria-label="Projet précédent">' +
            '<i class="fas fa-arrow-left" aria-hidden="true"></i><span>Précédent</span></button>' +
            '<span class="project-nav-count" aria-live="polite"></span>' +
            '<button type="button" class="project-nav-btn" data-dir="1" aria-label="Projet suivant">' +
            '<span>Suivant</span><i class="fas fa-arrow-right" aria-hidden="true"></i></button>';
        dialog.appendChild(nav);
        const count = nav.querySelector('.project-nav-count');

        const visibleCards = () => allCards.filter((c) => !c.hidden);
        const syncCount = () => {
            const list = visibleCards();
            const i = list.findIndex((c) => c.getAttribute('data-project') === currentId);
            count.textContent = i >= 0 ? `${i + 1} / ${list.length}` : '';
        };

        allCards.forEach((card) => {
            card.addEventListener('click', () => {
                currentId = card.getAttribute('data-project');
                syncCount();
            }, true);
        });

        const go = (dir) => {
            const list = visibleCards();
            if (!list.length) return;
            const i = list.findIndex((c) => c.getAttribute('data-project') === currentId);
            const next = list[(i + dir + list.length) % list.length];
            next.click();
            const scroller = modal.querySelector('.project-modal-scroll');
            if (scroller) scroller.scrollTop = 0;
        };

        nav.querySelectorAll('.project-nav-btn').forEach((btn) => {
            btn.addEventListener('click', () => go(parseInt(btn.getAttribute('data-dir'), 10)));
        });

        document.addEventListener('keydown', (e) => {
            if (modal.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        });

        // À la fermeture, rendre le focus à la carte du dernier projet consulté
        new MutationObserver(() => {
            if (!modal.hidden || !currentId) return;
            const active = document.activeElement;
            if (!active || active === document.body || modal.contains(active)) {
                const card = allCards.find((c) => c.getAttribute('data-project') === currentId);
                if (card) card.focus({ preventScroll: true });
            }
        }).observe(modal, { attributes: true, attributeFilter: ['hidden'] });
    }

    // ===== PALETTE DE COMMANDES (Ctrl + K) =====
    const navActions = document.querySelector('.nav-actions');
    const onIndex = !!document.getElementById('home');
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');

    const download = (href, name) => {
        const a = document.createElement('a');
        a.href = href;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    const goTo = (hash) => {
        const target = onIndex ? document.querySelector(hash) : null;
        if (target) {
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        } else {
            window.location.href = 'index.html' + hash;
        }
    };

    const buildItems = () => {
        const items = [];
        const add = (group, icon, label, run, keywords) => items.push({ group, icon, label, run, keywords: keywords || '' });

        add('Navigation', 'fa-house', 'Accueil', () => goTo('#home'), 'haut top hero');
        add('Navigation', 'fa-server', 'Compétences', () => goTo('#skills'), 'skills stack technologies');
        add('Navigation', 'fa-folder-open', 'Projets réalisés', () => goTo('#projects'), 'projects realisations');
        add('Navigation', 'fa-satellite-dish', 'Veille technologique (résumé)', () => goTo('#veille'), 'pqc quantique');
        add('Navigation', 'fa-envelope', 'Contact', () => goTo('#contact'), 'mail telephone formulaire');
        add('Navigation', 'fa-book-open', 'Veille complète : cryptographie post-quantique', () => {
            window.location.href = 'veille.html';
        }, 'pqc quantique page article');

        document.querySelectorAll('[data-project]').forEach((card) => {
            const h3 = card.querySelector('h3');
            const icon = card.querySelector(':scope > i');
            if (!h3) return;
            const iconClass = icon ? Array.from(icon.classList).find((c) => c.startsWith('fa-') && c !== 'fa-solid') : 'fa-folder';
            add('Projets', iconClass || 'fa-folder', h3.textContent.replace(/\s+/g, ' ').trim(), () => {
                if (card.hidden) {
                    const all = document.querySelector('.filter-chip[data-filter="all"]');
                    if (all) all.click();
                }
                card.click();
            }, (card.querySelector('p') || {}).textContent || '');
        });

        document.querySelectorAll('.toc-list a').forEach((link) => {
            add('Veille', 'fa-hashtag', link.textContent.trim(), () => link.click(), 'section veille');
        });

        add('Actions', 'fa-download', 'Télécharger mon CV (PDF)', () =>
            download('documents/cv-mehdi-seghier.pdf', 'CV-Mehdi-Seghier-Alternance-ASR.pdf'), 'cv resume');
        add('Actions', 'fa-table-list', 'Télécharger le tableau de synthèse (PDF)', () =>
            download('documents/tableau-synthese-bts-sio-sisr-mehdi-seghier.pdf', 'Tableau-synthese-BTS-SIO-SISR-Mehdi-Seghier.pdf'),
            'synthese bts annexe');
        add('Actions', 'fa-copy', 'Copier mon adresse e-mail', () => {
            const mail = 'Pro.M.seghier@outlook.fr';
            if (navigator.clipboard) navigator.clipboard.writeText(mail).then(() => toast('Adresse copiée : ' + mail));
            else window.location.href = 'mailto:' + mail;
        }, 'email mail courriel');
        add('Actions', 'fa-circle-half-stroke', 'Basculer le thème clair / sombre', () => {
            const t = document.getElementById('theme-toggle');
            if (t) t.click();
        }, 'theme dark light mode nuit jour');
        add('Actions', 'fa-cube', 'Activer / couper la 3D (mode performance)', () => {
            const on = window.portfolioFx.toggle();
            toast(on ? '3D activée' : 'Mode performance : 3D coupée');
        }, '3d webgl performance animation globe');
        add('Actions', 'fa-arrows-spin', 'Faire tourner la scène 3D', () => {
            if (window.portfolio3D) window.portfolio3D.spin();
        }, 'spin globe lattice');
        add('Actions', 'fa-terminal', 'Ouvrir le terminal', () => {
            const t = document.getElementById('terminal-toggle');
            if (t) t.click();
        }, 'bash console commande');
        add('Actions', 'fa-github', 'Voir mon GitHub', () => {
            window.open('https://github.com/mehdiseg', '_blank', 'noopener');
        }, 'code depot');
        return items;
    };

    // Petite notification éphémère
    let toastEl = null;
    let toastTimer = null;
    const toast = (msg) => {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'v2-toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('is-on');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 2400);
    };

    const palette = document.createElement('div');
    palette.className = 'cmdk';
    palette.hidden = true;
    palette.innerHTML =
        '<div class="cmdk-overlay" data-cmdk-close></div>' +
        '<div class="cmdk-dialog" role="dialog" aria-modal="true" aria-label="Palette de commandes">' +
        '<div class="cmdk-search"><i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
        '<input type="text" class="cmdk-input" role="combobox" aria-expanded="true" aria-controls="cmdk-list" ' +
        'aria-autocomplete="list" placeholder="Rechercher une section, un projet, une action…" autocomplete="off" spellcheck="false">' +
        '<kbd>Échap</kbd></div>' +
        '<ul class="cmdk-list" id="cmdk-list" role="listbox"></ul>' +
        '<div class="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span><span><kbd>Entrée</kbd> ouvrir</span>' +
        '<span><kbd>' + (isMac ? '⌘' : 'Ctrl') + '</kbd><kbd>K</kbd> ouvrir / fermer</span></div>' +
        '</div>';
    document.body.appendChild(palette);

    const input = palette.querySelector('.cmdk-input');
    const list = palette.querySelector('.cmdk-list');
    let items = [];
    let shown = [];
    let active = 0;
    let lastFocus = null;

    const render = () => {
        const q = norm(input.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        shown = items.filter((it) => {
            const hay = norm(it.label + ' ' + it.group + ' ' + it.keywords);
            return words.every((w) => hay.includes(w));
        });
        if (active >= shown.length) active = Math.max(shown.length - 1, 0);
        list.innerHTML = '';
        if (!shown.length) {
            const li = document.createElement('li');
            li.className = 'cmdk-empty';
            li.textContent = 'Aucun résultat';
            list.appendChild(li);
            input.removeAttribute('aria-activedescendant');
            return;
        }
        let group = '';
        shown.forEach((it, i) => {
            if (it.group !== group) {
                group = it.group;
                const g = document.createElement('li');
                g.className = 'cmdk-group';
                g.setAttribute('role', 'presentation');
                g.textContent = group;
                list.appendChild(g);
            }
            const li = document.createElement('li');
            li.className = 'cmdk-item' + (i === active ? ' is-active' : '');
            li.id = 'cmdk-opt-' + i;
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', String(i === active));
            const ic = document.createElement('i');
            ic.className = (it.icon === 'fa-github' || it.icon === 'fa-raspberry-pi' ? 'fab ' : 'fas ') + it.icon;
            ic.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.textContent = it.label;
            li.append(ic, label);
            li.addEventListener('mousemove', () => {
                if (active === i) return;
                active = i;
                syncActive();
            });
            li.addEventListener('click', () => runItem(i));
            list.appendChild(li);
        });
        syncActive();
    };

    const syncActive = () => {
        list.querySelectorAll('.cmdk-item').forEach((el) => {
            const on = el.id === 'cmdk-opt-' + active;
            el.classList.toggle('is-active', on);
            el.setAttribute('aria-selected', String(on));
            if (on) {
                input.setAttribute('aria-activedescendant', el.id);
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    const openPalette = () => {
        if (!palette.hidden) return;
        items = buildItems();
        lastFocus = document.activeElement;
        palette.hidden = false;
        input.value = '';
        active = 0;
        render();
        window.setTimeout(() => input.focus(), 20);
    };
    const closePalette = (restoreFocus) => {
        if (palette.hidden) return;
        palette.hidden = true;
        if (restoreFocus !== false && lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const runItem = (i) => {
        const it = shown[i];
        if (!it) return;
        closePalette(false);
        it.run();
    };

    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(shown.length, 1); syncActive(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(shown.length, 1); syncActive(); }
        else if (e.key === 'Enter') { e.preventDefault(); runItem(active); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePalette(); }
        else if (e.key === 'Tab') { e.preventDefault(); }
    });
    palette.querySelectorAll('[data-cmdk-close]').forEach((el) => el.addEventListener('click', () => closePalette()));

    document.addEventListener('keydown', (e) => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable);
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (palette.hidden) openPalette(); else closePalette();
        } else if (e.key === '/' && !typing && palette.hidden) {
            e.preventDefault();
            openPalette();
        }
    });

    if (navActions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-search';
        btn.setAttribute('aria-label', 'Ouvrir la palette de commandes');
        btn.innerHTML = '<i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
            '<span class="nav-search-kbd"><kbd>' + (isMac ? '⌘' : 'Ctrl') + '</kbd><kbd>K</kbd></span>';
        btn.addEventListener('click', openPalette);
        navActions.insertBefore(btn, navActions.firstChild);
    }

    window.portfolioPalette = { open: openPalette };
})();
