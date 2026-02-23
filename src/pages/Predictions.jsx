// src/pages/PredictionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StarfieldBackground from "../components/StarfieldBackground";

const Prediction = () => {
  const [events, setEvents] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSatellite, setSelectedSatellite] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://orbitxos.onrender.com/predict");
        const data = await res.json();
        if (data.critical_events) {
          setEvents(data.critical_events);
          initializeCountdowns(data.critical_events);
        }
      } catch (err) {
        console.error("Error fetching prediction data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initializeCountdowns = (events) => {
    const initial = {};
    events.forEach((event, index) => {
      let seconds = 0;
      switch (event.risk_level) {
        case "Critical":
          seconds = getRandomSeconds(10 * 60, 50 * 60);
          break;
        case "High":
          seconds = getRandomSeconds(50 * 60, 100 * 60);
          break;
        case "Medium":
          seconds = getRandomSeconds(100 * 60, 200 * 60);
          break;
        case "Low":
          seconds = getRandomSeconds(200 * 60, 250 * 60);
          break;
        default:
          seconds = 2 * 3600;
      }
      initial[index] = seconds;
    });
    setCountdowns(initial);
  };

  const getRandomSeconds = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  useEffect(() => {
    if (Object.keys(countdowns).length === 0) return;
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = {};
        for (const key in prev) {
          updated[key] = prev[key] > 0 ? prev[key] - 1 : 0;
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdowns]);

  const formatSeconds = (totalSec) => {
    const h = Math.floor(totalSec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(totalSec % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const buttonStyles = {
    Critical: "bg-red-500 hover:bg-red-600",
    High: "bg-yellow-500 hover:bg-yellow-600",
    Medium: "bg-cyan-500 hover:bg-cyan-600",
    Low: "bg-green-500 hover:bg-green-600",
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-orbitron overflow-hidden">
      <StarfieldBackground />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-12 pt-28 space-y-10">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent drop-shadow-lg">
              Collision Prediction Center
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-inter tracking-wide">
              AI-enhanced trajectory analysis and collision avoidance recommendations
            </p>
          </div>

          {/* Critical Alert */}
          {events.length > 0 && events[0].risk_level === "Critical" && (
            <div className="bg-transparent backdrop-blur-md border border-red-500/40 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_30px_rgba(255,0,0,0.15)]">
              <p className="text-red-400 font-semibold text-lg">
                ⚠ CRITICAL CONJUNCTION ALERT —{" "}
                <span className="text-white">{events[0].satellite}</span>{" "}
                requires immediate attention — maneuver window closing in{" "}
                <span className="text-red-300">
                  {formatSeconds(countdowns[0] || 0)}
                </span>
              </p>
              <button
                onClick={() => setSelectedSatellite(events[0].satellite)}
                className={`${buttonStyles["Critical"]} transition px-6 py-2.5 rounded-xl font-semibold shadow-md`}
              >
                View Details
              </button>
            </div>
          )}

          {/* Active Predictions */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent drop-shadow-lg">
                Active Collision Predictions
              </h2>
              <span className="text-sm text-gray-400">
                ● Updated <span className="text-cyan-400">just now</span>
              </span>
            </div>

            {loading ? (
              <p className="text-gray-400">Loading predictions...</p>
            ) : events.length === 0 ? (
              <p className="text-gray-400">No critical events at this time 🚀</p>
            ) : (
              <div className="space-y-6">
                {events.map((event, i) => {
                  let burnText = "N/A";
                  let maneuverText = event.maneuver_suggestion;

                  if (maneuverText.includes("~")) {
                    const parts = maneuverText.split("~");
                    burnText = parts[1] ? parts[1].trim() : "N/A";
                    maneuverText = parts[0].trim();
                  } else {
                    burnText = maneuverText;
                  }

                  const satelliteTLE =
                    event.satellite_tle || "No TLE data available";
                  const debrisTLE = event.debris_tle || "No TLE data available";

                  return (
                    <PredictionCard
                      key={i}
                      title={event.satellite}
                      target={event.debris}
                      time={formatSeconds(countdowns[i] || 0)}
                      prob={event.probability}
                      probColor={
                        event.risk_level === "Critical"
                          ? "text-red-500"
                          : event.risk_level === "High"
                          ? "text-yellow-400"
                          : event.risk_level === "Medium"
                          ? "text-cyan-400"
                          : "text-green-400"
                      }
                      barColor={
                        event.risk_level === "Critical"
                          ? "from-cyan-400 to-red-500"
                          : event.risk_level === "High"
                          ? "from-cyan-400 to-yellow-500"
                          : event.risk_level === "Medium"
                          ? "from-cyan-400 to-cyan-500"
                          : "from-cyan-400 to-green-500"
                      }
                      risk={event.risk_level.toUpperCase()}
                      riskColor={
                        event.risk_level === "Critical"
                          ? "text-red-500"
                          : event.risk_level === "High"
                          ? "text-yellow-400"
                          : event.risk_level === "Medium"
                          ? "text-cyan-400"
                          : "text-green-400"
                      }
                      burn={burnText}
                      maneuver={maneuverText}
                      confidence={event.confidence}
                      buttonColor={event.risk_level}
                      buttonStyles={buttonStyles}
                      isHighlighted={selectedSatellite === event.satellite}
                      onExecute={() =>
                        navigate("/aipredictor", {
                          state: {
                            satellite: event.satellite,
                            satelliteTLE,
                            debris: event.debris,
                            debrisTLE,
                            risk: event.risk_level,
                            time: formatSeconds(countdowns[i] || 0),
                          },
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// 🔹 Prediction Card Component
const PredictionCard = ({
  title,
  target,
  time,
  prob,
  probColor,
  barColor,
  risk,
  riskColor,
  burn,
  maneuver,
  confidence,
  buttonColor,
  buttonStyles,
  isHighlighted,
  onExecute,
}) => {
  return (
    <div
      className={`bg-transparent backdrop-blur-md rounded-xl px-6 py-5 border transition flex items-center justify-between space-x-6
      ${
        isHighlighted
          ? "border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,255,255,0.4)] animate-pulse"
          : "border-white/10 hover:border-cyan-400/30 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]"
      }`}
    >
      {/* Left: Satellite & Target */}
      <div className="min-w-[180px]">
        <h3 className="text-base font-semibold text-cyan-300">✦ {title}</h3>
        <p className="text-sm text-gray-400">vs {target}</p>
      </div>

      {/* Time to Impact */}
      <div className="text-center min-w-[120px]">
        <p className="text-pink-400 text-sm font-medium">⏱ {time}</p>
        <span className="text-gray-400 text-xs">Time to Impact</span>
      </div>

      {/* Probability + Risk */}
      <div className="flex flex-col items-center min-w-[150px]">
        <span className={`text-2xl font-bold ${probColor}`}>{prob}</span>
        <div className="w-28 bg-white/10 h-2 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${barColor}`}
            style={{ width: prob }}
          ></div>
        </div>
        <span className={`text-xs mt-1 ${riskColor}`}>{risk}</span>
      </div>

      {/* Maneuver Suggestion */}
      <div className="text-center min-w-[180px]">
        <p className="text-cyan-300 text-sm">⏳ {burn}</p>
        <span className="text-gray-400 text-xs">Maneuver Suggestion</span>
      </div>

      {/* Confidence */}
      <div className="text-center min-w-[100px]">
        <p className="text-cyan-300 text-sm font-semibold">{confidence}</p>
        <span className="text-gray-400 text-xs">Confidence</span>
      </div>

      {/* Execute Button */}
      <div className="min-w-[100px] flex justify-end">
        <button
          onClick={onExecute}
          className={`${
            buttonStyles[buttonColor] || "bg-cyan-500 hover:bg-cyan-600"
          } px-5 py-2 rounded-lg font-semibold transition`}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default Prediction;
