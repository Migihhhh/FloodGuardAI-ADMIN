import React from "react";
// Asset Imports
import logo from "../assets/images/floodguard-logo.png";
import pagasaLogo from "../assets/images/pagasa_logo.png";
import openMeteoLogo from "../assets/images/open_mateo_logo.png";

const StatusCard = ({ name, url, status, type, icon }) => {
  const isOnline = status === "Online";

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#bae6fd] shadow-sm flex flex-col gap-5 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-1 w-full max-w-[420px]">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f9ff] flex items-center justify-center border border-[#bae6fd] p-2 overflow-hidden shadow-inner">
            <img
              src={icon}
              alt={`${name} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-[#0284c7] uppercase tracking-[0.15em]">
              {type}
            </span>
            <h3 className="text-xl font-black text-[#0f172a] leading-tight">
              {name}
            </h3>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          ></div>
          {status}
        </div>
      </div>

      <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] h-20 flex items-center overflow-hidden">
        <code className="text-[11px] text-[#64748b] break-all font-mono leading-tight">
          {url}
        </code>
      </div>

      <div className="flex justify-between items-center text-sm border-t border-[#f1f5f9] pt-4">
        <span className="text-[#94a3b8] font-bold uppercase text-[10px] tracking-widest">
          Network Latency
        </span>
        <span className="font-black text-[#475569]">
          {isOnline ? "38ms" : "--"}
        </span>
      </div>
    </div>
  );
};

const Status = () => {
  const infraSystems = [
    {
      name: "FloodGuard AI",
      url: "http://localhost:5000/api/main",
      status: "Offline",
      type: "Core Backend",
      icon: logo,
    },
    {
      name: "MongoDB Database",
      url: "mongodb+srv://cluster0.x7z.mongodb.net/",
      status: "Offline",
      type: "Primary Database",
      icon: "https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg",
    },
    {
      name: "Open-Meteo API",
      url: "https://api.open-meteo.com/v1/forecast",
      status: "Online",
      type: "Weather Engine",
      icon: openMeteoLogo,
    },
  ];

  const scraperSystems = [
    {
      name: "KOICA Flood Bulletin",
      url: "https://www.pagasa.dost.gov.ph/flood#koica",
      status: "Offline",
      type: "PAGASA Scraper",
      icon: pagasaLogo,
    },
    {
      name: "TC Weather Bulletin",
      url: "https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin",
      status: "Offline",
      type: "PAGASA Scraper",
      icon: pagasaLogo,
    },
    {
      name: "Pasig-Marikina FFWS",
      url: "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/table.do",
      status: "Offline",
      type: "Telemetry Scraper",
      icon: pagasaLogo,
    },
  ];

  return (
    /* CHANGED: Added pt-32 (Padding Top) to push the content down from the TopNav */
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] pt-32 pb-20 px-12 flex flex-col items-center">
      <div className="w-full max-w-[1400px] flex flex-col gap-14">
        {/* Headline Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">
            System Status
          </h1>
          <p className="text-[#64748b] font-bold text-lg">
            Real-time health monitoring for scrapers and core architecture.
          </p>
        </div>

        {/* Infrastructure Section */}
        <section className="w-full">
          <div className="flex items-center gap-5 mb-8">
            <h2 className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.3em] whitespace-nowrap">
              Core Infrastructure
            </h2>
            <div className="h-[1px] bg-[#bae6fd] w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {infraSystems.map((sys, idx) => (
              <StatusCard key={idx} {...sys} />
            ))}
          </div>
        </section>

        {/* Scrapers Section */}
        <section className="w-full">
          <div className="flex items-center gap-5 mb-8">
            <h2 className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.3em] whitespace-nowrap">
              PAGASA Data Sources
            </h2>
            <div className="h-[1px] bg-[#bae6fd] w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {scraperSystems.map((sys, idx) => (
              <StatusCard key={idx} {...sys} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Status;
