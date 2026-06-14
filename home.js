// Hetansh Shah — Homepage 3D hero (Three.js)
// Buildless ES module. Imported via importmap in index.html.
// Degrades gracefully: if WebGL/Three fails, a CSS gradient orb shows instead.

import * as THREE from 'three';

(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL capability check
  let gl = null;
  try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) { /* noop */ }
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.body.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ---- the floating crystal -------------------------------------------
  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(1.55, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x6aa3ff, metalness: 0.55, roughness: 0.16, flatShading: true,
    emissive: 0x0a1830, emissiveIntensity: 0.6
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // glowing wireframe shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.05, 1),
    new THREE.MeshBasicMaterial({ color: 0xb8ccff, wireframe: true, transparent: true, opacity: 0.16 })
  );
  group.add(shell);

  // ---- particle field --------------------------------------------------
  const pCount = 380;
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

  // ---- render loop (pauses when tab hidden) ----------------------------
  const clock = new THREE.Clock();
  let running = true;

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();

    if (!reduce) {
      group.rotation.y += 0.0035;
      group.rotation.x = Math.sin(t * 0.35) * 0.18;
      group.position.y = Math.sin(t * 0.8) * 0.14;
      shell.rotation.y -= 0.0016;
      shell.rotation.z += 0.0009;
      particles.rotation.y += 0.0004;
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
    if (running) { clock.start(); tick(); }
  });
})();
