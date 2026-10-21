/* =========================================================
   V2 — Scène 3D (Three.js r128) : globe réseau interactif
   Fond fixe derrière tout le site : le globe se cale sur
   .hero-visual, puis glisse en arrière-plan au défilement.
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    // ----- Palette synchronisée avec les variables CSS -----
    const isLight = () => root.getAttribute('data-theme') === 'light';
    const cssVar = (name, fallback) =>
        getComputedStyle(root).getPropertyValue(name).trim() || fallback;
    const colA = new THREE.Color();
    const colB = new THREE.Color();
    const readPalette = () => {
        colA.set(cssVar('--accent-color', '#7c6cff'));
        colB.set(cssVar('--accent-2', '#22d3ee'));
    };
    readPalette();

    // Matériaux suivis : couleur / mode de fusion selon le thème, opacité selon le scroll
    const tracked = [];
    const track = (m, color, base, globe) => {
        tracked.push({ m, color, base, globe });
        return m;
    };

    const spriteTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.25, 'rgba(255,255,255,0.8)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    })();

    const R = 1.6;
    const globe = new THREE.Group();   // position + échelle
    const tilt = new THREE.Group();    // inclinaison (axe + glisser vertical)
    const spinner = new THREE.Group(); // rotation propre
    tilt.add(spinner);
    globe.add(tilt);
    scene.add(globe);

    // ----- Points du globe : "continents" procéduraux + océan clairsemé -----
    const blob = (x, y, z) =>
        Math.sin(x * 2.7 + 1.3) * Math.cos(y * 3.1 - 0.4)
        + Math.sin(z * 2.3 + y * 1.7 + 2.1) * 0.8
        + Math.cos(x * 4.1 - z * 3.3) * 0.35;
    const LAND = 0.25;

    const CANDIDATES = small ? 2800 : 5600;
    const dotPos = [];
    const dotRnd = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < CANDIDATES; i++) {
        const y = 1 - (i / (CANDIDATES - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        const x = Math.cos(th) * rad;
        const z = Math.sin(th) * rad;
        const land = blob(x, y, z) > LAND;
        if (land || Math.random() < 0.07) {
            dotPos.push(x * R, y * R, z * R);
            dotRnd.push(land ? 0.05 + Math.random() : -0.05 - Math.random());
        }
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPos, 3));
    dotGeo.setAttribute('aRand', new THREE.Float32BufferAttribute(dotRnd, 1));

    const dotMat = track(new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 3.1 },
            uPR: { value: renderer.getPixelRatio() },
            uScale: { value: 1 },
            uA: { value: colA },
            uB: { value: colB },
            uOpacity: { value: 1 }
        },
        vertexShader: [
            'uniform float uTime; uniform float uSize; uniform float uPR; uniform float uScale;',
            'attribute float aRand;',
            'varying float vFacing; varying float vY;',
            'void main() {',
            '  vec3 n = normalize(normalMatrix * normalize(position));',
            '  vFacing = n.z;',
            '  vY = position.y;',
            '  float r = abs(aRand);',
            '  float s = aRand < 0.0 ? 0.55 : 1.0;',
            '  float tw = 0.7 + 0.3 * sin(uTime * 1.6 + r * 40.0);',
            '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
            '  gl_PointSize = uSize * uPR * uScale * s * tw * (9.0 / -mv.z);',
            '  gl_Position = projectionMatrix * mv;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uA; uniform vec3 uB; uniform float uOpacity;',
            'varying float vFacing; varying float vY;',
            'void main() {',
            '  float d = length(gl_PointCoord - 0.5);',
            '  if (d > 0.5) discard;',
            '  float a = smoothstep(0.5, 0.05, d);',
            '  float face = mix(0.1, 1.0, smoothstep(-0.35, 0.55, vFacing));',
            '  vec3 col = mix(uA, uB, clamp(vY * 0.32 + 0.5, 0.0, 1.0));',
            '  gl_FragColor = vec4(col, a * face * uOpacity);',
            '}'
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), null, 1, true);
    spinner.add(new THREE.Points(dotGeo, dotMat));

    // ----- Maillage filaire + noyau + halo atmosphérique -----
    const wireMat = track(new THREE.LineBasicMaterial({
        color: colA, transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'a', 0.045, true);
    spinner.add(new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R * 1.003, 2)), wireMat));

    const coreMat = track(new THREE.MeshBasicMaterial({
        color: colA, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'a', 0.05, true);
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), coreMat));

    const atmoMat = track(new THREE.ShaderMaterial({
        uniforms: { uColor: { value: colA }, uOpacity: { value: 1 } },
        vertexShader: [
            'varying vec3 vN; varying vec3 vV;',
            'void main() {',
            '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
            '  vN = normalize(normalMatrix * normal);',
            '  vV = normalize(-mv.xyz);',
            '  gl_Position = projectionMatrix * mv;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform vec3 uColor; uniform float uOpacity;',
            'varying vec3 vN; varying vec3 vV;',
            'void main() {',
            '  float f = pow(1.0 - abs(dot(vN, vV)), 2.6);',
            '  gl_FragColor = vec4(uColor, f * 0.85 * uOpacity);',
            '}'
        ].join('\n'),
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), null, 1, true);
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 48, 48), atmoMat));

    // ----- Nœuds réseau + arcs de données + paquets -----
    const randUnit = () => {
        const u = Math.random() * 2 - 1;
        const t = Math.random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        return new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t));
    };

    const NODE_COUNT = small ? 12 : 18;
    const nodes = [];
    for (let tries = 0; nodes.length < NODE_COUNT && tries < 4000; tries++) {
        const v = randUnit();
        if (blob(v.x, v.y, v.z) > LAND && nodes.every((n) => n.angleTo(v) > 0.4)) nodes.push(v);
    }

    const nodeMat = track(new THREE.PointsMaterial({
        color: colB, size: 0.1, map: spriteTex, transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), 'b', 1, true);
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes.map((n) => n.clone().multiplyScalar(R * 1.006)));
    spinner.add(new THREE.Points(nodeGeo, nodeMat));

    const ringGeo = new THREE.RingGeometry(0.03, 0.045, 32);
    const rings = nodes.map((n) => {
        const m = track(new THREE.MeshBasicMaterial({
            color: colB, transparent: true, side: THREE.DoubleSide, depthWrite: false,
            blending: THREE.AdditiveBlending
        }), 'b', 1, false);
        const mesh = new THREE.Mesh(ringGeo, m);
        mesh.position.copy(n).multiplyScalar(R * 1.008);
        mesh.lookAt(n.clone().multiplyScalar(R * 3));
        spinner.add(mesh);
        return { mesh, m, phase: Math.random() };
    });

    const arcBaseMat = track(new THREE.LineBasicMaterial({
        color: colA, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'a', 0.16, true);
    const trailMat = track(new THREE.LineBasicMaterial({
        color: colB, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending
    }), 'b', 0.95, true);

    const SEG = 72;
    const arcs = [];
    nodes.forEach((a, i) => {
        const links = 1 + (i % 2);
        for (let k = 0; k < links; k++) {
            const b = nodes[(i + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length];
            const ang = a.angleTo(b);
            if (ang < 0.45 || ang > 2.3) continue;
            const mid = a.clone().add(b).normalize().multiplyScalar(R * (1.06 + ang * 0.24));
            const curve = new THREE.QuadraticBezierCurve3(
                a.clone().multiplyScalar(R), mid, b.clone().multiplyScalar(R));
            const pts = curve.getPoints(SEG);
            spinner.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcBaseMat));
            const trailGeo = new THREE.BufferGeometry().setFromPoints(pts);
            trailGeo.setDrawRange(0, 0);
            spinner.add(new THREE.Line(trailGeo, trailMat));
            arcs.push({ pts, trailGeo, phase: Math.random() * 1.5, speed: 0.16 + Math.random() * 0.22 });
        }
    });

    const packetPos = new Float32Array(Math.max(arcs.length, 1) * 3);
    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    const packetMat = track(new THREE.PointsMaterial({
        color: 0xffffff, size: 0.12, map: spriteTex, transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), null, 1, true);
    spinner.add(new THREE.Points(packetGeo, packetMat));

    // ----- Orbites "satellites" -----
    const orbitMat = track(new THREE.LineDashedMaterial({
        color: colA, dashSize: 0.07, gapSize: 0.06, transparent: true, opacity: 0.45, depthWrite: false
    }), 'a', 0.45, true);
    const satMat = track(new THREE.PointsMaterial({
        color: colB, size: 0.16, map: spriteTex, transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), 'b', 1, true);

    const makeOrbit = (radius, rx, rz, speed) => {
        const g = new THREE.Group();
        g.rotation.set(rx, 0, rz);
        const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0)
            .getPoints(200).map((p) => new THREE.Vector3(p.x, 0, p.y));
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat);
        line.computeLineDistances();
        const satGeo = new THREE.BufferGeometry();
        satGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
        const sat = new THREE.Points(satGeo, satMat);
        g.add(line, sat);
        tilt.add(g);
        return { sat, radius, speed, angle: Math.random() * Math.PI * 2 };
    };
    const orbits = [
        makeOrbit(R * 1.42, 1.25, 0.3, 0.45),
        makeOrbit(R * 1.68, 1.9, -0.5, -0.3)
    ];

    // ----- Champ d'étoiles + formes filaires (profondeur au scroll) -----
    const STAR = small ? 700 : 1500;
    const starPos = new Float32Array(STAR * 3);
    const starMix = new Float32Array(STAR);
    const starCol = new Float32Array(STAR * 3);
    for (let i = 0; i < STAR; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 60;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 44;
        starPos[i * 3 + 2] = -Math.random() * 40 + 2;
        starMix[i] = Math.random();
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const paintStars = () => {
        const tmp = new THREE.Color();
        const white = new THREE.Color(isLight() ? 0x1a1a3a : 0xffffff);
        for (let i = 0; i < STAR; i++) {
            const m = starMix[i];
            if (m < 0.4) tmp.copy(colA).lerp(white, 0.2);
            else if (m < 0.75) tmp.copy(colB).lerp(white, 0.2);
            else tmp.copy(white);
            tmp.multiplyScalar(0.45 + (m * 7919 % 1) * 0.55);
            starCol[i * 3] = tmp.r;
            starCol[i * 3 + 1] = tmp.g;
            starCol[i * 3 + 2] = tmp.b;
        }
        starGeo.attributes.color.needsUpdate = true;
    };
    paintStars();
    const starMat = track(new THREE.PointsMaterial({
        size: 0.09, map: spriteTex, vertexColors: true, transparent: true, opacity: 0.85,
        depthWrite: false, blending: THREE.AdditiveBlending
    }), null, 0.85, false);
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const shapeMatA = track(new THREE.LineBasicMaterial({
        color: colA, transparent: true, opacity: 0.4, depthWrite: false
    }), 'a', 0.4, false);
    const shapeMatB = track(new THREE.LineBasicMaterial({
        color: colB, transparent: true, opacity: 0.35, depthWrite: false
    }), 'b', 0.35, false);
    const SHAPE_SPAN = 16;
    const shapes = [
        new THREE.OctahedronGeometry(0.5),
        new THREE.IcosahedronGeometry(0.45),
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.TetrahedronGeometry(0.55),
        new THREE.OctahedronGeometry(0.35),
        new THREE.IcosahedronGeometry(0.3),
        new THREE.BoxGeometry(0.42, 0.42, 0.42),
        new THREE.TetrahedronGeometry(0.4)
    ].map((geo, i) => {
        const mesh = new THREE.LineSegments(new THREE.EdgesGeometry(geo), i % 2 ? shapeMatB : shapeMatA);
        const side = i % 2 ? 1 : -1;
        mesh.userData = {
            x: side * (2.2 + Math.random() * 4.5),
            y: (i / 8) * SHAPE_SPAN - SHAPE_SPAN / 2 + Math.random(),
            z: -1.5 - Math.random() * 7,
            rs: (Math.random() - 0.5) * 0.8,
            bob: Math.random() * Math.PI * 2
        };
        scene.add(mesh);
        return mesh;
    });

    // ----- Thème -----
    const applyTheme = () => {
        readPalette();
        const light = isLight();
        tracked.forEach(({ m, color }) => {
            if (color === 'a' && m.color) m.color.copy(colA);
            if (color === 'b' && m.color) m.color.copy(colB);
            const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
            if (m.blending !== blend && m !== orbitMat && m !== shapeMatA && m !== shapeMatB) {
                m.blending = blend;
                m.needsUpdate = true;
            }
        });
        packetMat.color.set(light ? colB : 0xffffff);
        paintStars();
        needsRender = true;
    };

    // ----- Placement : suit .hero-visual puis passe en "ambiance" -----
    const home = { cx: window.innerWidth * 0.7, docCy: window.innerHeight * 0.5, size: window.innerHeight * 0.6, heroH: window.innerHeight };
    const measure = () => {
        const el = document.querySelector('.hero-visual');
        const hero = document.getElementById('home');
        if (el) {
            const r = el.getBoundingClientRect();
            home.cx = r.left + r.width / 2;
            home.docCy = r.top + window.scrollY + r.height / 2;
            home.size = Math.min(r.width, r.height);
        }
        if (hero) home.heroH = hero.offsetHeight;
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const smooth = (e0, e1, x) => {
        const t = clamp((x - e0) / (e1 - e0), 0, 1);
        return t * t * (3 - 2 * t);
    };

    const state = {
        pitch: 0.28, velYaw: 0, mx: 0, my: 0, camX: 0, camY: 0,
        gx: 0, gy: 0, gs: 0, fade: 1, scrollY: window.scrollY, lastScroll: window.scrollY
    };
    const AUTO = reduced ? 0 : 0.14;
    let dragging = false;
    let needsRender = true;

    const target = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        const visW = visH * camera.aspect;
        const sy = state.scrollY;
        const desktop = vw > 900;
        const p = smooth(0.2, 0.95, sy / Math.max(home.heroH, 1));
        const px = lerp(home.cx, desktop ? vw * 0.82 : vw * 0.5, p);
        const py = lerp(home.docCy - sy, desktop ? vh * 0.56 : vh * 0.45, p);
        const ps = lerp(home.size, desktop ? vh * 0.7 : Math.min(vw * 1.05, vh * 0.65), p);
        const booting = root.classList.contains('is-booting');
        return {
            x: (px / vw - 0.5) * visW,
            y: -(py / vh - 0.5) * visH,
            s: booting ? 0.001 : (ps * 0.64 * (visH / vh)) / (2 * R),
            fade: lerp(1, 0.38, p)
        };
    };

    const clock = new THREE.Clock();
    let time = 0;
    let raf = null;

    const frame = () => {
        raf = window.requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        if (!reduced) time += dt;

        const t = target();
        const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
        const moved = Math.abs(t.x - state.gx) + Math.abs(t.y - state.gy) + Math.abs(t.s - state.gs) > 0.0005;
        state.gx = lerp(state.gx, t.x, k);
        state.gy = lerp(state.gy, t.y, k);
        state.gs = lerp(state.gs, t.s, k);
        state.fade = lerp(state.fade, t.fade, k);

        if (reduced && !needsRender && !moved && !dragging) return;
        needsRender = false;

        globe.position.set(state.gx, state.gy, 0);
        globe.scale.setScalar(Math.max(state.gs, 0.001));

        // Rotation : auto + inertie du glisser + couplage au scroll
        if (!dragging) {
            state.velYaw = reduced ? 0 : lerp(state.velYaw, AUTO, 1 - Math.exp(-dt * 1.2));
        }
        const scrollDelta = state.scrollY - state.lastScroll;
        state.lastScroll = state.scrollY;
        if (!dragging) spinner.rotation.y += state.velYaw * dt + (reduced ? 0 : scrollDelta * 0.0012);

        tilt.rotation.x = state.pitch + state.my * 0.12;
        tilt.rotation.z = 0.32 - state.mx * 0.1;

        // Caméra : léger parallaxe souris
        state.camX = lerp(state.camX, state.mx * 0.45, k);
        state.camY = lerp(state.camY, -state.my * 0.3, k);
        camera.position.x = state.camX;
        camera.position.y = state.camY;
        camera.lookAt(0, 0, 0);

        // Opacités (le globe s'efface quand on quitte le hero)
        const light = isLight();
        const lightBoost = light ? 1.15 : 1;
        tracked.forEach((e) => {
            const v = Math.min(e.base * (e.globe ? state.fade : 1) * lightBoost, 1);
            if (e.m.uniforms && e.m.uniforms.uOpacity) e.m.uniforms.uOpacity.value = v;
            else e.m.opacity = v;
        });
        dotMat.uniforms.uTime.value = time;
        dotMat.uniforms.uScale.value = clamp(state.gs, 0.4, 1.6);

        // Arcs : une "comète" parcourt chaque liaison, un paquet en tête
        arcs.forEach((a, i) => {
            if (reduced) {
                a.trailGeo.setDrawRange(0, SEG + 1);
                const p = a.pts[SEG >> 1];
                packetPos[i * 3] = p.x; packetPos[i * 3 + 1] = p.y; packetPos[i * 3 + 2] = p.z;
                return;
            }
            const cyc = (time * a.speed + a.phase) % 1.5;
            const head = Math.floor(clamp(cyc, 0, 1) * SEG);
            const tail = Math.floor(clamp(cyc - 0.38, 0, 1) * SEG);
            a.trailGeo.setDrawRange(tail, Math.max(head - tail + 1, 0));
            const p = a.pts[head];
            packetPos[i * 3] = p.x; packetPos[i * 3 + 1] = p.y; packetPos[i * 3 + 2] = p.z;
        });
        packetGeo.attributes.position.needsUpdate = true;

        rings.forEach((r) => {
            const s = reduced ? 0.3 : (time * 0.55 + r.phase) % 1;
            r.mesh.scale.setScalar(1 + s * 1.8);
            r.m.opacity = (1 - s) * 0.85 * state.fade;
        });

        orbits.forEach((o) => {
            o.angle += o.speed * dt * (reduced ? 0 : 1);
            o.sat.position.set(Math.cos(o.angle) * o.radius, 0, Math.sin(o.angle) * o.radius);
        });

        // Formes : défilent avec la page (boucle verticale) pour donner de la profondeur
        const scrollWorld = state.scrollY / window.innerHeight;
        shapes.forEach((m) => {
            const u = m.userData;
            const depthFactor = 1.4 + (-u.z) * 0.12;
            let y = u.y + scrollWorld * depthFactor + Math.sin(time * 0.6 + u.bob) * 0.15;
            y = ((y + SHAPE_SPAN / 2) % SHAPE_SPAN + SHAPE_SPAN) % SHAPE_SPAN - SHAPE_SPAN / 2;
            m.position.set(u.x, y, u.z);
            m.rotation.x += u.rs * dt;
            m.rotation.y += u.rs * dt * 0.7;
        });
        stars.position.y = scrollWorld * 0.6;
        stars.rotation.y = time * 0.006;

        renderer.render(scene, camera);
    };

    const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        dotMat.uniforms.uPR.value = renderer.getPixelRatio();
        measure();
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

    // ----- Interactions -----
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('load', () => { measure(); needsRender = true; });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

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

    const dragZone = document.querySelector('.hero-visual');
    if (dragZone) {
        let lastX = 0;
        let lastY = 0;
        let lastT = 0;
        dragZone.addEventListener('pointerdown', (e) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            lastT = performance.now();
            dragZone.setPointerCapture(e.pointerId);
            dragZone.classList.add('is-dragging');
        });
        dragZone.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const now = performance.now();
            const dts = Math.max((now - lastT) / 1000, 0.001);
            spinner.rotation.y += dx * 0.006;
            state.pitch = clamp(state.pitch + dy * 0.004, -0.8, 0.9);
            state.velYaw = clamp((dx * 0.006) / dts, -6, 6);
            lastX = e.clientX;
            lastY = e.clientY;
            lastT = now;
            needsRender = true;
        });
        const end = () => {
            if (!dragging) return;
            dragging = false;
            dragZone.classList.remove('is-dragging');
            if (reduced) state.velYaw = 0;
        };
        dragZone.addEventListener('pointerup', end);
        dragZone.addEventListener('pointercancel', end);
        dragZone.addEventListener('lostpointercapture', end);
    }

    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
    });

    // Easter egg pour le terminal : commande "spin"
    window.portfolio3D = {
        spin() {
            if (reduced) {
                spinner.rotation.y += Math.PI;
                needsRender = true;
            } else {
                state.velYaw += 9;
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
