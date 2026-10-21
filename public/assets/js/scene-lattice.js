/* =========================================================
   V2 — Fond 3D de la veille : réseau euclidien (lattice)
   Les points bruités + vecteurs d'erreur illustrent le
   problème LWE sur lequel reposent ML-KEM et ML-DSA.
   ========================================================= */

(function () {
    'use strict';

    const canvas = document.getElementById('scene3d');
    if (!canvas) return;
    const root = document.documentElement;

    const fail = () => root.classList.add('no-webgl');
    if (typeof window.THREE === 'undefined') { fail(); return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas, antialias: !coarse, alpha: true, powerPreference: 'high-performance'
        });
    } catch (e) { fail(); return; }
    if (!renderer.getContext()) { fail(); return; }
    root.classList.add('has-webgl');

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    scene.fog = new THREE.Fog(0x06060d, 7, 21);

    const isLight = () => root.getAttribute('data-theme') === 'light';
    const cssVar = (name, fallback) =>
        getComputedStyle(root).getPropertyValue(name).trim() || fallback;
    const colA = new THREE.Color();
    const colB = new THREE.Color();
    const readPalette = () => {
        colA.set(cssVar('--accent-color', '#7c6cff'));
        colB.set(cssVar('--accent-2', '#22d3ee'));
        scene.fog.color.set(cssVar('--bg-color', '#06060d'));
    };
    readPalette();

    const sprite = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.3, 'rgba(255,255,255,0.75)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    })();

    const tracked = [];
    const track = (m, color, base) => {
        tracked.push({ m, color, base });
        return m;
    };

    // ----- Réseau : base non orthogonale (c'est ce qui en fait un "lattice" intéressant) -----
    const N = small ? 5 : 7;
    const S = 1.2;
    const b1 = new THREE.Vector3(1, 0.18, 0.05).multiplyScalar(S);
    const b2 = new THREE.Vector3(0.22, 1, 0.12).multiplyScalar(S);
    const b3 = new THREE.Vector3(0.12, 0.28, 1).multiplyScalar(S);
    const half = (N - 1) / 2;
    const idx = (i, j, k) => (i * N + j) * N + k;

    const nodes = [];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            for (let k = 0; k < N; k++) {
                nodes.push(new THREE.Vector3()
                    .addScaledVector(b1, i - half)
                    .addScaledVector(b2, j - half)
                    .addScaledVector(b3, k - half));
            }
        }
    }

    const neighbors = nodes.map(() => []);
    const edgePos = [];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            for (let k = 0; k < N; k++) {
                const a = idx(i, j, k);
                [[i + 1, j, k], [i, j + 1, k], [i, j, k + 1]].forEach(([x, y, z]) => {
                    if (x >= N || y >= N || z >= N) return;
                    const b = idx(x, y, z);
                    neighbors[a].push(b);
                    neighbors[b].push(a);
                    edgePos.push(nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z);
                });
            }
        }
    }

    const lattice = new THREE.Group();
    scene.add(lattice);

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
    const edgeMat = track(new THREE.LineBasicMaterial({
        color: colA, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'a', 0.16);
    lattice.add(new THREE.LineSegments(edgeGeo, edgeMat));

    const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes);
    const nodeMat = track(new THREE.PointsMaterial({
        color: colA, size: 0.16, map: sprite, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), 'a', 0.95);
    lattice.add(new THREE.Points(nodeGeo, nodeMat));

    // ----- Points bruités + vecteurs d'erreur (illustration de LWE) -----
    const gauss = () => {
        const u = 1 - Math.random();
        const v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const noisy = [];
    nodes.forEach((p, i) => {
        if (Math.random() > 0.32) return;
        const e = new THREE.Vector3(gauss(), gauss(), gauss()).multiplyScalar(0.16);
        noisy.push({ i, e, phase: Math.random() * Math.PI * 2 });
    });
    const noisyPos = new Float32Array(noisy.length * 3);
    const errPos = new Float32Array(noisy.length * 6);
    const noisyGeo = new THREE.BufferGeometry();
    noisyGeo.setAttribute('position', new THREE.BufferAttribute(noisyPos, 3));
    const errGeo = new THREE.BufferGeometry();
    errGeo.setAttribute('position', new THREE.BufferAttribute(errPos, 3));
    const noisyMat = track(new THREE.PointsMaterial({
        color: colB, size: 0.13, map: sprite, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), 'b', 0.95);
    const errMat = track(new THREE.LineBasicMaterial({
        color: colB, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'b', 0.6);
    lattice.add(new THREE.Points(noisyGeo, noisyMat));
    lattice.add(new THREE.LineSegments(errGeo, errMat));

    const updateNoise = (t) => {
        noisy.forEach((n, k) => {
            const p = nodes[n.i];
            const amp = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.3 + n.phase);
            const x = p.x + n.e.x * amp;
            const y = p.y + n.e.y * amp;
            const z = p.z + n.e.z * amp;
            noisyPos[k * 3] = x; noisyPos[k * 3 + 1] = y; noisyPos[k * 3 + 2] = z;
            errPos[k * 6] = p.x; errPos[k * 6 + 1] = p.y; errPos[k * 6 + 2] = p.z;
            errPos[k * 6 + 3] = x; errPos[k * 6 + 4] = y; errPos[k * 6 + 5] = z;
        });
        noisyGeo.attributes.position.needsUpdate = true;
        errGeo.attributes.position.needsUpdate = true;
    };

    // ----- Paquets qui se déplacent d'un nœud voisin à l'autre -----
    const PACKETS = small ? 10 : 18;
    const packets = Array.from({ length: PACKETS }, () => {
        const from = Math.floor(Math.random() * nodes.length);
        const list = neighbors[from];
        return {
            from,
            to: list[Math.floor(Math.random() * list.length)],
            t: Math.random(),
            speed: 0.45 + Math.random() * 0.5
        };
    });
    const packetPos = new Float32Array(PACKETS * 3);
    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    const packetMat = track(new THREE.PointsMaterial({
        color: 0xffffff, size: 0.22, map: sprite, transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), null, 1);
    lattice.add(new THREE.Points(packetGeo, packetMat));

    const tmp = new THREE.Vector3();
    const updatePackets = (dt) => {
        packets.forEach((p, k) => {
            p.t += dt * p.speed;
            if (p.t >= 1) {
                p.t -= 1;
                const prev = p.from;
                p.from = p.to;
                const options = neighbors[p.from].filter((n) => n !== prev);
                const list = options.length ? options : neighbors[p.from];
                p.to = list[Math.floor(Math.random() * list.length)];
            }
            tmp.copy(nodes[p.from]).lerp(nodes[p.to], p.t);
            packetPos[k * 3] = tmp.x; packetPos[k * 3 + 1] = tmp.y; packetPos[k * 3 + 2] = tmp.z;
        });
        packetGeo.attributes.position.needsUpdate = true;
    };

    // ----- Poussière d'étoiles -----
    const STAR = small ? 500 : 1100;
    const starPos = new Float32Array(STAR * 3);
    for (let i = 0; i < STAR; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 60;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 44;
        starPos[i * 3 + 2] = -Math.random() * 30 - 4;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = track(new THREE.PointsMaterial({
        color: colB, size: 0.1, map: sprite, transparent: true, opacity: 0.55,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false
    }), 'b', 0.55);
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ----- Thème -----
    let needsRender = true;
    const applyTheme = () => {
        readPalette();
        const light = isLight();
        tracked.forEach(({ m, color }) => {
            if (color === 'a') m.color.copy(colA);
            if (color === 'b') m.color.copy(colB);
            const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
            if (m.blending !== blend) {
                m.blending = blend;
                m.needsUpdate = true;
            }
        });
        packetMat.color.set(light ? colB : 0xffffff);
        needsRender = true;
    };

    // ----- Boucle -----
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (e0, e1, x) => {
        const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
        return t * t * (3 - 2 * t);
    };
    const hero = document.querySelector('.veille-hero');
    const state = {
        mx: 0, my: 0, camX: 0, camY: 0, fade: 0, scale: 0.6,
        scrollY: window.scrollY, lastScroll: window.scrollY, spin: 0
    };

    const clock = new THREE.Clock();
    let time = 0;
    let raf = null;

    const frame = () => {
        raf = window.requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        if (!reduced) time += dt;

        const heroH = hero ? hero.offsetHeight : window.innerHeight;
        const p = smooth(0.15, 0.9, state.scrollY / Math.max(heroH, 1));
        const targetFade = lerp(1, isLight() ? 0.5 : 0.42, p);
        const k = reduced ? 1 : 1 - Math.exp(-dt * 3.5);
        state.fade = lerp(state.fade, targetFade, k);
        state.scale = lerp(state.scale, 1, k);

        const scrollDelta = state.scrollY - state.lastScroll;
        state.lastScroll = state.scrollY;

        if (reduced && !needsRender) return;
        needsRender = false;

        state.spin = lerp(state.spin, 0, 1 - Math.exp(-dt * 0.8));
        lattice.rotation.y += (reduced ? 0 : dt * 0.07) + scrollDelta * (reduced ? 0 : 0.0007) + state.spin * dt;
        lattice.rotation.x = 0.42 + state.my * 0.12 + (reduced ? 0 : Math.sin(time * 0.2) * 0.05);
        lattice.rotation.z = -0.12 - state.mx * 0.06;
        lattice.scale.setScalar(state.scale);
        lattice.position.x = window.innerWidth > 1000 ? lerp(2.2, 3.4, p) : 0;
        lattice.position.y = lerp(0.2, -0.4, p);

        state.camX = lerp(state.camX, state.mx * 0.6, k);
        state.camY = lerp(state.camY, -state.my * 0.4, k);
        camera.position.x = state.camX;
        camera.position.y = state.camY;
        camera.lookAt(0, 0, 0);

        tracked.forEach((e) => { e.m.opacity = Math.min(e.base * state.fade * (isLight() ? 1.1 : 1), 1); });

        updateNoise(time);
        if (!reduced) updatePackets(dt);
        stars.position.y = (state.scrollY / window.innerHeight) * 0.5;

        renderer.render(scene, camera);
    };

    const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        needsRender = true;
    };

    const start = () => {
        if (raf || root.classList.contains('fx-off')) return;
        clock.getDelta();
        needsRender = true;
        raf = window.requestAnimationFrame(frame);
    };
    const stop = () => {
        if (raf) window.cancelAnimationFrame(raf);
        raf = null;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', () => {
        state.scrollY = window.scrollY;
        needsRender = true;
    }, { passive: true });
    if (!reduced) {
        window.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            state.mx = (e.clientX / window.innerWidth) * 2 - 1;
            state.my = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
    }
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
    });

    window.portfolio3D = {
        spin() {
            if (reduced) {
                lattice.rotation.y += Math.PI / 2;
                needsRender = true;
            } else {
                state.spin += 8;
            }
        },
        setEnabled(on) {
            if (on) start(); else stop();
        }
    };

    applyTheme();
    resize();
    start();
})();
