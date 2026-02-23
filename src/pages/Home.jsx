import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import {
  FiShield,
  FiActivity,
  FiTrendingUp,
  FiCpu,
} from "react-icons/fi";

import "@fontsource/orbitron/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen text-white font-inter overflow-hidden">
      {/* --- Content Layer --- */}
      <div className="relative z-10">
        <Navbar />

        {/* --- HERO SECTION WITH VIDEO BACKGROUND --- */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-28 overflow-hidden">
          {/* 🔹 Video Background (Hero Only) */}
          <video
            className="absolute top-0 left-0 w-full h-full object-cover brightness-105 contrast-110 saturate-120"
            src="/space_bg.MP4" // ✅ Place in /public
            autoPlay
            loop
            muted
            playsInline
          />

          {/* ✅ Dimmed overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70"></div>

          {/* Hero Content */}
          <div className="relative z-10">
            <h1 className="font-orbitron text-6xl md:text-7xl font-extrabold tracking-widest leading-tight 
                          bg-gradient-to-r from-white via-gray-100 to-cyan-200 bg-clip-text text-transparent 
                          drop-shadow-[0_0_45px_rgba(255,255,255,0.8)]">
              OrbitXOS
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white max-w-2xl leading-relaxed font-inter tracking-wide 
                        drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              AI-Driven Space Debris Monitoring <br />
              Protecting Satellites. Securing Orbits.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-6 justify-center font-orbitron tracking-wide">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl 
                          bg-gradient-to-r from-cyan-300 to-blue-500 text-black font-bold text-lg 
                          shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-110 hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]
                          transition-all duration-300 uppercase"
              >
                <Radar className="w-6 h-6" />
                View Dashboard
              </button>

              <button
                onClick={() => navigate("/predictions")}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-cyan-300 
                          text-white font-bold text-lg hover:bg-cyan-500/10 hover:scale-110 
                          transition-all duration-300 uppercase shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              >
                <AlertTriangle className="w-6 h-6 text-cyan-300" />
                See Predictions
              </button>
            </div>
          </div>
        </section>

        {/* 🌌 BELOW HERO — Image Background Wrapper */}
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background.JPG')", // ✅ Place image in /public
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div> {/* Optional dark overlay */}

          <div className="relative z-10">
            
            {/* --- FEATURES SECTION --- */}
            <section className="relative py-32 px-8 md:px-16 overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-12 uppercase tracking-wide drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                  Advanced Space Protection
                </h2>
                <p className="text-center text-white max-w-2xl mx-auto mb-20 font-inter tracking-wide">
                  Our AI-powered platform combines real-time tracking, predictive
                  analytics, and automated collision avoidance to safeguard space assets.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                  <FeatureCard
                    icon={<FiActivity size={42} />}
                    title="Real-Time Monitoring"
                    desc="Track over 34,000 objects in Earth's orbit with sub-meter precision."
                  />
                  <FeatureCard
                    icon={<FiCpu size={42} />}
                    title="AI-Powered Predictions"
                    desc="Machine learning algorithms predict collision probabilities up to 7 days ahead."
                  />
                  <FeatureCard
                    icon={<FiShield size={42} />}
                    title="Collision Avoidance"
                    desc="Automated trajectory correction suggestions to prevent space debris collisions."
                  />
                  <FeatureCard
                    icon={<FiTrendingUp size={42} />}
                    title="Risk Assessment"
                    desc="Dynamic risk scoring based on orbital mechanics and debris characteristics."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Reusable Components --- */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-xl bg-transparent backdrop-blur-md border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] hover:scale-105 transition duration-300">
      <div className="text-white mb-5">{icon}</div>
      <h3 className="font-orbitron text-xl md:text-2xl font-semibold mb-3 tracking-wide uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
        {title}
      </h3>
      <p className="text-white font-inter tracking-wide">{desc}</p>
    </div>
  );
}

function ThreatRow({ orbit, risk, color }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-white/10">
      <p className="text-white font-inter tracking-wide">{orbit}</p>
      <p className={`font-orbitron font-bold ${color} tracking-widest`}>
        {risk}
      </p>
    </div>
  );
}
