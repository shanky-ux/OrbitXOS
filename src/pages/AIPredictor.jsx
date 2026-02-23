// src/pages/AIPredictor.jsx
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import StarfieldBackground from "../components/StarfieldBackground";
import * as THREE from "three";
import * as satellite from "satellite.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_UNITS = 1.0;
const KM_TO_UNITS = EARTH_RADIUS_UNITS / EARTH_RADIUS_KM;
const SCALE_FACTOR = 25;
const COLLISION_DISTANCE = 0.3;

const TEXTURES = {
  earthDiffuse: "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg",
  earthNight: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/textures/earth-night.jpg",
};

export default function AIPredictor() {
  const location = useLocation();
  const passedState = location.state || {};

  const [tleData, setTleData] = useState(null);
  const [risk, setRisk] = useState(null);
  const [maneuver, setManeuver] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const mountRef = useRef(null);
  const cleanupRef = useRef(() => {});

  // --- API Call ---
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setShowResults(false);

    try {
      const res = await fetch("https://orbit-path-predictor.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satellite_tle: passedState.satelliteTLE,
          debris_tle: passedState.debrisTLE,
          horizon_minutes: 60,
          step_seconds: 30,
        }),
      });

      const data = await res.json();
      setTleData({
        satellite: data.tle_output?.satellite_tle,
        debris: data.tle_output?.debris_tle,
        predicted_safe: data.tle_output?.predicted_safe_tle,
      });
      setRisk(data.risk || {});
      setManeuver(data.maneuver || {});

      setTimeout(() => {
        setAnalyzing(false);
        setShowResults(true);
      }, 700);
    } catch (err) {
      console.error("API Error:", err);
      setAnalyzing(false);
    }
  };

  // --- Parse TLE ---
  function parseTLE(input) {
    if (!input) return null;
    const lines = String(input).trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    try {
      return satellite.twoline2satrec(lines[lines.length - 2], lines[lines.length - 1]);
    } catch (e) {
      console.error("❌ TLE Parse Error:", e, input);
      return null;
    }
  }

  // --- Setup 3D Scene ---
  useEffect(() => {
    if (!showResults || !tleData) return;
    const container = mountRef.current;
    if (!container) return;

    if (container.hasChildNodes()) container.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const loader = new THREE.TextureLoader();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    // Earth
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 96),
      new THREE.MeshStandardMaterial({
        map: loader.load(TEXTURES.earthDiffuse),
        emissiveMap: loader.load(TEXTURES.earthNight),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.3,
        roughness: 1,
        metalness: 0,
      })
    );
    scene.add(earth);

    // Stars
    const starPositions = [];
    for (let i = 0; i < 2000; i++) {
      const r = 400;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));

    const satRec = parseTLE(tleData.satellite);
    const debrisRec = parseTLE(tleData.debris);
    const safeRec = parseTLE(tleData.predicted_safe);

    const satMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    const debrisMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    scene.add(satMesh, debrisMesh);

    const collisionMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    collisionMarker.visible = false;
    scene.add(collisionMarker);

    const computeOrbit = (rec) => {
      if (!rec) return [];
      const positions = [];
      const samples = 400;
      const meanMotion = rec.no;
      const periodMinutes = (2 * Math.PI) / meanMotion;
      const step = (periodMinutes * 60) / samples;
      const now = new Date();
      for (let i = 0; i < samples; i++) {
        const t = new Date(now.getTime() + i * step * 1000);
        const pv = satellite.propagate(rec, t);
        if (pv.position) {
          positions.push(
            new THREE.Vector3(
              pv.position.x * KM_TO_UNITS * SCALE_FACTOR,
              pv.position.y * KM_TO_UNITS * SCALE_FACTOR,
              pv.position.z * KM_TO_UNITS * SCALE_FACTOR
            )
          );
        }
      }
      return positions;
    };

    const satOrbit = computeOrbit(satRec);
    const debrisOrbit = computeOrbit(debrisRec);
    const safeOrbit = computeOrbit(safeRec);

    const makeTrail = (points, color) => {
      if (points.length === 0) return null;
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.6 })
      );
    };

    let satTrail = makeTrail(satOrbit, 0x00ff00);
    const debrisTrail = makeTrail(debrisOrbit, 0xff0000);
    if (satTrail) scene.add(satTrail);
    if (debrisTrail) scene.add(debrisTrail);

    let transitioning = false;
    let transitionProgress = 0;
    const transitionToNewOrbit = () => {
      if (!safeOrbit.length) return;
      transitioning = true;
      transitionProgress = 0;
      if (satTrail) scene.remove(satTrail);
    };

    let frame = 0;
    function animate() {
      requestAnimationFrame(animate);

      if (!transitioning) {
        if (satOrbit.length > 0) satMesh.position.copy(satOrbit[Math.floor(frame) % satOrbit.length]);
      } else {
        transitionProgress += 0.005;
        if (transitionProgress >= 1) {
          transitioning = false;
          satTrail = makeTrail(safeOrbit, 0x00ff00);
          if (satTrail) scene.add(satTrail);
        } else {
          const i = Math.floor(frame) % Math.min(satOrbit.length, safeOrbit.length);
          satMesh.position.lerpVectors(satOrbit[i], safeOrbit[i], transitionProgress);
        }
      }

      if (debrisOrbit.length > 0) debrisMesh.position.copy(debrisOrbit[Math.floor(frame) % debrisOrbit.length]);

      const distance = satMesh.position.distanceTo(debrisMesh.position);
      if (!collisionMarker.visible && distance < COLLISION_DISTANCE) {
        collisionMarker.visible = true;
        collisionMarker.position.copy(satMesh.position);
        setTimeout(() => transitionToNewOrbit(), 2000);
      }

      frame += 0.3;
      earth.rotation.y += 0.0005;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      window.removeEventListener("resize", onResize);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          Array.isArray(obj.material)
            ? obj.material.forEach((m) => m.dispose())
            : obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };

    return () => cleanupRef.current();
  }, [showResults, tleData]);

  return (
    <div className="relative min-h-screen text-white font-orbitron overflow-hidden">
      <StarfieldBackground />
      <div className="relative z-10">
        <Navbar />

        <section className="max-w-6xl mx-auto px-6 py-20 space-y-10">
          {!showResults && (
            <motion.div className="bg-transparent backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
              <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
                Satellite & Debris TLE Data
              </h2>
              <div className="bg-black/40 text-green-400 font-mono p-6 rounded-xl whitespace-pre-line text-lg border border-white/10">
                SATELLITE: {passedState.satellite}
                {"\n"}
                {passedState.satelliteTLE}
                {"\n\n"}DEBRIS: {passedState.debris}
                {"\n"}
                {passedState.debrisTLE}
              </div>
              <motion.button
                onClick={handleAnalyze}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg hover:scale-105 transition font-semibold shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              >
                {analyzing ? "Analyzing..." : "Analyze Trajectory"}
              </motion.button>
            </motion.div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-gray-300 animate-pulse">
                Processing trajectory...
              </p>
            </div>
          )}

          {showResults && tleData && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-white">
                Orbit Simulator
              </h2>
              <div className="relative bg-transparent backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
                <div ref={mountRef} className="w-full h-[550px] rounded-xl overflow-hidden" />
              </div>

              <div className="flex justify-center gap-6 text-lg">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500"></span> Satellite
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500"></span> Debris
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-transparent backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                  <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-2 mb-6">
                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                    Risk Analysis
                  </h3>
                  <div className="space-y-3 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Minimum Distance:</span>
                      <span className="text-red-400 font-semibold">
                        {risk?.min_distance_km
                          ? `${risk.min_distance_km.toFixed(2)} km`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        Time of Closest Approach:
                      </span>
                      <span className="text-white font-mono">{risk?.tca ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Orbit Regime:</span>
                      <span className="text-yellow-400 font-semibold">
                        {risk?.regime ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Risk Threshold:</span>
                      <span className="text-white">
                        {risk?.threshold_km ? `${risk.threshold_km} km` : "N/A"}
                      </span>
                    </div>
                    <hr className="border-white/10 my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Risk Status:</span>
                      <span
                        className={`px-4 py-1 rounded-lg font-bold text-sm ${
                          risk?.risky
                            ? "bg-red-800/40 text-red-300 border border-red-500/40"
                            : "bg-green-800/40 text-green-300 border border-green-500/40"
                        }`}
                      >
                        {risk?.risky ? "RISKY" : "SAFE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-transparent backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,0,255,0.1)]">
                  <h3 className="text-2xl font-bold text-purple-400 flex items-center gap-2 mb-6">
                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                    Maneuver Suggestion
                  </h3>
                  <div className="space-y-3 text-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Action Type:</span>
                      <span className="text-yellow-400 font-semibold">
                        {maneuver?.type ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Recommended ΔV:</span>
                      <span className="text-blue-400 font-semibold">
                        {maneuver?.recommended_dv_mps
                          ? `${maneuver.recommended_dv_mps} m/s`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="bg-black/40 text-gray-200 italic p-4 rounded-xl mt-4 border border-white/10">
                      {maneuver?.note ?? "No maneuver needed."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
