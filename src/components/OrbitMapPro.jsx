// src/components/OrbitMapPro.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_UNITS = 1.0;
const KM_TO_UNITS = EARTH_RADIUS_UNITS / EARTH_RADIUS_KM;

const TEXTURES = {
  earthDiffuse:
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg",
  earthNight:
    "https://raw.githubusercontent.com/vengatavisva/images/refs/heads/main/earth_lights_4800.jpg",
};

export default function OrbitMapPro({
  height = 600,
  debrisCount = 5000,
  showNightLights = true,
  lockScrollOnHover = true,
}) {
  const mountRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const [tleData, setTleData] = useState([]);

  // filters
  const [filter, setFilter] = useState("both"); // satellites | debris | both
  const [selectedSat, setSelectedSat] = useState("");

  // store references for later
  const satsRef = useRef([]);
  const focusOnSatelliteRef = useRef(() => {});

  /** Parse TLE */
  const parseTLE = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const sats = [];
    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i + 1] && lines[i + 2]) {
        sats.push({
          name: lines[i],
          l1: lines[i + 1],
          l2: lines[i + 2],
        });
      }
    }
    return sats.slice(-2000);
  };

  /** Load TLE */
  useEffect(() => {
    async function loadTLE() {
      try {
        const res = await fetch("/tle.txt");
        const text = await res.text();
        setTleData(parseTLE(text));
      } catch (err) {
        console.error("Failed to load TLE:", err);
      }
    }
    loadTLE();
  }, []);

  /** Three.js scene */
  useEffect(() => {
    if (!tleData.length) return;
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    /** Camera */
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      20000
    );
    camera.position.set(0, 2.2, 3.8);

    /** Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    /** Controls */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    if (lockScrollOnHover) {
      renderer.domElement.addEventListener("wheel", (e) => e.preventDefault(), {
        passive: false,
      });
    }

    /** Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    /** Earth */
    const loader = new THREE.TextureLoader();
    const texDiffuse = loader.load(TEXTURES.earthDiffuse);
    const texNight = showNightLights ? loader.load(TEXTURES.earthNight) : null;

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 96),
      new THREE.MeshPhongMaterial({
        map: texDiffuse,
        emissiveMap: texNight || null,
        emissiveIntensity: texNight ? 0.7 : 0,
        emissive: texNight ? new THREE.Color(0xffffff) : new THREE.Color(0x000000),
        shininess: 10,
      })
    );
    scene.add(earth);

    // 🌌 Atmosphere glow
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x4abcf7,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    /** 🌟 Stars background */
    const starPositions = [];
    for (let i = 0; i < 5000; i++) {
      const r = 200;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8 })));

    /** Random debris */
    const debrisPositions = [];
    for (let i = 0; i < debrisCount; i++) {
      const altKm = 400 + Math.random() * 1100;
      const rUnits = (EARTH_RADIUS_KM + altKm) * KM_TO_UNITS;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      debrisPositions.push(
        rUnits * Math.sin(phi) * Math.cos(theta),
        rUnits * Math.sin(phi) * Math.sin(theta),
        rUnits * Math.cos(phi)
      );
    }
    const debrisGeo = new THREE.BufferGeometry();
    debrisGeo.setAttribute("position", new THREE.Float32BufferAttribute(debrisPositions, 3));
    const debrisPoints = new THREE.Points(
      debrisGeo,
      new THREE.PointsMaterial({ size: 0.018, opacity: 0.9, transparent: true, color: 0xffe9a3 })
    );
    scene.add(debrisPoints);

    /** Satellites */
    const sats = [];
    tleData.forEach((sat) => {
      const rec = satellite.twoline2satrec(sat.l1, sat.l2);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x009900, emissive: 0x00cc00, emissiveIntensity: 1.2 })
      );
      mesh.userData = { name: sat.name, rec, color: 0x00cc00 };
      scene.add(mesh);
      sats.push(mesh);
    });
    satsRef.current = sats;

    /** Tooltip */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tip = document.createElement("div");
    tip.style.position = "absolute";
    tip.style.padding = "6px 10px";
    tip.style.background = "rgba(30, 30, 30, 0.6)";
    tip.style.backdropFilter = "blur(6px)";
    tip.style.borderRadius = "8px";
    tip.style.color = "#fff";
    tip.style.fontSize = "13px";
    tip.style.pointerEvents = "none";
    tip.style.display = "none";
    container.style.position = "relative";
    container.appendChild(tip);

    /** Orbit trail + focus */
    let activeTrail = null;
    let trackedSat = null;
    const makeTrail = (rec, color) => {
      const positions = [];
      const samples = 360;
      const period = (2 * Math.PI) / rec.no;
      const step = (period * 60) / samples;
      const epoch = new Date();
      for (let i = 0; i < samples; i++) {
        const t = new Date(epoch.getTime() + i * step * 1000);
        const pv = satellite.propagate(rec, t);
        if (pv && pv.position) {
          positions.push(
            pv.position.x * KM_TO_UNITS,
            pv.position.y * KM_TO_UNITS,
            pv.position.z * KM_TO_UNITS
          );
        }        
      }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      return new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }));
    };

    const focusOnSatellite = (sat) => {
      if (!sat) return;
      const { rec, color } = sat.userData;
      if (activeTrail) scene.remove(activeTrail);
      activeTrail = makeTrail(rec, color);
      scene.add(activeTrail);
      trackedSat = sat;

      // smooth zoom
      const targetPos = sat.position.clone().multiplyScalar(2);
      let t = 0;
      const startPos = camera.position.clone();
      function zoomAnim() {
        t += 0.02;
        camera.position.lerpVectors(startPos, targetPos, t);
        controls.target.lerp(sat.position, t);
        controls.update();
        if (t < 1) requestAnimationFrame(zoomAnim);
      }
      zoomAnim();
    };
    focusOnSatelliteRef.current = focusOnSatellite;

    /** Click = orbit trail + zoom */
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(sats);
      if (hit.length > 0) {
        focusOnSatellite(hit[0].object);
        setSelectedSat(hit[0].object.userData.name);
      }
    };

    /** Tooltip */
    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(sats);
      if (hit.length > 0) {
        tip.textContent = hit[0].object.userData.name;
        tip.style.left = e.clientX - rect.left + 12 + "px";
        tip.style.top = e.clientY - rect.top + 12 + "px";
        tip.style.display = "block";
      } else {
        tip.style.display = "none";
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    /** Resize */
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    /** Animate */
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      earth.rotation.y += 0.0005;
      atmosphere.rotation.y += 0.0005;

      const now = new Date();
      sats.forEach((mesh) => {
        const pv = satellite.propagate(mesh.userData.rec, now);
        if (pv && pv.position) {
          mesh.position.set(
            pv.position.x * KM_TO_UNITS,
            pv.position.y * KM_TO_UNITS,
            pv.position.z * KM_TO_UNITS
          );
        } else {
          mesh.visible = false; // hide dead sats
        }


        // filters
        if (selectedSat && mesh.userData.name === selectedSat) {
          mesh.visible = true;
        } else if (filter === "satellites") {
          mesh.visible = true;
        } else if (filter === "debris") {
          mesh.visible = false;
        } else {
          mesh.visible = true;
        }
      });

      debrisPoints.visible = filter === "debris" || filter === "both";

      if (trackedSat) {
        controls.target.lerp(trackedSat.position, 0.1);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /** Cleanup */
    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      container.removeChild(renderer.domElement);
      container.removeChild(tip);
      renderer.dispose();
    };

    return () => cleanupRef.current();
  }, [tleData, debrisCount, showNightLights, lockScrollOnHover, filter, selectedSat]);

  /** Handle dropdown focus */
  useEffect(() => {
    if (selectedSat) {
      const sat = satsRef.current.find((s) => s.userData.name === selectedSat);
      if (sat) focusOnSatelliteRef.current(sat);
    }
  }, [selectedSat]);

  return (
    <div style={{ position: "relative" }}>
      {/* ✨ Compact Floating UI */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          background: "rgba(25,25,35,0.8)",
          padding: "10px 12px",
          borderRadius: "12px",
          color: "white",
          zIndex: 10,
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
          minWidth: "180px",
        }}
      >
        {/* View Mode Pills */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "space-between" }}>
          {["both", "satellites", "debris"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                cursor: "pointer",
                background: filter === mode ? "rgba(255,255,255,0.15)" : "transparent",
                border: filter === mode
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: "white",
                transition: "all 0.2s ease",
              }}
            >
              {mode === "both" && "🛰+☄"}
              {mode === "satellites" && "🛰"}
              {mode === "debris" && "☄"}
            </button>
          ))}
        </div>
  
        {/* Focus Satellite Dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", opacity: 0.75 }}>Focus:</label>
          <select
            value={selectedSat}
            onChange={(e) => setSelectedSat(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "11px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">-- None --</option>
            {tleData.slice(0, 60).map((sat, i) => (
              <option key={i} value={sat.name}>
                {sat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {/* Canvas */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 0 30px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );  
}