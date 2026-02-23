import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { FiMenu, FiX, FiHome, FiInfo } from "react-icons/fi";
import { SiTensorflow } from "react-icons/si";
import { Radar, AlertTriangle } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Home", icon: <FiHome size={16} />, path: "/" },
    { name: "Dashboard", icon: <Radar size={16} />, path: "/dashboard" },
    { name: "Predictions", icon: <AlertTriangle size={16} />, path: "/predictions" },
    { name: "AIPredictor", icon: <SiTensorflow size={16} />, path: "/aipredictor" },
    { name: "About", icon: <FiInfo size={16} />, path: "/about" },
  ];

  return (
    <header
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[94%] 
                 z-50 bg-white/10 backdrop-blur-lg border border-white/20 
                 shadow-[0_0_20px_rgba(255,255,255,0.08)] 
                 rounded-2xl py-3 px-6 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="OrbitXOS Logo"
            className="w-8 h-8 object-cover rounded-full"
          />
          <h1 className="font-orbitron text-lg font-semibold text-white tracking-wide">
            OrbitXOS
          </h1>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `relative flex items-center gap-2 transition-all duration-200 
                 ${
                   isActive
                     ? "text-white after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-white"
                     : "text-gray-300 hover:text-white hover:after:absolute hover:after:left-0 hover:after:bottom-[-4px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-400"
                 }`
              }
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-3 bg-black/40 backdrop-blur-md 
                        border border-white/10 rounded-xl px-5 py-4 shadow-lg">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm py-2 px-2 rounded-lg transition-all 
                 ${
                   isActive
                     ? "text-white border-b border-white"
                     : "text-gray-300 hover:text-white hover:border-b hover:border-gray-400"
                 }`
              }
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
