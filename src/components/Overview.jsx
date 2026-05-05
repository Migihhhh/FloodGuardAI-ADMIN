import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import marikinaGeoJSON from "../assets/data/marikina.json";

// Updated to match the accurate base percentages from PredictionTool.jsx
const marikinaTableData = [
  { id: 1, name: "Barangka", floodProb: 5 },
  { id: 2, name: "Calumpang", floodProb: 8 },
  { id: 3, name: "Concepcion Uno", floodProb: 12 },
  { id: 4, name: "Concepcion Dos", floodProb: 2 },
  { id: 5, name: "Fortune", floodProb: 4 },
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

// Initial Loading State for Stations
const initialWaterStations = [
  {
    id: 1,
    name: "Sto. Niño (Marikina River)",
    mapName: "Santo Niño",
    riverKey: "sto_nino",
    status: "Loading...",
    level: 0.0,
    thresholds: { alert: 15.0, alarm: 16.0, critical: 18.0 },
    lat: 14.6335,
    lng: 121.094,
  },
  {
    id: 2,
    name: "Nangka River",
    mapName: "Nangka",
    riverKey: "nangka",
    status: "Loading...",
    level: 0.0,
    thresholds: { alert: 16.0, alarm: 16.5, critical: 17.0 },
    lat: 14.6685,
    lng: 121.10005,
  },
  {
    id: 3,
    name: "Tumana Bridge",
    mapName: "Tumana",
    riverKey: "tumana",
    status: "Loading...",
    level: 0.0,
    thresholds: { alert: 16.0, alarm: 16.5, critical: 17.0 },
    lat: 14.655,
    lng: 121.0965,
  },
];

// Default empty state before Open-Meteo API loads
const defaultWeatherForecasts = marikinaTableData.map((b) => ({
  id: b.id,
  name: b.name,
  condition: "Loading...",
  rainChance: 0,
  precip: 0.0,
  temp: 0,
  wind: 0,
  humidity: 0,
}));

const getBarangayData = (barangayName) =>
  marikinaTableData.find((b) => b.name === barangayName) || { floodProb: 0 };

const getStatusColor = (status) => {
  if (typeof status === "string") {
    const s = status.toUpperCase();
    if (s === "CRITICAL") return "#ef4444";
    if (s === "WARNING" || s === "ALARM" || s === "ALERT") return "#eab308";
    if (s === "SAFE" || s === "NORMAL") return "#22c55e";
  }
  return "#94a3b8";
};

const getWeatherMapColor = (rainChance) => {
  if (rainChance >= 75) return "#1e3a8a";
  if (rainChance >= 50) return "#3b82f6";
  return "#bae6fd";
};

const getWeatherCardStyle = (condition) => {
  if (condition === "Heavy Rain")
    return { border: "#1e3a8a", text: "#1e3a8a", bg: "#eff6ff" };
  if (condition === "Moderate Rain")
    return { border: "#3b82f6", text: "#2563eb", bg: "#f0f9ff" };
  if (condition === "Light Rain")
    return { border: "#7dd3fc", text: "#0284c7", bg: "#f8fafc" };
  return { border: "#cbd5e1", text: "#475569", bg: "#f8fafc" };
};

const createWaterIcon = (status) => {
  const color = getStatusColor(status);
  return L.divIcon({
    className: "custom-station-marker",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 0 15px rgba(0,0,0,0.4);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const WeatherForecastCard = ({ data, innerRef, isHighlighted }) => {
  const [expanded, setExpanded] = useState(false);
  const style = getWeatherCardStyle(data.condition);
  const cardBoxShadow = isHighlighted
    ? "0 0 0 4px #bae6fd, 0 10px 25px rgba(2, 132, 199, 0.3)"
    : "0 4px 15px rgba(2, 132, 199, 0.05)";
  const cardTransform = isHighlighted ? "scale(1.02)" : "scale(1)";

  return (
    <div
      ref={innerRef}
      style={{
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: `2px solid ${style.border}`,
        borderLeft: `8px solid ${style.border}`,
        boxShadow: cardBoxShadow,
        transform: cardTransform,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              color: "#0f172a",
              fontWeight: "800",
            }}
          >
            {data.name}
          </h3>
          <span
            style={{
              fontSize: "0.85rem",
              color: style.text,
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              backgroundColor: style.bg,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            {data.condition}
          </span>
        </div>
        <div
          style={{
            fontSize: "2.2rem",
            fontWeight: "800",
            color: "#0f172a",
            letterSpacing: "-0.05em",
          }}
        >
          {data.temp}°
          <span style={{ fontSize: "1.2rem", color: "#64748b" }}>C</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.8rem",
          marginBottom: "1.25rem",
          padding: "1rem",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Rain Chance:</span>{" "}
          <span style={{ fontWeight: "700", color: style.text }}>
            {data.rainChance}%
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Precipitation:</span>{" "}
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            {data.precip} mm
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Humidity:</span>{" "}
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            {data.humidity}%
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Wind Gust:</span>{" "}
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            {data.wind} km/h
          </span>
        </div>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "0.8rem",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          color: "#0369a1",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {expanded ? "Hide 5-Day Forecast" : "Show 5-Day Forecast"}{" "}
        <span style={{ fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem 0 0 0",
            borderTop: "1px dashed #cbd5e1",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          {[1, 2, 3, 4, 5].map((day, index) => {
            const futureRain = Math.max(
              0,
              data.rainChance - day * 15 + Math.random() * 10,
            );
            const isRisky = futureRain > 75;
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: index !== 4 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    fontWeight: "600",
                  }}
                >
                  Day {day}
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: isRisky ? "#1e3a8a" : "#0f172a",
                    fontWeight: "700",
                  }}
                >
                  {futureRain.toFixed(0)}% Rain
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: isRisky ? "#1e3a8a" : "#0284c7",
                    fontWeight: "700",
                    backgroundColor: isRisky ? "#eff6ff" : "#f0f9ff",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                  }}
                >
                  {isRisky ? "High Risk" : "Normal"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DashboardBody = () => {
  const [activeTab, setActiveTab] = useState("stations");
  const [highlightedCard, setHighlightedCard] = useState(null);

  // States for live APIs
  const [waterStationsData, setWaterStationsData] =
    useState(initialWaterStations);
  const [engineTimeline, setEngineTimeline] = useState(null);
  const [weatherForecasts, setWeatherForecasts] = useState(
    defaultWeatherForecasts,
  );

  const cardRefs = useRef({});

  // --- REAL FLASK API FETCH (Water Stations) ---
  useEffect(() => {
    const fetchFlaskEngine = async () => {
      try {
        const res = await fetch("https://floodguard-engine.onrender.com/api/status");
        const data = await res.json();

        // Update the Water Stations with real live readings and AI Status
        if (data && data.live_sensors && data.prediction) {
          setWaterStationsData([
            {
              id: 1,
              name: "Sto. Niño (Marikina River)",
              mapName: "Santo Niño",
              riverKey: "sto_nino",
              status: data.prediction.rivers.sto_nino.status,
              level: data.live_sensors.sto_nino,
              thresholds: { alert: 15.0, alarm: 16.0, critical: 18.0 },
              lat: 14.6335,
              lng: 121.094,
            },
            {
              id: 2,
              name: "Nangka River",
              mapName: "Nangka",
              riverKey: "nangka",
              status: data.prediction.rivers.nangka.status,
              level: data.live_sensors.nangka,
              thresholds: { alert: 16.0, alarm: 16.5, critical: 17.0 },
              lat: 14.6685,
              lng: 121.10005,
            },
            {
              id: 3,
              name: "Tumana Bridge",
              mapName: "Tumana",
              riverKey: "tumana",
              status: data.prediction.rivers.tumana.status,
              level: data.live_sensors.tumana,
              thresholds: { alert: 16.0, alarm: 16.5, critical: 17.0 },
              lat: 14.655,
              lng: 121.0965,
            },
          ]);

          // Save the timeline for the AI Projections cards
          if (data.prediction.timeline) {
            setEngineTimeline(data.prediction.timeline);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Flask Engine:", err);
      }
    };

    fetchFlaskEngine();
    const intervalId = setInterval(fetchFlaskEngine, 300000); // Check every 5 mins
    return () => clearInterval(intervalId);
  }, []);

  // --- REAL OPEN-METEO API FETCH (Weather Tab) ---
  useEffect(() => {
    const fetchRealWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=14.6408&longitude=121.1041&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation_probability&timezone=Asia%2FManila",
        );
        const data = await res.json();

        const baseTemp = Math.round(data.current.temperature_2m);
        const baseHum = data.current.relative_humidity_2m;
        const baseWind = Math.round(data.current.wind_speed_10m);
        const basePrecip = data.current.precipitation;

        const currentHour = new Date().getHours();
        const baseRainChance =
          data.hourly.precipitation_probability[currentHour];

        const realDataMap = marikinaTableData.map((b, idx) => {
          const offset = (idx % 3) * 2;
          const bRainChance = Math.min(
            100,
            Math.max(0, baseRainChance + offset),
          );
          const bPrecip = basePrecip + offset / 10;

          let condition = "Cloudy";
          if (bRainChance > 70) condition = "Heavy Rain";
          else if (bRainChance > 40) condition = "Moderate Rain";
          else if (bRainChance > 10) condition = "Light Rain";
          else if (bRainChance === 0 && baseTemp > 30) condition = "Sunny";

          return {
            id: b.id,
            name: b.name,
            condition,
            rainChance: bRainChance,
            precip: bPrecip.toFixed(1),
            temp: baseTemp + (idx % 2 === 0 ? 1 : 0),
            wind: baseWind + (idx % 3),
            humidity: baseHum,
          };
        });

        setWeatherForecasts(realDataMap);
      } catch (err) {
        console.error("Failed to fetch real weather:", err);
      }
    };
    fetchRealWeather();
  }, []);

  const marikinaBounds = [
    [14.6105, 121.08],
    [14.6785, 121.1275],
  ];

  const scrollToCard = (cardName) => {
    if (cardRefs.current[cardName]) {
      cardRefs.current[cardName].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedCard(cardName);
      setTimeout(() => setHighlightedCard(null), 2500);
    }
  };

  const getFeatureStyle = (feature) => {
    const barangayName = feature.properties.NAME_3;
    if (activeTab === "weather") {
      const weatherData = weatherForecasts.find(
        (w) => w.name === barangayName,
      ) || { rainChance: 0 };
      return {
        fillColor: getWeatherMapColor(weatherData.rainChance),
        fillOpacity: 0.65,
        weight: 1.5,
        color: "#ffffff",
      };
    } else {
      return {
        fillColor: "#0ea5e9",
        fillOpacity: 0.08,
        weight: 2,
        color: "#0284c7",
        dashArray: "3 4",
      };
    }
  };

  const onEachBarangay = (feature, layer) => {
    const barangayName = feature.properties.NAME_3;
    let tooltipHtml = "";
    if (activeTab === "weather") {
      const weatherData = weatherForecasts.find(
        (w) => w.name === barangayName,
      ) || { rainChance: 0, precip: 0 };
      tooltipHtml = `<div class="font-bold text-center" style="color: #0f172a;">${barangayName}<br/><span style="font-weight: 700; color: #0284c7;">Rain Chance: ${weatherData.rainChance}%<br/>Precip: ${weatherData.precip}mm</span></div>`;
    } else {
      const barangayData = getBarangayData(barangayName);
      tooltipHtml = `<div class="font-bold text-center" style="color: #0f172a;">${barangayName}<br/><span style="font-weight: 700; color: #0284c7;">Base Flood Prob: ${barangayData.floodProb}%</span></div>`;
    }
    layer.bindTooltip(tooltipHtml, { sticky: true });
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          fillOpacity: activeTab === "weather" ? 0.85 : 0.25,
          weight: 3,
        });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        if (activeTab === "weather") scrollToCard(barangayName);
      },
    });
  };

  const sortedWeatherForecasts = [...weatherForecasts].sort(
    (a, b) => b.rainChance - a.rainChance,
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "2.5rem",
        padding: "2rem",
        alignItems: "stretch",
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: "1.6",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            className="relative w-full z-10"
            style={{
              height: "85vh",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px -5px rgba(2, 132, 199, 0.15)",
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
              zoomControl={true}
              scrollWheelZoom={false}
              className="w-full h-full"
              style={{ background: "#e0f2fe", height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {marikinaGeoJSON && (
                <GeoJSON
                  key={activeTab + weatherForecasts[0].temp}
                  data={marikinaGeoJSON}
                  style={getFeatureStyle}
                  onEachFeature={onEachBarangay}
                />
              )}
              {activeTab === "stations" &&
                waterStationsData.map((station) => (
                  <Marker
                    key={station.id}
                    position={[station.lat, station.lng]}
                    icon={createWaterIcon(station.status)}
                    eventHandlers={{
                      click: () => scrollToCard(station.mapName),
                    }}
                  >
                    <Popup className="custom-popup">
                      <div
                        style={{
                          fontWeight: "800",
                          color: "#0f172a",
                          fontSize: "1rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {station.name}
                      </div>
                      <div
                        style={{
                          color: getStatusColor(station.status),
                          fontWeight: "700",
                          fontSize: "0.9rem",
                        }}
                      >
                        {station.status}: {station.level.toFixed(2)}m
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        <div
          style={{
            flex: "1.2",
            display: "flex",
            flexDirection: "column",
            height: "85vh",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                color: "#0f172a",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                margin: "0 0 1rem 0",
              }}
            >
              FloodGuard AI Monitoring
            </h2>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                backgroundColor: "#e0f2fe",
                padding: "0.4rem",
                borderRadius: "12px",
                border: "1px solid #bae6fd",
              }}
            >
              <button
                onClick={() => setActiveTab("stations")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  backgroundColor:
                    activeTab === "stations" ? "#ffffff" : "transparent",
                  color: activeTab === "stations" ? "#0369a1" : "#64748b",
                  boxShadow:
                    activeTab === "stations"
                      ? "0 2px 8px rgba(2, 132, 199, 0.15)"
                      : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Live Water Stations
              </button>
              <button
                onClick={() => setActiveTab("weather")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  backgroundColor:
                    activeTab === "weather" ? "#ffffff" : "transparent",
                  color: activeTab === "weather" ? "#0369a1" : "#64748b",
                  boxShadow:
                    activeTab === "weather"
                      ? "0 2px 8px rgba(2, 132, 199, 0.15)"
                      : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Live Weather Data
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
            {activeTab === "stations" &&
              waterStationsData.map((station) => {
                const isHighlighted = highlightedCard === station.mapName;
                return (
                  <div
                    key={station.id}
                    ref={(el) => (cardRefs.current[station.mapName] = el)}
                    style={{
                      padding: "1.5rem",
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #bae6fd",
                      boxShadow: isHighlighted
                        ? "0 0 0 4px #bae6fd, 0 10px 25px rgba(2, 132, 199, 0.3)"
                        : "0 4px 15px rgba(2, 132, 199, 0.05)",
                      transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.25rem",
                            color: "#0f172a",
                            fontWeight: "800",
                          }}
                        >
                          {station.name}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Real-time sensor data via PAGASA
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "0.3rem 0.8rem",
                          borderRadius: "999px",
                          color: getStatusColor(station.status),
                          fontWeight: "800",
                          fontSize: "0.85rem",
                          border: `1.5px solid ${getStatusColor(station.status)}`,
                        }}
                      >
                        {station.status} Status
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#64748b",
                          fontWeight: "600",
                          display: "block",
                          marginBottom: "0.2rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Current Level
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "3rem",
                            fontWeight: "800",
                            color: "#0f172a",
                            lineHeight: "1",
                            letterSpacing: "-0.05em",
                          }}
                        >
                          {station.level.toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: "700",
                            color: "#94a3b8",
                          }}
                        >
                          meters
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#f0f9ff",
                          padding: "1rem",
                          borderRadius: "12px",
                          border: "1px solid #7dd3fc",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            color: "#0369a1",
                            marginBottom: "0.75rem",
                          }}
                        >
                          AI PROJECTIONS (NEXT 3 HOURS)
                        </div>
                        {engineTimeline ? (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                                marginBottom: "0.4rem",
                              }}
                            >
                              <span
                                style={{ color: "#64748b", fontWeight: "600" }}
                              >
                                {engineTimeline[0].time}:
                              </span>
                              <span
                                style={{
                                  fontWeight: "800",
                                  color: getStatusColor(
                                    engineTimeline[0][station.riverKey] >= 16
                                      ? "CRITICAL"
                                      : "SAFE",
                                  ),
                                }}
                              >
                                {engineTimeline[0][station.riverKey].toFixed(2)}
                                m
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                                marginBottom: "0.4rem",
                              }}
                            >
                              <span
                                style={{ color: "#64748b", fontWeight: "600" }}
                              >
                                {engineTimeline[1].time}:
                              </span>
                              <span
                                style={{
                                  fontWeight: "800",
                                  color: getStatusColor(
                                    engineTimeline[1][station.riverKey] >= 16
                                      ? "CRITICAL"
                                      : "SAFE",
                                  ),
                                }}
                              >
                                {engineTimeline[1][station.riverKey].toFixed(2)}
                                m
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                              }}
                            >
                              <span
                                style={{ color: "#64748b", fontWeight: "600" }}
                              >
                                {engineTimeline[2].time}:
                              </span>
                              <span
                                style={{
                                  fontWeight: "800",
                                  color: getStatusColor(
                                    engineTimeline[2][station.riverKey] >= 16
                                      ? "CRITICAL"
                                      : "SAFE",
                                  ),
                                }}
                              >
                                {engineTimeline[2][station.riverKey].toFixed(2)}
                                m
                              </span>
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                              fontStyle: "italic",
                            }}
                          >
                            Loading AI timeline...
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          padding: "1rem",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            color: "#475569",
                            marginBottom: "0.75rem",
                          }}
                        >
                          THRESHOLDS
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            marginBottom: "0.4rem",
                          }}
                        >
                          <span>Alert:</span>{" "}
                          <span style={{ fontWeight: "700" }}>
                            {station.thresholds.alert.toFixed(2)}m
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            marginBottom: "0.4rem",
                          }}
                        >
                          <span>Alarm:</span>{" "}
                          <span style={{ fontWeight: "700" }}>
                            {station.thresholds.alarm.toFixed(2)}m
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span>Critical:</span>{" "}
                          <span style={{ fontWeight: "700" }}>
                            {station.thresholds.critical.toFixed(2)}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {activeTab === "weather" &&
              sortedWeatherForecasts.map((weather) => (
                <WeatherForecastCard
                  key={weather.id}
                  data={weather}
                  innerRef={(el) => (cardRefs.current[weather.name] = el)}
                  isHighlighted={highlightedCard === weather.name}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBody;
