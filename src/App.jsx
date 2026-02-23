import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import AIPredictor from "./pages/AIPredictor";
import About from "./pages/About";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/aipredictor" element={<AIPredictor />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
