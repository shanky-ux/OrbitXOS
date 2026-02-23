// src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import StarfieldBackground from "../components/StarfieldBackground"; // NEW

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <StarfieldBackground /> {/* NEW */}

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />

        <div className="p-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-5xl mx-auto text-center py-16 px-6 mt-24 bg-black/70 backdrop-blur-lg rounded-3xl shadow-[0_0_25px_rgba(0,255,255,0.3)]"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 mb-6">
              About OrbitXOS
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Pioneering the future of space safety through advanced artificial intelligence
              and real-time orbital monitoring. Our mission is to protect humanity's space
              assets and ensure sustainable access to orbit for generations to come.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-6xl mx-auto mt-12 bg-black/60 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
          >
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              As space becomes increasingly congested with over{" "}
              <span className="text-cyan-300 font-semibold">34,000 trackable objects</span> in orbit, the risk of catastrophic collisions threatens the future of space exploration and critical satellite infrastructure.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <span className="text-cyan-300 font-semibold">OrbitXOS</span> leverages cutting-edge machine learning algorithms to predict collision trajectories up to 7 days in advance, providing automated trajectory correction suggestions that have prevented{" "}
              <span className="text-cyan-300 font-semibold">847 potential collisions</span> to date.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-8">
              {[
                { value: "23,128", label: "Objects Tracked", color: "text-cyan-300" },
                { value: "97.2%", label: "Prediction Accuracy", color: "text-green-400" },
                { value: "420", label: "Collisions Prevented", color: "text-yellow-400" },
                { value: "24/7", label: "Continuous Monitoring", color: "text-pink-400" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-black/60 p-6 rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition"
                >
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Pipeline Section */}
         /* <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-6xl mx-auto mt-16"
          >
            <h2 className="text-3xl font-bold text-center text-cyan-400 mb-10">
              AI Technology Pipeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: "Data Ingestion",
                  desc: "Real-time TLE data from global tracking networks and radar systems",
                  color: "text-cyan-400",
                  border: "border-cyan-400/30",
                },
                {
                  title: "ML Processing",
                  desc: "Neural networks trained on 847 historical conjunction events",
                  color: "text-pink-400",
                  border: "border-pink-400/30",
                },
                {
                  title: "Risk Scoring",
                  desc: "Dynamic probability assessment with 97.3% accuracy",
                  color: "text-blue-400",
                  border: "border-blue-400/30",
                },
                {
                  title: "Automated Response",
                  desc: "Optimal maneuver calculations and collision avoidance strategies",
                  color: "text-yellow-400",
                  border: "border-yellow-400/30",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-black/60 border ${item.border} p-6 rounded-2xl shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,0,0.4)] transition`}
                >
                  <h3 className={`text-xl font-bold ${item.color} mb-3`}>{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  );
};

export default About;
