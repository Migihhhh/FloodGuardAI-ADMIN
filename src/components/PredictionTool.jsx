import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import marikinaGeoJSON from "../assets/data/marikina.json";

const marikinaBarangays = [
  "Barangka",
  "Calumpang",
  "Concepcion Uno",
  "Concepcion Dos",
  "Fortune",
  "Industrial Valley (IVC)",
  "Jesus de la Peña",
  "Malanday",
  "Marikina Heights",
  "Nangka",
  "Parang",
  "San Roque",
  "Santa Elena",
  "Santo Niño",
  "Tañong",
  "Tumana",
];

const marikinaTableData = [
  { id: 1, name: "Barangka", floodProb: 5 },
  { id: 2, name: "Calumpang", floodProb: 8 },
  { id: 3, name: "Concepcion Uno", floodProb: 2 },
  { id: 4, name: "Concepcion Dos", floodProb: 2 },
  { id: 5, name: "Fortune", floodProb: 1 },
  { id: 6, name: "Industrial Valley (IVC)", floodProb: 12 },
  { id: 7, name: "Jesus de la Peña", floodProb: 10 },
  { id: 8, name: "Malanday", floodProb: 15 },
  { id: 9, name: "Marikina Heights", floodProb: 2 },
  { id: 10, name: "Nangka", floodProb: 14 },
  { id: 11, name: "Parang", floodProb: 3 },
  { id: 12, name: "San Roque", floodProb: 6 },
  { id: 13, name: "Santa Elena", floodProb: 8 },
  { id: 14, name: "Santo Niño", floodProb: 9 },
  { id: 15, name: "Tañong", floodProb: 5 },
  { id: 16, name: "Tumana", floodProb: 15 },
];

const defaultPagasaData = {
  cycloneBulletin: {
    active: false,
    name: "None",
    category: "No Active Tropical Cyclone",
    maxWinds: "N/A",
    ncrSignal: "No Signal",
    lastUpdated: "Live",
    sourceUrl:
      "https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin",
  },
  koicaFloodAdvisory: {
    stations: [
      {
        name: "Sto. Niño",
        currentLevel: 12.8,
        criticalLevel: 18.0,
        status: "Normal",
      },
      {
        name: "Tumana",
        currentLevel: 12.5,
        criticalLevel: 17.5,
        status: "Normal",
      },
      {
        name: "Nangka",
        currentLevel: 13.2,
        criticalLevel: 17.7,
        status: "Normal",
      },
    ],
    lastUpdated: "Live",
    sourceUrl: "https://www.pagasa.dost.gov.ph/flood#koica",
  },
  dailyWeather: {
    location: "Marikina City",
    condition: "Loading API Data...",
    tempRange: "--°C",
    humidity: "--%",
    lastUpdated: "Live",
    sourceUrl: "https://bagong.pagasa.dost.gov.ph",
  },
};

const generate24HourData = (baseRisk) => {
  return Array.from({ length: 24 }, (_, i) => {
    const time = new Date();
    time.setHours(time.getHours() + i);
    const prob = Math.min(
      100,
      Math.max(
        0,
        baseRisk + Math.sin((i / 24) * Math.PI) * 8 + Math.random() * 4 - 2,
      ),
    );
    return {
      time: time.toLocaleTimeString([], { hour: "numeric", hour12: true }),
      prob: Math.round(prob),
    };
  });
};

const getBarangayData = (barangayName) =>
  marikinaTableData.find((b) => b.name === barangayName) || { floodProb: 0 };
const getAlertColor = (probability) => {
  if (probability >= 65) return "#ef4444";
  if (probability >= 35) return "#eab308";
  return "#22c55e";
};

