/**
 * Transition intro → site : chasseur 3D, fumée, atterrissage.
 * Three.js : charger vendor/three.min.js (UMD r160) — three@0.170+ npm n’expose plus ce fichier ; un CDN …/three@0.170.0/build/three.min.js renvoie 404.
 * Compatibilité PC : pas de PMREM, pas d’ombres, pas de verre « transmission »
 * (souvent la cause d’écrans noirs / plantages sur GPU Intel / pilotes anciens).
 */
(function (window) {
  'use strict';
  var THREE = window.THREE;
  if (!THREE || !THREE.WebGLRenderer) {
    window.__portfolioSpaceship = null;
    return;
  }

  try {
  var FLIGHT_MS = 3200;
  var LANDING_MS = 2400;
  var HOLD_MS = 450;
  var FADE_MS = 700;

  function size() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function addEdges(mesh, angle, color, opacity) {
    var eg = new THREE.EdgesGeometry(mesh.geometry, angle || 35);
    var lines = new THREE.LineSegments(
      eg,
      new THREE.LineBasicMaterial({
        color: color != null ? color : 0xa5f3fc,
        transparent: true,
        opacity: opacity != null ? opacity : 0.48,
      })
    );
    mesh.add(lines);
  }

  /**
   * @param {boolean} lowSpec
   * @param {boolean} safeMat — true : tout en MeshStandard (GPU / pilotes fragiles)
   */
  function buildShip(lowSpec, safeMat) {
    var ship = new THREE.Group();
    var P = safeMat || !THREE.MeshPhysicalMaterial ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial;

    var hullMat = new P({
      color: 0xb8c8dc,
      metalness: 0.9,
      roughness: 0.14,
      emissive: 0x0a121c,
      emissiveIntensity: 0.16,
    });
    if (!safeMat && hullMat.clearcoat !== undefined) {
      hullMat.clearcoat = 0.85;
      hullMat.clearcoatRoughness = 0.08;
    }

    var plateMat = new P({
      color: 0x7a8aa0,
      metalness: 0.88,
      roughness: 0.2,
      emissive: 0x060a10,
      emissiveIntensity: 0.12,
    });
    if (!safeMat && plateMat.clearcoat !== undefined) {
      plateMat.clearcoat = 0.65;
      plateMat.clearcoatRoughness = 0.1;
    }

    var darkMat = new THREE.MeshStandardMaterial({
      color: 0x151d2a,
      metalness: 0.55,
      roughness: 0.52,
      emissive: 0x020408,
      emissiveIntensity: 0.08,
    });

    var accentMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.82,
      roughness: 0.24,
      emissive: 0x3d2806,
      emissiveIntensity: 0.22,
    });

    /* Verre cockpit sans transmission (évite écrans noirs sur certains PC) */
    var canopyMat = new THREE.MeshStandardMaterial({
      color: 0xa5e8ff,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.55,
      metalness: 0.18,
      roughness: 0.05,
    });

    var engineMat = new THREE.MeshStandardMaterial({
      color: 0xff1a00,
      metalness: 0.22,
      roughness: 0.38,
      emissive: 0xff5500,
      emissiveIntensity: 6.5,
    });

    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xffcc88,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    var rivetMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      metalness: 0.85,
      roughness: 0.4,
    });

    var body = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.56, 4.05, 1, 1, 2), hullMat);
    ship.add(body);
    if (!lowSpec) addEdges(body, 38, 0xb8e8ff, 0.48);

    var groove;
    for (groove = 0; groove < 5; groove++) {
      var g = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.55), darkMat);
      g.position.set(0, 0.31, -2.2 + groove * 0.95);
      ship.add(g);
    }

    var nose = new THREE.Mesh(new THREE.ConeGeometry(0.37, 1.72, 14, 2), hullMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = -3.18;
    ship.add(nose);
    if (!lowSpec) addEdges(nose, 32, 0xb0e0ff, 0.42);

    var noseRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.038, 10, 36), accentMat);
    noseRing.rotation.x = Math.PI / 2;
    noseRing.position.z = -2.38;
    ship.add(noseRing);

    var intakeL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 1.1), darkMat);
    intakeL.position.set(-0.48, -0.08, -0.85);
    intakeL.rotation.z = 0.12;
    ship.add(intakeL);
    var intakeR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 1.1), darkMat);
    intakeR.position.set(0.48, -0.08, -0.85);
    intakeR.rotation.z = -0.12;
    ship.add(intakeR);

    var gun = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.92, 12), darkMat);
    gun.rotation.x = Math.PI / 2;
    gun.position.set(0, -0.24, -1.88);
    ship.add(gun);

    var cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 28, 20, 0, Math.PI * 2, 0.1, Math.PI * 0.47),
      canopyMat
    );
    cockpit.position.set(0, 0.29, -0.6);
    cockpit.rotation.x = -0.09;
    ship.add(cockpit);

    var coFrame = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.022, 10, 40, Math.PI * 1.08), plateMat);
    coFrame.rotation.x = Math.PI / 2;
    coFrame.position.set(0, 0.29, -0.6);
    ship.add(coFrame);

    var wingGeo = new THREE.BoxGeometry(4.45, 0.072, 1.48);
    var wL = new THREE.Mesh(wingGeo, hullMat);
    wL.position.set(-1.55, 0, 0.44);
    wL.rotation.z = 0.41;
    wL.rotation.y = -0.12;
    ship.add(wL);
    if (!lowSpec) addEdges(wL, 36, 0xbee8ff, 0.45);
    var wR = new THREE.Mesh(wingGeo.clone(), hullMat);
    wR.position.set(1.55, 0, 0.44);
    wR.rotation.z = -0.41;
    wR.rotation.y = 0.12;
    ship.add(wR);
    if (!lowSpec) addEdges(wR, 36, 0xbee8ff, 0.45);

    var stripL = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.035, 0.09), accentMat);
    stripL.position.set(-2.15, 0.048, 0.36);
    stripL.rotation.z = 0.41;
    stripL.rotation.y = -0.12;
    ship.add(stripL);
    var stripR = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.035, 0.09), accentMat);
    stripR.position.set(2.15, 0.048, 0.36);
    stripR.rotation.z = -0.41;
    stripR.rotation.y = 0.12;
    ship.add(stripR);

    var vgL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.18), plateMat);
    vgL.position.set(-2.85, 0.04, 0.55);
    vgL.rotation.z = 0.35;
    vgL.rotation.y = -0.12;
    ship.add(vgL);
    var vgR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.18), plateMat);
    vgR.position.set(2.85, 0.04, 0.55);
    vgR.rotation.z = -0.35;
    vgR.rotation.y = 0.12;
    ship.add(vgR);

    var wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.58, 0.3), plateMat);
    wingletL.position.set(-3.42, 0.05, 0.88);
    wingletL.rotation.z = 0.36;
    wingletL.rotation.y = -0.12;
    ship.add(wingletL);
    var wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.58, 0.3), plateMat);
    wingletR.position.set(3.42, 0.05, 0.88);
    wingletR.rotation.z = -0.36;
    wingletR.rotation.y = 0.12;
    ship.add(wingletR);

    var tipL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff2233 }));
    tipL.position.set(-3.52, 0.06, 0.92);
    ship.add(tipL);
    var tipR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff2233 }));
    tipR.position.set(3.52, 0.06, 0.92);
    ship.add(tipR);

    var podGeo = new THREE.CylinderGeometry(0.15, 0.19, 1.15, 16);
    var podL = new THREE.Mesh(podGeo, darkMat);
    podL.rotation.z = Math.PI / 2;
    podL.position.set(-2.45, -0.34, 0.52);
    podL.rotation.y = -0.12;
    ship.add(podL);
    var podR = new THREE.Mesh(podGeo.clone(), darkMat);
    podR.rotation.z = Math.PI / 2;
    podR.position.set(2.45, -0.34, 0.52);
    podR.rotation.y = 0.12;
    ship.add(podR);

    var belly = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.13, 2.35), darkMat);
    belly.position.set(0, -0.44, 0.2);
    ship.add(belly);

    var strakeL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 2.95), plateMat);
    strakeL.position.set(-0.64, -0.19, 0.08);
    ship.add(strakeL);
    var strakeR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 2.95), plateMat);
    strakeR.position.set(0.64, -0.19, 0.08);
    ship.add(strakeR);

    var module = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.85), plateMat);
    module.position.set(0, 0.08, 2.05);
    ship.add(module);

    var engGeo = new THREE.CylinderGeometry(0.23, 0.36, 0.62, 28);
    var engL = new THREE.Mesh(engGeo, engineMat);
    engL.rotation.x = Math.PI / 2;
    engL.position.set(-0.55, 0, 2.42);
    ship.add(engL);
    var engR = new THREE.Mesh(engGeo.clone(), engineMat);
    engR.rotation.x = Math.PI / 2;
    engR.position.set(0.55, 0, 2.42);
    ship.add(engR);

    var ringGeo = new THREE.TorusGeometry(0.28, 0.028, 10, 36);
    var ringL = new THREE.Mesh(ringGeo, plateMat);
    ringL.position.copy(engL.position);
    ringL.rotation.x = Math.PI / 2;
    ship.add(ringL);
    var ringR = new THREE.Mesh(ringGeo.clone(), plateMat);
    ringR.position.copy(engR.position);
    ringR.rotation.x = Math.PI / 2;
    ship.add(ringR);

    var coneL = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.15, 18, 3, true), glowMat.clone());
    coneL.rotation.x = -Math.PI / 2;
    coneL.position.set(-0.55, 0, 3.32);
    ship.add(coneL);
    var coneR = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.15, 18, 3, true), glowMat.clone());
    coneR.rotation.x = -Math.PI / 2;
    coneR.position.set(0.55, 0, 3.32);
    ship.add(coneR);

    var plL = new THREE.PointLight(0xff9944, 34, 44, 1.6);
    plL.position.copy(engL.position);
    ship.add(plL);
    var plR = new THREE.PointLight(0xff9944, 34, 44, 1.6);
    plR.position.copy(engR.position);
    ship.add(plR);

    var finGeo = new THREE.BoxGeometry(0.085, 0.82, 0.48);
    var finL = new THREE.Mesh(finGeo, hullMat);
    finL.position.set(-0.98, 0.4, 2.1);
    finL.rotation.z = -0.07;
    ship.add(finL);
    var finR = new THREE.Mesh(finGeo.clone(), hullMat);
    finR.position.set(0.98, 0.4, 2.1);
    finR.rotation.z = 0.07;
    ship.add(finR);

    var stab = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.055, 0.38), plateMat);
    stab.position.set(0, 0.54, 2.38);
    ship.add(stab);

    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), canopyMat);
    dome.position.set(0, 0.5, -0.04);
    ship.add(dome);

    var ant = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.58, 8), plateMat);
    ant.position.set(0, 0.76, 1.22);
    ship.add(ant);

    if (!lowSpec) {
      var rx;
      var rz;
      for (rx = -1; rx <= 1; rx += 2) {
        for (rz = 0; rz < 3; rz++) {
          var riv = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), rivetMat);
          riv.position.set(rx * 0.42, 0.29, -1.4 + rz * 0.55);
          ship.add(riv);
        }
      }
    }

    ship.userData.engineLights = [plL, plR];
    ship.userData.glowCones = [coneL, coneR];
    ship.userData.baseScale = 3.55;
    ship.scale.setScalar(ship.userData.baseScale);
    return ship;
  }

  function buildStarfield(count, color, pointSize, opacity) {
    var positions = new Float32Array(count * 3);
    var speeds = new Float32Array(count);
    var i;
    for (i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90 - 35;
      speeds[i] = 0.4 + Math.random() * 1.5;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: color,
      size: pointSize,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    var pts = new THREE.Points(geo, mat);
    pts.userData.speeds = speeds;
    return pts;
  }

  function advanceStars(points, u, damp) {
    var mult = (1 + u * u * 72) * (damp || 1);
    var pos = points.geometry.attributes.position.array;
    var speeds = points.userData.speeds;
    var n = speeds.length;
    var i;
    for (i = 0; i < n; i++) {
      pos[i * 3 + 2] += speeds[i] * mult * 0.22;
      if (pos[i * 3 + 2] > 38) pos[i * 3 + 2] = -75 - Math.random() * 40;
    }
    points.geometry.attributes.position.needsUpdate = true;
  }

  function createRenderer() {
    var optsList = [
      { antialias: true, alpha: true, powerPreference: 'high-performance' },
      { antialias: true, alpha: true, powerPreference: 'default' },
      { antialias: false, alpha: true, powerPreference: 'default' },
      { antialias: false, alpha: false, powerPreference: 'low-power' },
    ];
    var i;
    var r;
    for (i = 0; i < optsList.length; i++) {
      try {
        r = new THREE.WebGLRenderer(optsList[i]);
        if (r.getContext()) return r;
        r.dispose();
      } catch (e) {
        /* suivant */
      }
    }
    return null;
  }

  /** Même état que la dernière frame de vol (raw = 1), pour éviter un saut si une frame est sautée. */
  function fillFlightEnd(flightEnd, ship) {
    var raw = 1;
    var t = easeInOutCubic(raw);
    flightEnd.px = THREE.MathUtils.lerp(-10, 16, t);
    flightEnd.py = THREE.MathUtils.lerp(-2.2, 3.4, t * 0.95) + Math.sin(raw * Math.PI * 3) * 0.45;
    flightEnd.pz = THREE.MathUtils.lerp(-20, 12, t);
    flightEnd.rz = Math.sin(raw * Math.PI * 2.8) * 0.38 - raw * 0.55;
    flightEnd.ry = -0.55 + raw * 0.75;
    flightEnd.rx = Math.sin(raw * Math.PI * 1.15) * 0.16;
    flightEnd.cx = 0.2 + raw * 2.4;
    flightEnd.cy = 0.9 + raw * 0.85;
    flightEnd.camLookZ = -2 + raw * 5;
    ship.position.set(flightEnd.px, flightEnd.py, flightEnd.pz);
    ship.rotation.set(flightEnd.rx, flightEnd.ry, flightEnd.rz);
  }

  function runSpaceshipTransition(opts) {
    var onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : function () {};
    var introEl = opts.introEl || null;
    var smokeStarted = false;

    var root = document.createElement('div');
    root.className = 'intro-ship-root';
    root.setAttribute('aria-hidden', 'true');
    document.body.appendChild(root);

    var wh = size();
    var w = wh.w;
    var h = wh.h;

    var renderer = createRenderer();
    if (!renderer) {
      root.remove();
      throw new Error('WebGL indisponible');
    }

    if (THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x020814, 0.92);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    root.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040a16, 0.0048);

    var lowSpec = typeof window.innerWidth === 'number' && window.innerWidth < 720;
    var isWebGL2 = !!(renderer.capabilities && renderer.capabilities.isWebGL2);
    /* Matériaux « sûrs » si WebGL1 ou petit écran (évite plantages pilote) */
    var safeMat = lowSpec || !isWebGL2;

    var camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 260);
    camera.position.set(0.2, 0.9, 11.5);
    camera.lookAt(-1, 0, -2);

    scene.add(new THREE.AmbientLight(0x5a6e8a, 0.58));
    scene.add(new THREE.HemisphereLight(0x9ec0ff, 0x060910, 0.85));

    var key = new THREE.DirectionalLight(0xffffff, 2.95);
    key.position.set(9, 13, 11);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xb8c8ff, 1.1);
    fill.position.set(-11, 5, -5);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0x66aaff, 0.95);
    rim.position.set(-14, -2, -6);
    scene.add(rim);

    var front = new THREE.DirectionalLight(0xd8e8ff, 0.55);
    front.position.set(0, 4, 18);
    scene.add(front);

    var ship = buildShip(lowSpec, safeMat);
    scene.add(ship);

    var nA = lowSpec ? 800 : 2200;
    var nB = lowSpec ? 400 : 1100;
    var starsA = buildStarfield(nA, 0xd8ecff, lowSpec ? 0.13 : 0.15, 0.92);
    var starsB = buildStarfield(nB, 0xffd4aa, lowSpec ? 0.09 : 0.1, 0.5);
    scene.add(starsA, starsB);

    var flightEnd = {
      px: 0,
      py: 0,
      pz: 0,
      rz: 0,
      ry: 0,
      rx: 0,
      cx: 0,
      cy: 0,
      camLookZ: 0,
    };
    var flightEndSaved = false;

    var disposed = false;
    function disposeAll() {
      if (disposed) return;
      disposed = true;
      scene.environment = null;
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
      var s = size();
      camera.aspect = s.w / s.h;
      camera.updateProjectionMatrix();
      renderer.setSize(s.w, s.h);
    }
    window.addEventListener('resize', onResize);

    var t0 = performance.now();
    var freezeAt = 0;
    function onVis() {
      if (document.hidden) {
        freezeAt = performance.now();
        return;
      }
      if (freezeAt) {
        t0 += performance.now() - freezeAt;
        freezeAt = 0;
      }
    }
    document.addEventListener('visibilitychange', onVis);

    var totalMs = FLIGHT_MS + LANDING_MS + HOLD_MS;
    var baseSc = ship.userData.baseScale || 3.55;

    function tick(now) {
      if (disposed) return;

      var elapsed = now - t0;

      if (elapsed < FLIGHT_MS) {
        var raw = Math.min(1, elapsed / FLIGHT_MS);
        var t = easeInOutCubic(raw);

        if (introEl && raw > 0.34 && !smokeStarted) {
          smokeStarted = true;
          introEl.classList.add('site-intro--ship-smoke');
        }
        if (introEl && raw > 0.5) {
          introEl.classList.add('site-intro--ship-smoke-peak');
        }

        var px = THREE.MathUtils.lerp(-10, 16, t);
        var py = THREE.MathUtils.lerp(-2.2, 3.4, t * 0.95) + Math.sin(raw * Math.PI * 3) * 0.45;
        var pz = THREE.MathUtils.lerp(-20, 12, t);
        ship.position.set(px, py, pz);
        ship.rotation.z = Math.sin(raw * Math.PI * 2.8) * 0.38 - raw * 0.55;
        ship.rotation.y = -0.55 + raw * 0.75;
        ship.rotation.x = Math.sin(raw * Math.PI * 1.15) * 0.16;

        var pulse = 20 + Math.sin(now * 0.048) * 9;
        ship.userData.engineLights[0].intensity = pulse;
        ship.userData.engineLights[1].intensity = pulse + 3;
        ship.userData.glowCones[0].material.opacity = 0.28 + raw * 0.2;
        ship.userData.glowCones[1].material.opacity = 0.28 + raw * 0.2;

        advanceStars(starsA, raw, 1);
        advanceStars(starsB, raw * 0.88, 1);

        scene.fog.density = 0.0048 + raw * raw * 0.013;

        var cx = 0.2 + raw * 2.4;
        var cy = 0.9 + raw * 0.85;
        camera.position.set(cx, cy, 11.5 - raw * 0.35);
        camera.lookAt(px * 0.18 + raw * 0.4, py * 0.12 + raw * 0.15, -2 + raw * 5);

        if (raw >= 0.992) {
          flightEnd.px = px;
          flightEnd.py = py;
          flightEnd.pz = pz;
          flightEnd.rz = ship.rotation.z;
          flightEnd.ry = ship.rotation.y;
          flightEnd.rx = ship.rotation.x;
          flightEnd.cx = cx;
          flightEnd.cy = cy;
          flightEnd.camLookZ = -2 + raw * 5;
          flightEndSaved = true;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
        return;
      }

      if (!flightEndSaved) {
        fillFlightEnd(flightEnd, ship);
        flightEndSaved = true;
      }

      if (elapsed < FLIGHT_MS + LANDING_MS) {
        var u = (elapsed - FLIGHT_MS) / LANDING_MS;
        var e = easeOutCubic(u);

        var landPx = THREE.MathUtils.lerp(flightEnd.px, 3.2, e);
        var landPy = THREE.MathUtils.lerp(flightEnd.py, -5.8, e);
        var landPz = THREE.MathUtils.lerp(flightEnd.pz, 15.5, e);
        ship.position.set(landPx, landPy, landPz);

        ship.rotation.z = THREE.MathUtils.lerp(flightEnd.rz, 0.06, e);
        ship.rotation.y = THREE.MathUtils.lerp(flightEnd.ry, -0.12, e);
        ship.rotation.x = THREE.MathUtils.lerp(flightEnd.rx, 0.12, e);

        var sc = THREE.MathUtils.lerp(baseSc, 1.05, e);
        ship.scale.setScalar(sc);

        var engDim = THREE.MathUtils.lerp(1, 0.35, e);
        ship.userData.engineLights[0].intensity = 26 * engDim;
        ship.userData.engineLights[1].intensity = 28 * engDim;
        ship.userData.glowCones[0].material.opacity = 0.38 * (1 - e * 0.85);
        ship.userData.glowCones[1].material.opacity = 0.38 * (1 - e * 0.85);

        advanceStars(starsA, 1, 0.25 * (1 - u));
        advanceStars(starsB, 0.9, 0.22 * (1 - u));

        scene.fog.density = 0.017 + u * 0.012;

        var camLX = THREE.MathUtils.lerp(flightEnd.cx, 1.2, e);
        var camLY = THREE.MathUtils.lerp(flightEnd.cy, 0.4, e);
        camera.position.set(camLX, camLY, 12 + u * 2.2);
        camera.lookAt(landPx * 0.35, landPy * 0.25 + 1.2 * (1 - e), flightEnd.camLookZ * 0.4 + u * 4);

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
        return;
      }

      if (elapsed < totalMs) {
        advanceStars(starsA, 1, 0.08);
        advanceStars(starsB, 0.85, 0.08);
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
        return;
      }

      root.style.transition = 'opacity ' + FADE_MS + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
      requestAnimationFrame(function () {
        root.style.opacity = '0';
      });
      setTimeout(function () {
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        disposeAll();
        onComplete();
      }, FADE_MS + 80);
    }

    requestAnimationFrame(tick);
  }

  window.__portfolioSpaceship = { run: runSpaceshipTransition };
  } catch (err) {
    window.__portfolioSpaceship = null;
  }
})(typeof window !== 'undefined' ? window : this);
