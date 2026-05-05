import React, { useState, useEffect } from "react";
// Asset Imports
import logo from "../assets/images/floodguard-logo.png";
import pagasaLogo from "../assets/images/pagasa_logo.png";
import openMeteoLogo from "../assets/images/open_mateo_logo.png";

const StatusCard = ({ name, url, status, type, icon }) => {
  let statusColor = "#94a3b8";
  let statusBg = "#f1f5f9";
  let statusBorder = "#cbd5e1";
  let statusText = "#475569";
  let accentColor = "#cbd5e1";
  let isPulsing = false;

  if (status === "Online") {
    statusColor = "#22c55e"; // green-500
    statusBg = "#f0fdf4"; // green-50
    statusBorder = "#bbf7d0"; // green-200
    statusText = "#15803d"; // green-700
    accentColor = "#22c55e";
  } else if (status === "Offline" || status === "Error") {
    statusColor = "#ef4444"; // red-500
    statusBg = "#fef2f2"; // red-50
    statusBorder = "#fecaca"; // red-200
    statusText = "#b91c1c"; // red-700
    accentColor = "#ef4444";
  } else if (status === "Checking...") {
    statusColor = "#3b82f6"; // blue-500
    statusBg = "#eff6ff"; // blue-50
    statusBorder = "#bfdbfe"; // blue-200
    statusText = "#1d4ed8"; // blue-700
    accentColor = "#3b82f6";
    isPulsing = true;
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: `1px solid ${statusBorder}`,
        borderTop: `6px solid ${accentColor}`,
        padding: "1.5rem",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#f8fafc",
              border: `1px solid ${statusBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <img 
              src={icon} 
              alt={`${name} logo`} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
              onError={(e) => e.target.style.display = "none"} 
            />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: "800" }}>{name}</h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>{type}</span>
          </div>
        </div>
      </div>
      
      <div 
        style={{ 
          flex: 1, 
          backgroundColor: statusBg, 
          padding: "1rem", 
          borderRadius: "12px", 
          border: `1px solid ${statusBorder}`, 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem" 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: statusText, fontWeight: "600" }}>Connection Status:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div 
              className={isPulsing ? "animate-pulse" : ""}
              style={{ 
                width: "10px", 
                height: "10px", 
                borderRadius: "50%", 
                backgroundColor: statusColor 
              }}
            ></div>
            <span style={{ fontSize: "0.9rem", color: statusText, fontWeight: "800" }}>{status}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: statusText, fontWeight: "600" }}>API Endpoint:</span>
          <a 
            href={url} 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              fontSize: "0.85rem", 
              color: "#0ea5e9", 
              fontWeight: "700", 
              textDecoration: "none",
              borderBottom: "1px dotted #0ea5e9"
            }}
          >
            View Source ↗
          </a>
        </div>
      </div>
    </div>
  );
};

const Status = () => {
  // State to hold the live health of our APIs
  const [engineStatus, setEngineStatus] = useState("Checking...");
  const [openMeteoStatus, setOpenMeteoStatus] = useState("Checking...");

  // Function to actually ping the APIs
  const checkSystemsHealth = async () => {
    // 1. Check Flask Engine (This now represents the Engine, the Parser, and the KOICA Scraper!)
    try {
      const res = await fetch("https://floodguard-engine.onrender.com/api/status");
      if (res.ok) setEngineStatus("Online");
      else setEngineStatus("Error");
    } catch (err) {
      setEngineStatus("Offline");
    }

    // 2. Check Open-Meteo
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=14.6408&longitude=121.1041&current=precipitation",
      );
      if (res.ok) setOpenMeteoStatus("Online");
      else setOpenMeteoStatus("Error");
    } catch (err) {
      setOpenMeteoStatus("Offline");
    }
  };

  useEffect(() => {
    // Run the check immediately on mount
    checkSystemsHealth();

    // Set an interval to re-check every 30 seconds
    const intervalId = setInterval(checkSystemsHealth, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Map the live states to the arrays used by the UI
  const infraSystems = [
    {
      name: "FloodGuard AI Engine",
      type: "Flask Backend & ML Model",
      url: "https://floodguard-engine.onrender.com/api/status",
      status: engineStatus,
      icon: logo,
    },
    {
      name: "Open-Meteo API",
      type: "Live Precipitation",
      url: "https://open-meteo.com",
      status: openMeteoStatus,
      icon: openMeteoLogo,
    },
  ];

  const pagasaSystems = [
    {
      name: "Chlod.net Parser",
      type: "Cyclone Bulletin API",
      url: "https://pagasa.chlod.net",
      status: engineStatus, // Linked directly to the engine
      icon: pagasaLogo,
    },
    {
      name: "KOICA Water Scraper",
      type: "Selenium Web Scraper",
      url: "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/table.do",
      status: engineStatus, // Linked directly to the engine
      icon: pagasaLogo,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        padding: "3rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0 0 0.5rem 0",
                letterSpacing: "-0.03em",
              }}
            >
              System Diagnostics
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#475569", margin: 0 }}>
              Real-time health monitoring for scrapers and core architecture.
            </p>
          </div>
          
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              backgroundColor: engineStatus === "Online" ? "#f0fdf4" : "#fef2f2", 
              border: `1px solid ${engineStatus === "Online" ? "#bbf7d0" : "#fecaca"}`, 
              padding: "0.5rem 1rem", 
              borderRadius: "999px" 
            }}
          >
            <div 
              style={{ 
                width: "10px", 
                height: "10px", 
                backgroundColor: engineStatus === "Online" ? "#22c55e" : (engineStatus === "Checking..." ? "#3b82f6" : "#ef4444"), 
                borderRadius: "50%" 
              }}
            ></div>
            <span 
              style={{ 
                fontSize: "0.85rem", 
                fontWeight: "700", 
                color: engineStatus === "Online" ? "#15803d" : (engineStatus === "Checking..." ? "#1d4ed8" : "#b91c1c") 
              }}
            >
              Engine Check: {engineStatus}
            </span>
          </div>
        </div>

        <section style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Core Infrastructure</h2>
            <div style={{ flex: 1, height: "2px", background: "linear-gradient(90deg, #bae6fd, transparent)" }}></div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {infraSystems.map((sys, idx) => (
              <StatusCard key={idx} {...sys} />
            ))}
          </div>
        </section>

        <section style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>PAGASA Data Sources</h2>
            <div style={{ flex: 1, height: "2px", background: "linear-gradient(90deg, #bae6fd, transparent)" }}></div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {pagasaSystems.map((sys, idx) => (
              <StatusCard key={idx} {...sys} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Status;
