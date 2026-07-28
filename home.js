// Hetansh Shah — Homepage 3D hero (Three.js)
// Buildless ES module. Imported via importmap in index.html.
// Degrades gracefully: if WebGL/Three fails, a CSS gradient orb shows instead.

import * as THREE from 'three';

(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;

  // WebGL capability check — mobile still gets the scene (it's lightweight),
  // just with a trimmed node/particle count and lower pixel ratio below.
  let gl = null;
  try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) { /* noop */ }
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
  } catch (e) {
    document.body.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ---- the floating data network (offset upper-right of the portrait) --
  // on mobile the portrait is centered with little room to its side, so the
  // network is centered behind/around it (halo) instead of offset to one side
  const pivot = new THREE.Group();
  pivot.position.set(isMobile ? 0 : 1.25, isMobile ? 0.1 : 0.62, isMobile ? -0.6 : 0);
  pivot.scale.setScalar(isMobile ? 0.95 : 0.9);
  scene.add(pivot);

  const group = new THREE.Group();
  pivot.add(group);

  const netColors = [0x6aa3ff, 0xb06aff, 0x4fe0d0, 0xb8ccff];
  const netNodes = [];

  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(isMobile ? 0.27 : 0.22, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x6aa3ff, emissive: 0x1a3a7a, emissiveIntensity: 1.1, metalness: 0.4, roughness: 0.25 })
  );
  group.add(hub);
  netNodes.push({ mesh: hub, pos: new THREE.Vector3(0, 0, 0), isHub: true });

  const nodeGeo = new THREE.SphereGeometry(isMobile ? 0.115 : 0.09, isMobile ? 10 : 16, isMobile ? 10 : 16);
  const nodeCount = isMobile ? 9 : 15;
  for (let i = 0; i < nodeCount; i++) {
    const r = 1.15 + Math.random() * 1.05;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const pos = new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
    const c = netColors[i % netColors.length];
    const mesh = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.3 }));
    mesh.position.copy(pos);
    group.add(mesh);
    netNodes.push({ mesh, pos, basePos: pos.clone(), phase: Math.random() * Math.PI * 2 });
  }

  const netLines = [];
  function makeNetLine(a, b, mat) {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    const l = new THREE.Line(g, mat);
    group.add(l);
    return l;
  }
  const hubLineMat = new THREE.LineBasicMaterial({ color: 0x6aa3ff, transparent: true, opacity: 0.28 });
  for (let i = 1; i < netNodes.length; i++) {
    netLines.push({ line: makeNetLine(netNodes[0].pos, netNodes[i].pos, hubLineMat), a: 0, b: i });
  }
  const crossLinkCount = isMobile ? 5 : 10;
  for (let i = 0; i < crossLinkCount; i++) {
    const a = 1 + Math.floor(Math.random() * nodeCount);
    const b = 1 + Math.floor(Math.random() * nodeCount);
    if (a !== b) {
      netLines.push({ line: makeNetLine(netNodes[a].pos, netNodes[b].pos, new THREE.LineBasicMaterial({ color: 0xb06aff, transparent: true, opacity: 0.14 })), a, b });
    }
  }

  // ---- particle field --------------------------------------------------
  const pCount = isMobile ? 160 : 380;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 4 + Math.random() * 6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x9ec2ff, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false
  }));
  scene.add(particles);

  // ---- lights ----------------------------------------------------------
  scene.add(new THREE.AmbientLight(0x2a3a5c, 0.7));
  const key = new THREE.PointLight(0x6aa3ff, 70, 50); key.position.set(6, 5, 6); scene.add(key);
  const violet = new THREE.PointLight(0xb06aff, 45, 50); violet.position.set(-6, -2, 3); scene.add(violet);
  const teal = new THREE.PointLight(0x4fe0d0, 35, 50); teal.position.set(0, -6, -2); scene.add(teal);

  // ---- resize ----------------------------------------------------------
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ---- pointer parallax ------------------------------------------------
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  // ---- render loop (pauses when tab hidden or scrolled out of view) ----
  const clock = new THREE.Clock();
  let running = true;
  let visible = true;
  let ticking = false;

  function tick() {
    if (!running || !visible) { ticking = false; return; }
    ticking = true;
    const t = clock.getElapsedTime();

    if (!reduce) {
      group.rotation.y += 0.0035;
      group.rotation.x = Math.sin(t * 0.35) * 0.18;
      group.position.y = Math.sin(t * 0.8) * 0.14;
      particles.rotation.y += 0.0004;

      netNodes.forEach((n) => {
        if (n.isHub) return;
        n.mesh.position.copy(n.basePos).addScaledVector(
          new THREE.Vector3(Math.sin(t * 0.6 + n.phase), Math.cos(t * 0.5 + n.phase), Math.sin(t * 0.4 + n.phase)),
          0.06
        );
      });
      netLines.forEach(({ line, a, b }) => {
        const pos = line.geometry.attributes.position.array;
        pos[0] = netNodes[a].pos.x; pos[1] = netNodes[a].pos.y; pos[2] = netNodes[a].pos.z;
        pos[3] = netNodes[b].pos.x; pos[4] = netNodes[b].pos.y; pos[5] = netNodes[b].pos.z;
        line.geometry.attributes.position.needsUpdate = true;
      });
      hub.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    }

    cx += (tx - cx) * 0.05;
    cy += (ty - cy) * 0.05;
    camera.position.x = cx * 1.1;
    camera.position.y = -cy * 0.8;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && visible && !ticking) { clock.start(); tick(); }
  });

  // stop rendering entirely once the hero scrolls off-screen — the render
  // loop was previously unconditional, so it kept burning main-thread/GPU
  // time (particle field, per-frame line-geometry updates, 3 point lights)
  // the whole time the page was open, competing with Lenis/scroll for frames.
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible = entry.isIntersecting;
      if (visible && running && !ticking) { clock.start(); tick(); }
    });
  }, { threshold: 0 });
  io.observe(canvas);
})();
