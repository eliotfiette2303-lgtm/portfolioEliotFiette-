/**
 * Transition intro → site : vaisseau 3D + hyperespace (Three.js).
 */
import * as THREE from 'three';

const FLIGHT_MS = 3000;
const FADE_MS = 580;

function size() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function buildShip() {
  const ship = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.18,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.65,
    roughness: 0.42,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.1,
    metalness: 0.35,
    roughness: 0.12,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0xff3300,
    emissive: 0xff5500,
    emissiveIntensity: 5,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.52, 4.1), hullMat);
  ship.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.55, 7, 1), hullMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = -3.05;
  ship.add(nose);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 14, 0, Math.PI * 2, 0.15, Math.PI * 0.5),
    canopyMat
  );
  cockpit.position.set(0, 0.26, -0.55);
  cockpit.rotation.x = -0.15;
  ship.add(cockpit);

  const wingShape = new THREE.BoxGeometry(4.1, 0.07, 1.35);
  const wL = new THREE.Mesh(wingShape, hullMat);
  wL.position.set(-1.45, 0, 0.45);
  wL.rotation.z = 0.38;
  wL.rotation.y = -0.14;
  ship.add(wL);
  const wR = new THREE.Mesh(wingShape, hullMat);
  wR.position.set(1.45, 0, 0.45);
  wR.rotation.z = -0.38;
  wR.rotation.y = 0.14;
  ship.add(wR);

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.11, 2.1), darkMat);
  belly.position.set(0, -0.4, 0.25);
  ship.add(belly);

  const engGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.52, 14);
  const engL = new THREE.Mesh(engGeo, engineMat);
  engL.rotation.x = Math.PI / 2;
  engL.position.set(-0.52, 0, 2.32);
  ship.add(engL);
  const engR = new THREE.Mesh(engGeo, engineMat);
  engR.rotation.x = Math.PI / 2;
  engR.position.set(0.52, 0, 2.32);
  ship.add(engR);

  const plL = new THREE.PointLight(0xff7722, 16, 22, 2);
  plL.position.copy(engL.position);
  ship.add(plL);
  const plR = new THREE.PointLight(0xff7722, 16, 22, 2);
  plR.position.copy(engR.position);
  ship.add(plR);

  const finGeo = new THREE.BoxGeometry(0.07, 0.72, 0.42);
  const finL = new THREE.Mesh(finGeo, hullMat);
  finL.position.set(-0.92, 0.36, 2.05);
  ship.add(finL);
  const finR = new THREE.Mesh(finGeo, hullMat);
  finR.position.set(0.92, 0.36, 2.05);
  ship.add(finR);

  ship.userData.engineLights = [plL, plR];
  return ship;
}

function buildStarfield(count, color, pointSize, opacity) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 140 - 50;
    speeds[i] = 0.35 + Math.random() * 1.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: pointSize,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.speeds = speeds;
  return pts;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function advanceStars(points, u) {
  const mult = 1 + u * u * 95;
  const pos = points.geometry.attributes.position.array;
  const speeds = points.userData.speeds;
  const n = speeds.length;
  for (let i = 0; i < n; i++) {
    pos[i * 3 + 2] += speeds[i] * mult * 0.22;
    if (pos[i * 3 + 2] > 42) pos[i * 3 + 2] = -95 - Math.random() * 50;
  }
  points.geometry.attributes.position.needsUpdate = true;
}

/**
 * @param {{ onComplete: () => void }} opts
 */
export function runSpaceshipTransition(opts) {
  const onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : function () {};

  const root = document.createElement('div');
  root.className = 'intro-ship-root';
  root.setAttribute('aria-hidden', 'true');
  document.body.appendChild(root);

  const { w, h } = size();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.011);

  const camera = new THREE.PerspectiveCamera(46, w / h, 0.08, 420);
  camera.position.set(-2.2, 1.35, 15);
  camera.lookAt(0, 0, -8);

  scene.add(new THREE.AmbientLight(0x334466, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(10, 14, 12);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.95);
  fill.position.set(-12, 2, -6);
  scene.add(fill);

  const ship = buildShip();
  scene.add(ship);

  var lowSpec = typeof window.innerWidth === 'number' && window.innerWidth < 720;
  var nA = lowSpec ? 1100 : 2800;
  var nB = lowSpec ? 550 : 1400;
  const starsA = buildStarfield(nA, 0xc7e2ff, 0.11, 0.9);
  const starsB = buildStarfield(nB, 0xffccaa, 0.08, 0.55);
  scene.add(starsA, starsB);

  let disposed = false;
  function disposeAll() {
    if (disposed) return;
    disposed = true;
    scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(function (m) { m.dispose(); });
        else obj.material.dispose();
      }
    });
    renderer.dispose();
    if (root.parentNode) root.parentNode.removeChild(root);
  }

  function onResize() {
    const s = size();
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
    renderer.setSize(s.w, s.h);
  }
  window.addEventListener('resize', onResize);

  const t0 = performance.now();

  function tick(now) {
    if (disposed) return;

    const raw = Math.min(1, (now - t0) / FLIGHT_MS);
    const t = easeInOutCubic(raw);

    const px = THREE.MathUtils.lerp(-16, 24, t);
    const py = THREE.MathUtils.lerp(-3.5, 4.5, t * 0.92) + Math.sin(raw * Math.PI * 3) * 0.35;
    const pz = THREE.MathUtils.lerp(-42, 22, t);
    ship.position.set(px, py, pz);
    ship.rotation.z = Math.sin(raw * Math.PI * 2.8) * 0.42 - raw * 0.5;
    ship.rotation.y = -0.5 + raw * 0.62;
    ship.rotation.x = Math.sin(raw * Math.PI * 1.2) * 0.14;

    const pulse = 10 + Math.sin(now * 0.045) * 5;
    ship.userData.engineLights[0].intensity = pulse;
    ship.userData.engineLights[1].intensity = pulse + 2;

    advanceStars(starsA, raw);
    advanceStars(starsB, raw * 0.85);

    scene.fog.density = 0.011 + raw * raw * 0.022;

    camera.position.x = -2.2 + raw * 3.2;
    camera.position.y = 1.35 + raw * 1.1;
    camera.lookAt(px * 0.12, py * 0.08 + raw * 0.2, -6 + raw * 4);

    renderer.render(scene, camera);

    if (raw >= 1) {
      root.style.transition = 'opacity ' + FADE_MS + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
      requestAnimationFrame(function () {
        root.style.opacity = '0';
      });
      setTimeout(function () {
        window.removeEventListener('resize', onResize);
        disposeAll();
        onComplete();
      }, FADE_MS + 50);
      return;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