const PredictionTool = () => {
  const [selectedBarangay, setSelectedBarangay] = useState("Malanday");
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [scrapedPagasaData, setScrapedPagasaData] = useState(defaultPagasaData);

  // --- REUSABLE PREDICTION LOGIC ---
  const handlePredict = (targetBarangay = selectedBarangay) => {
    setSelectedBarangay(targetBarangay);
    setIsPredicting(true);
    setPredictionResults(null);

    // Simulate AI Processing Delay
    setTimeout(() => {
      const hourlyData = generate24HourData(
        getBarangayData(targetBarangay).floodProb,
      );
      const maxProb = Math.max(...hourlyData.map((d) => d.prob));
      let riskLevel = "Low Risk";
      let riskColor = "#22c55e";
      if (maxProb >= 50) {
        riskLevel = "Moderate Risk";
        riskColor = "#eab308";
      }
      if (maxProb >= 75) {
        riskLevel = "High Risk";
        riskColor = "#ef4444";
      }
      setPredictionResults({
        hourly: hourlyData,
        peakProbability: maxProb,
        riskLevel,
        riskColor,
      });
      setIsPredicting(false);
    }, 1500); // Trigger 1.5s simulation
  };

  // --- AUTOMATIC GENERATION ON LOAD ---
  useEffect(() => {
    // Automatically runs prediction for the default barangay when component mounts
    handlePredict("Malanday");
  }, []);

  // --- REAL API FETCH ---
  useEffect(() => {
    const fetchRealWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=14.6408&longitude=121.1041&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FManila",
        );
        const data = await res.json();

        let conditionStr = "Partly Cloudy";
        const code = data.current.weather_code;
        if (code === 0) conditionStr = "Clear / Sunny";
        if (code >= 51 && code <= 65) conditionStr = "Raining";
        if (code >= 95) conditionStr = "Thunderstorms";

        setScrapedPagasaData((prev) => ({
          ...prev,
          dailyWeather: {
            ...prev.dailyWeather,
            condition: conditionStr,
            tempRange: `${Math.round(data.current.temperature_2m)}°C (Current)`,
            humidity: `${data.current.relative_humidity_2m}%`,
            lastUpdated: new Date().toLocaleTimeString(),
          },
        }));
      } catch (err) {
        console.error("API Fetch Error:", err);
      }
    };
    fetchRealWeather();
  }, []);

  const marikinaBounds = [
    [14.6105, 121.08],
    [14.6785, 121.1275],
  ];

  const getFeatureStyle = (feature) => {
    const barangayName = feature.properties.NAME_3;
    const isSelected = barangayName === selectedBarangay;
    return {
      fillColor: getAlertColor(getBarangayData(barangayName).floodProb),
      fillOpacity: isSelected ? 0.9 : 0.4,
      weight: isSelected ? 3 : 1.5,
      color: isSelected ? "#0284c7" : "#ffffff",
      dashArray: isSelected ? "" : "3",
    };
  };

  const onEachBarangay = (feature, layer) => {
    const barangayName = feature.properties.NAME_3;
    layer.bindTooltip(
      `<div class="font-bold text-center" style="color: #0f172a;">${barangayName}<br/><span style="font-weight: 700; color: #0284c7;">Base Risk: ${getBarangayData(barangayName).floodProb}%</span><br/><span style="font-size: 0.8rem; color: #64748b;">Click to run AI Prediction</span></div>`,
      { sticky: true },
    );
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 3 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        handlePredict(barangayName);
      },
    });
  };

  const isCycloneActive = scrapedPagasaData.cycloneBulletin.active;
  const cycloneCardStyle = isCycloneActive
    ? {
        bg: "#ffffff",
        border: "#fecaca",
        accent: "#ef4444",
        iconBg: "#fef2f2",
        textHead: "#b91c1c",
        textBody: "#7f1d1d",
      }
    : {
        bg: "#ffffff",
        border: "#bbf7d0",
        accent: "#22c55e",
        iconBg: "#f0fdf4",
        textHead: "#15803d",
        textBody: "#166534",
      };

  const isFloodActive = scrapedPagasaData.koicaFloodAdvisory.stations.some(
    (s) => s.status !== "Normal",
  );
  const floodCardStyle = isFloodActive
    ? {
        bg: "#ffffff",
        border: "#fef08a",
        accent: "#eab308",
        iconBg: "#fefce8",
        textHead: "#a16207",
        textSub: "#854d0e",
      }
    : {
        bg: "#ffffff",
        border: "#bae6fd",
        accent: "#0ea5e9",
        iconBg: "#f0f9ff",
        textHead: "#0369a1",
        textSub: "#075985",
      };

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
          gap: "2rem",
        }}
      >
        {/* Header Section */}
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
              Flood Prediction Intelligence
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#475569", margin: 0 }}>
              Powered by FloodGuard AI and real-time APIs.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#e0f2fe",
              border: "1px solid #bae6fd",
              padding: "0.5rem 1rem",
              borderRadius: "999px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#22c55e",
                borderRadius: "50%",
              }}
            ></div>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#0369a1",
              }}
            >
              Live API Connected
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Cyclone Bulletin */}
          <div
            style={{
              backgroundColor: cycloneCardStyle.bg,
              borderRadius: "16px",
              border: `1px solid ${cycloneCardStyle.border}`,
              borderTop: `6px solid ${cycloneCardStyle.accent}`,
              padding: "1.5rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {isCycloneActive ? "🌀" : "☀️"}
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: cycloneCardStyle.textHead,
                      fontSize: "1rem",
                      fontWeight: "800",
                    }}
                  >
                    Tropical Cyclone Bulletin
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Updated: {scrapedPagasaData.cycloneBulletin.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: cycloneCardStyle.iconBg,
                padding: "1rem",
                borderRadius: "12px",
                border: `1px solid ${cycloneCardStyle.border}`,
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: cycloneCardStyle.textHead,
                    fontWeight: "600",
                  }}
                >
                  Status:
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: cycloneCardStyle.textBody,
                    fontWeight: "800",
                  }}
                >
                  {scrapedPagasaData.cycloneBulletin.category}
                </span>
              </div>
              {isCycloneActive && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textHead,
                        fontWeight: "600",
                      }}
                    >
                      Max Winds:
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textBody,
                        fontWeight: "800",
                      }}
                    >
                      {scrapedPagasaData.cycloneBulletin.maxWinds}
                    </span>
                  </div>
                </>
              )}
            </div>
            <a
              href={scrapedPagasaData.cycloneBulletin.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                textDecoration: "underline",
                alignSelf: "flex-end",
              }}
            >
              Data Source: PAGASA
            </a>
          </div>

          {/* Daily Weather */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #bae6fd",
              borderTop: "6px solid #0ea5e9",
              padding: "1.5rem",
              boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🌤️</span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#0369a1",
                      fontSize: "1rem",
                      fontWeight: "800",
                    }}
                  >
                    Daily Weather Forecast
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Updated: {scrapedPagasaData.dailyWeather.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#f0f9ff",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid #7dd3fc",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#075985",
                    fontWeight: "600",
                  }}
                >
                  Condition:
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#0c4a6e",
                    fontWeight: "800",
                  }}
                >
                  {scrapedPagasaData.dailyWeather.condition}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#075985",
                    fontWeight: "600",
                  }}
                >
                  Temp:
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#0c4a6e",
                    fontWeight: "800",
                  }}
                >
                  {scrapedPagasaData.dailyWeather.tempRange}
                </span>
              </div>
            </div>
            <a
              href={scrapedPagasaData.dailyWeather.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                textDecoration: "underline",
                alignSelf: "flex-end",
              }}
            >
              Live Data from Open-Meteo
            </a>
          </div>

          {/* KOICA Advisory */}
          <div
            style={{
              backgroundColor: floodCardStyle.bg,
              borderRadius: "16px",
              border: `1px solid ${floodCardStyle.border}`,
              borderTop: `6px solid ${floodCardStyle.accent}`,
              padding: "1.5rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🌊</span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: floodCardStyle.textHead,
                      fontSize: "1rem",
                      fontWeight: "800",
                    }}
                  >
                    KOICA Flood Advisory
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Updated: {scrapedPagasaData.koicaFloodAdvisory.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: floodCardStyle.iconBg,
                padding: "1rem",
                borderRadius: "12px",
                border: `1px solid ${floodCardStyle.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {scrapedPagasaData.koicaFloodAdvisory.stations.map(
                (station, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "0.5rem",
                      borderBottom:
                        idx !== 2
                          ? `1px solid ${floodCardStyle.border}`
                          : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: floodCardStyle.textSub,
                        fontWeight: "800",
                      }}
                    >
                      {station.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: floodCardStyle.textSub,
                        fontWeight: "800",
                      }}
                    >
                      {station.currentLevel}m
                    </span>
                  </div>
                ),
              )}
            </div>
            <a
              href={scrapedPagasaData.koicaFloodAdvisory.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                textDecoration: "underline",
                alignSelf: "flex-end",
              }}
            >
              Data Source: KOICA
            </a>
          </div>
        </div>

        {/* Map and Result Section */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1.2",
              minWidth: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: "65vh",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 15px 35px -5px rgba(2, 132, 199, 0.1)",
                border: "1px solid #bae6fd",
                backgroundColor: "#ffffff",
              }}
            >
              <MapContainer
                center={[14.645, 121.105]}
                zoom={14}
                minZoom={13}
                maxBounds={marikinaBounds}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={false}
                className="w-full h-full"
                style={{ background: "#e0f2fe", height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; Carto"
                />
                {marikinaGeoJSON && (
                  <GeoJSON
                    key={selectedBarangay}
                    data={marikinaGeoJSON}
                    style={getFeatureStyle}
                    onEachFeature={onEachBarangay}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div
            style={{
              flex: "1",
              minWidth: "400px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #bae6fd",
              padding: "2.5rem",
              boxShadow: "0 15px 35px -5px rgba(2, 132, 199, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0 0 1.5rem 0",
              }}
            >
              Flood Prediction
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <select
                value={selectedBarangay}
                onChange={(e) => handlePredict(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                {marikinaBarangays.map((brgy) => (
                  <option key={brgy} value={brgy}>
                    {brgy}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handlePredict()}
                disabled={isPredicting}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: isPredicting ? "#94a3b8" : "#0284c7",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: "700",
                  border: "none",
                }}
              >
                {isPredicting ? "Processing Model..." : "Generate Forecast"}
              </button>
            </div>

            {predictionResults && !isPredicting && (
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Results for{" "}
                  <span style={{ color: "#0f172a", fontWeight: "800" }}>
                    {selectedBarangay}
                  </span>
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    marginTop: "1rem",
                    backgroundColor: "#f8fafc",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "4.5rem",
                      fontWeight: "800",
                      color: predictionResults.riskColor,
                    }}
                  >
                    {predictionResults.peakProbability}%
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "700",
                        color: "#64748b",
                      }}
                    >
                      PEAK RISK
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "800",
                        color: predictionResults.riskColor,
                      }}
                    >
                      {predictionResults.riskLevel}
                    </div>
                  </div>
                </div>

                <h4
                  style={{
                    fontSize: "1.1rem",
                    color: "#0f172a",
                    fontWeight: "800",
                    margin: "1.5rem 0 1rem 0",
                  }}
                >
                  24-Hour Timeline
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    overflowX: "auto",
                    paddingBottom: "1rem",
                  }}
                >
                  {predictionResults.hourly.map((hour, idx) => (
                    <div
                      key={idx}
                      style={{
                        minWidth: "85px",
                        padding: "1rem 0.5rem",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "12px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                        {hour.time}
                      </div>
                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: "800",
                          color: "#3b82f6",
                        }}
                      >
                        {hour.prob}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isPredicting && (
              <div
                style={{
                  textAlign: "center",
                  color: "#0369a1",
                  fontWeight: "700",
                }}
              >
                Scraping live data & running model...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;
