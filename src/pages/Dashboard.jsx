import React, { useEffect, useState } from "react";
import { Eye, Satellite, AlertTriangle, Activity, Globe } from "lucide-react";
import Navbar from "../components/Navbar";
import OrbitMapPro from "../components/OrbitMapPro";
import StarfieldBackground from "../components/StarfieldBackground";

function StatCard({ value, label, change, color, Icon }) {
  return (
    <div className="p-6 rounded-xl shadow-lg text-center 
                    bg-transparent backdrop-blur-md 
                    border border-white/10 
                    hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-center gap-2">
        <p className={`font-orbitron text-4xl font-bold ${color}`}>
          {value}
        </p>
        <Icon className={`${color}`} size={26} />
      </div>
      <p className="mt-1 text-gray-300 font-inter tracking-wide text-sm">
        {label}
      </p>
      <p className="text-xs mt-1 text-gray-500">{change}</p>
    </div>
  );
}

function ThreatRow({ object, type, alt, velocity, size, risk }) {
  const riskColors = {
    Critical: { bg: "bg-red-700/30", text: "text-red-200" },
    High: { bg: "bg-red-900/20", text: "text-red-300" },
    Medium: { bg: "bg-yellow-900/20", text: "text-yellow-300" },
    Low: { bg: "bg-green-900/20", text: "text-green-300" },
    Unknown: { bg: "bg-gray-800/20", text: "text-gray-300" },
  };

  const riskColor = riskColors[risk] || riskColors.Unknown;

  return (
    <tr className="border-b border-gray-700/30">
      <td className="py-2 text-gray-200">{object}</td>
      <td className="text-gray-300">{type}</td>
      <td className="text-gray-300">{alt} km</td>
      <td className="text-gray-300">{velocity} km/s</td>
      <td className="text-gray-300">{size}</td>
      <td>
        <span className={`px-2 py-1 rounded text-xs ${riskColor.bg} ${riskColor.text}`}>
          {risk}
        </span>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const staticData = {
      stats: {
        objects_tracked: 987,
        objects_tracked_today: 124,
        active_threats: 17,
        active_threats_change: 2,
        predictions_made: 432,
        predictions_today: 14,
        satellites_protected: 97,
        satellites_protected_today: 2,
      },
      recent_alerts: [
        {
          message: "Critical debris detected near ISS orbit path.",
          time: "2025-10-28T12:34:00Z",
        },
        {
          message: "Satellite ORB-217 showing high velocity anomaly.",
          time: "2025-10-28T10:15:00Z",
        },
        {
          message: "New object entered LEO – classification pending.",
          time: "2025-10-28T08:50:00Z",
        },
      ],
      high_priority_tracking: [
        {
          object: "COSMOS-1408 Debris",
          type: "Fragment",
          altitude_km: 480,
          velocity_kms: 7.82,
          size: "Medium",
          risk: "High",
        },
        {
          object: "STARLINK-2319",
          type: "Satellite",
          altitude_km: 550,
          velocity_kms: 7.68,
          size: "Small",
          risk: "Medium",
        },
        {
          object: "ARIANE Upper Stage",
          type: "Rocket Body",
          altitude_km: 720,
          velocity_kms: 7.45,
          size: "Large",
          risk: "Critical",
        },
        {
          object: "UNKNOWN-LEO-021",
          type: "Unknown",
          altitude_km: 420,
          velocity_kms: 7.85,
          size: "Small",
          risk: "Low",
        },
      ],
    };

    // simulate loading delay
    setTimeout(() => setData(staticData), 800);
  }, []);

  if (!data) {
    return (
      <div className="relative min-h-screen text-gray-200 overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <h2 className="text-xl font-orbitron font-bold text-gray-300 animate-pulse">
            Loading Mission Control Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  const { stats, recent_alerts, high_priority_tracking } = data;
  const maxAlerts = 3;
  const latestAlerts = recent_alerts.slice(0, maxAlerts);

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden">
      <StarfieldBackground />
      <div className="relative z-10 min-h-screen">
        <Navbar />

        <div className="p-6 pt-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                Mission Control Dashboard
              </h1>
              <p className="text-gray-400 text-sm font-inter tracking-wide">
                Real-time space debris monitoring and threat assessment
              </p>
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              value={stats.objects_tracked}
              label="Objects Tracked"
              change={`+${stats.objects_tracked_today} today`}
              color="text-white"
              Icon={Satellite}
            />
            <StatCard
              value={stats.active_threats}
              label="Active Threats"
              change={`${stats.active_threats_change >= 0 ? "+" : ""}${stats.active_threats_change} today`}
              color="text-white"
              Icon={AlertTriangle}
            />
            <StatCard
              value={stats.predictions_made}
              label="Predictions Made"
              change={`+${stats.predictions_today} today`}
              color="text-white"
              Icon={Activity}
            />
            <StatCard
              value={stats.satellites_protected}
              label="Satellites Protected"
              change={`+${stats.satellites_protected_today} today`}
              color="text-white"
              Icon={Globe}
            />
          </div>

          {/* Orbital Map */}
          <div className="space-y-6 mb-8">
            <div className="relative bg-gradient-to-b from-black/20 via-black/10 to-transparent backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-orbitron font-bold text-gray-200 tracking-wide">
                  Real-Time Orbital Map
                </h2>
                <span className="text-sm text-green-400 font-bold animate-pulse">● LIVE</span>
              </div>
              <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-inner shadow-black/40">
                <OrbitMapPro />
              </div>
            </div>

            {/* System Status + Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Status */}
              <div className="bg-transparent backdrop-blur-md p-5 rounded-xl shadow-md border border-white/10">
                <h2 className="text-xl font-orbitron font-bold text-white mb-3">System Status</h2>
                <ul className="space-y-2 text-sm font-inter text-gray-300">
                  <li className="flex justify-between">
                    <span>Tracking Network</span> <span className="text-white">● OPERATIONAL</span>
                  </li>
                  <li className="flex justify-between">
                    <span>AI Prediction Engine</span> <span className="text-white">● ACTIVE</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Data Processing</span> <span className="text-white">● PROCESSING</span>
                  </li>
                </ul>
                <p className="mt-4 text-center text-2xl font-orbitron font-bold text-white">99.7%</p>
                <p className="text-center text-gray-400 text-sm">System Uptime</p>
              </div>

              {/* Recent Alerts */}
              <div className="bg-transparent backdrop-blur-md p-5 rounded-xl shadow-md border border-white/10">
                <h2 className="text-xl font-orbitron font-bold text-white mb-3">Recent Alerts</h2>
                <div className="space-y-3 text-sm">
                  {latestAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-md bg-red-900/20 border border-red-500/30">
                      ⚠️ {alert.message}
                      <span className="block text-xs text-gray-400">
                        {new Date(alert.time).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* High-Priority Debris Table */}
          <div className="bg-transparent backdrop-blur-md p-5 rounded-xl shadow-md border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-orbitron font-bold text-white">High-Priority Debris Tracking</h2>
              <button className="px-4 py-1 rounded-lg border border-purple-500 text-white text-sm flex items-center gap-1 hover:bg-purple-900/40 transition">
                <Eye size={14} /> View All
              </button>
            </div>
            <table className="w-full text-sm font-inter">
              <thead>
                <tr className="text-white text-left border-b border-purple-800">
                  <th className="py-2">Object Name</th>
                  <th>Type</th>
                  <th>Altitude</th>
                  <th>Velocity</th>
                  <th>Size</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {high_priority_tracking.map((item, idx) => (
                  <ThreatRow
                    key={idx}
                    object={item.object}
                    type={item.type}
                    alt={item.altitude_km}
                    velocity={item.velocity_kms}
                    size={item.size}
                    risk={item.risk}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
