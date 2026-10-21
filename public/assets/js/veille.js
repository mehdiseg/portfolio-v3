/* =========================================================
   Script spécifique à la page de veille technologique
   - Barre de progression de lecture
   - Sommaire latéral : surbrillance de la section en cours
   - Ouverture des questions/réponses avant impression
   ========================================================= */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const readingBar = document.getElementById('reading-bar');
    const tocLinks = Array.from(document.querySelectorAll('.toc-list a'));
    const sections = tocLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    // ===== BARRE DE PROGRESSION DE LECTURE =====
    const updateReadingBar = () => {
        if (!readingBar) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        readingBar.style.width = Math.min(100, Math.max(0, ratio)) + '%';
    };

    // ===== SOMMAIRE LATÉRAL : section active =====
    // IntersectionObserver quand c'est possible, repli sur le scroll sinon.
    const setActiveLink = (id) => {
        tocLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
    };

    if (sections.length && 'IntersectionObserver' in window) {
        const visible = new Map();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visible.set(entry.target.id, entry.intersectionRatio);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            if (visible.size) {
                // La section active est la plus haute parmi celles visibles
                const firstVisible = sections.find((section) => visible.has(section.id));
                if (firstVisible) setActiveLink(firstVisible.id);
            }
        }, {
            rootMargin: '-88px 0px -55% 0px',
            threshold: 0
        });

        sections.forEach((section) => observer.observe(section));
    }

    // ===== ECOUTE DU SCROLL (throttlée par requestAnimationFrame) =====
    let scheduled = false;
    window.addEventListener('scroll', () => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            updateReadingBar();
            scheduled = false;
        });
    }, { passive: true });

    window.addEventListener('resize', updateReadingBar, { passive: true });
    updateReadingBar();

    // Section active dès le chargement si l'URL contient déjà une ancre
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target && target.id) setActiveLink(target.id);
    }

    // ===== DÉFILEMENT DOUX VERS LES ANCRES =====
    // (utile pour mettre à jour l'ancre dans l'URL sans saut brutal)
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            history.replaceState(null, '', href);

            // Rend la cible focusable pour la navigation au clavier
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
        });
    });

    // ===== IMPRESSION : ouvrir toutes les réponses de la FAQ =====
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    let reopenAfterPrint = [];

    window.addEventListener('beforeprint', () => {
        reopenAfterPrint = faqItems.filter((item) => !item.open);
        reopenAfterPrint.forEach((item) => { item.open = true; });
    });

    window.addEventListener('afterprint', () => {
        reopenAfterPrint.forEach((item) => { item.open = false; });
        reopenAfterPrint = [];
    });
})();
