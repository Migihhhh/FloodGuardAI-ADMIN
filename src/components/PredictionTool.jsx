import React, { useState, useEffect, useCallback } from "react";
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
  { id: 1, name: "Barangka", baseRisk: 5 },
  { id: 2, name: "Calumpang", baseRisk: 8 },
  { id: 3, name: "Concepcion Uno", baseRisk: 12 },
  { id: 4, name: "Concepcion Dos", baseRisk: 2 },
  { id: 5, name: "Fortune", baseRisk: 4 },
  { id: 6, name: "Industrial Valley (IVC)", baseRisk: 12 },
  { id: 7, name: "Jesus de la Peña", baseRisk: 10 },
  { id: 8, name: "Malanday", baseRisk: 15 },
  { id: 9, name: "Marikina Heights", baseRisk: 2 },
  { id: 10, name: "Nangka", baseRisk: 14 },
  { id: 11, name: "Parang", baseRisk: 3 },
  { id: 12, name: "San Roque", baseRisk: 6 },
  { id: 13, name: "Santa Elena", baseRisk: 8 },
  { id: 14, name: "Santo Niño", baseRisk: 9 },
  { id: 15, name: "Tañong", baseRisk: 5 },
  { id: 16, name: "Tumana", baseRisk: 15 },
];

const getRelevantRiver = (barangayName) => {
  const nangkaGroup = [
    "Nangka",
    "Parang",
    "Fortune",
    "Marikina Heights",
    "Concepcion Dos",
  ];
  const tumanaGroup = ["Tumana", "Malanday", "Concepcion Uno"];
  if (nangkaGroup.includes(barangayName))
    return { key: "nangka", label: "Nangka River" };
  if (tumanaGroup.includes(barangayName))
    return { key: "tumana", label: "Tumana River" };
  return { key: "sto_nino", label: "Sto. Niño River" };
};

const getBarangayRisk = (name) =>
  marikinaTableData.find((b) => b.name === name)?.baseRisk || 0;

const defaultPagasaData = {
  cycloneBulletin: {
    active: false,
    name: "Loading...",
    category: "Loading Data...",
    center: "--",
    movement: "--",
    signalText: "--",
    lastUpdated: "--",
  },
  koicaFloodAdvisory: { stations: [], lastUpdated: "--" },
  dailyWeather: {
    location: "Marikina City",
    condition: "Loading...",
    tempRange: "--°C",
    humidity: "--%",
    lastUpdated: "--",
  },
};



// ─── OFFICIAL PAGASA MARIKINA RIVER 4-ALARM SYSTEM ───────────────────────────
const ALARM_LEVELS = [
  {
    threshold: 18,
    alarm: "3rd ALARM",
    label: "FORCE EVACUATION",
    color: "#dc2626",
    gradient: "linear-gradient(to right, #dc2626, #f87171)",
    bg: "#fef2f2",
    border: "#fecaca",
    textColor: "#991b1b",
  },
  {
    threshold: 16,
    alarm: "2nd ALARM",
    label: "PREPARE TO EVACUATE",
    color: "#ea580c",
    gradient: "linear-gradient(to right, #ea580c, #fb923c)",
    bg: "#fff7ed",
    border: "#fed7aa",
    textColor: "#9a3412",
  },
  {
    threshold: 15,
    alarm: "1st ALARM",
    label: "ALERT",
    color: "#ca8a04",
    gradient: "linear-gradient(to right, #ca8a04, #fde047)",
    bg: "#fefce8",
    border: "#fef08a",
    textColor: "#854d0e",
  },
  {
    threshold: -Infinity,
    alarm: "NORMAL",
    label: "SAFE",
    color: "#16a34a",
    gradient: "linear-gradient(to right, #16a34a, #86efac)",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    textColor: "#166534",
  },
];

const getAlarmInfo = (level) => {
  const safeLevel = typeof level === 'number' ? level : 0;
  for (const alarm of ALARM_LEVELS) {
    if (safeLevel >= alarm.threshold) return alarm;
  }
  return ALARM_LEVELS[ALARM_LEVELS.length - 1];
};

// Gauge display range (fixed, covers all alarm zones)
const GAUGE_MIN = 12; // safe baseline
const GAUGE_MAX = 20; // above 3rd alarm
const GAUGE_RANGE = GAUGE_MAX - GAUGE_MIN;

// Threshold line positions (from bottom, as % of gauge height)
const GAUGE_LINES = [
  { level: 18, alarm: ALARM_LEVELS[0] }, // 3rd alarm — red
  { level: 16, alarm: ALARM_LEVELS[1] }, // 2nd alarm — orange
  { level: 15, alarm: ALARM_LEVELS[2] }, // 1st alarm — yellow
];

// Visual Water Level Gauge component (Horizontal)
const WaterLevelGauge = ({ level, peakTime, riverLabel }) => {
  const alarmInfo = getAlarmInfo(level);
  const fillPct = Math.min(100, Math.max(0, ((level - GAUGE_MIN) / GAUGE_RANGE) * 100));

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "1rem",
      marginTop: "1rem", backgroundColor: "#f8fafc",
      padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0",
    }}>
      {/* Top section: reading + alarm info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
           <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
            PROJECTED PEAK
          </div>
          <div style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.25rem" }}>
            📅 {peakTime}
          </div>
          <div style={{ fontSize: "3rem", fontWeight: "800", color: alarmInfo.color, lineHeight: 1 }}>
            {(level || 0).toFixed(2)}
            <span style={{ fontSize: "1.2rem", fontWeight: "600", marginLeft: "0.25rem" }}>m</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            backgroundColor: alarmInfo.bg,
            border: `1px solid ${alarmInfo.border}`,
            borderRadius: "999px",
            padding: "0.4rem 1rem",
            marginBottom: "0.5rem",
          }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "800", color: alarmInfo.textColor }}>
              {alarmInfo.alarm} — {alarmInfo.label}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>
            {riverLabel}
          </div>
        </div>
      </div>

      {/* The bar itself */}
      <div style={{ position: "relative", marginTop: "0.5rem" }}>
        <div style={{
          position: "relative", width: "100%", height: "24px",
          backgroundColor: "#e2e8f0", borderRadius: "12px",
          overflow: "hidden", border: "2px solid #cbd5e1",
        }}>
          {/* Water fill */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${fillPct}%`,
            background: alarmInfo.gradient,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
            borderRadius: "10px 0 0 10px",
          }} />
          {/* 3 threshold lines */}
          {GAUGE_LINES.map(({ level: lvl, alarm }) => (
            <div key={lvl} style={{
              position: "absolute", bottom: 0, top: 0,
              left: `${((lvl - GAUGE_MIN) / GAUGE_RANGE) * 100}%`,
              width: "2px", backgroundColor: alarm.color, zIndex: 2,
            }} />
          ))}
        </div>

        {/* Tick labels row */}
        <div style={{
          position: "relative",
          height: "20px",
          marginTop: "0.5rem"
        }}>
          {[12, 15, 16, 18, 20].map((tick) => {
            const leftPct = ((tick - GAUGE_MIN) / GAUGE_RANGE) * 100;
            return (
              <div key={tick} style={{ 
                position: "absolute", 
                left: `${leftPct}%`,
                transform: "translateX(-50%)",
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center" 
              }}>
                 <div style={{ width: "2px", height: "4px", backgroundColor: "#cbd5e1", marginBottom: "2px" }} />
                 <span style={{
                  fontSize: "0.65rem", fontWeight: "800",
                  color: tick === 18 ? "#dc2626" : tick === 16 ? "#ea580c" : tick === 15 ? "#ca8a04" : "#94a3b8",
                }}>{tick}m</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend (Horizontal) */}
      <div style={{ 
        display: "flex", flexWrap: "wrap", gap: "1rem", 
        marginTop: "0.5rem", padding: "0.8rem", 
        backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" 
      }}>
        {ALARM_LEVELS.map((a) => (
          <div key={a.alarm} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "8px", height: "8px", backgroundColor: a.color, borderRadius: "2px", flexShrink: 0 }} />
            <span style={{ fontSize: "0.65rem", color: "#475569", fontWeight: "700" }}>
              {a.alarm}: {a.threshold === -Infinity ? `< 15m` : `≥ ${a.threshold}m`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  if (status === "CRITICAL") return "#dc2626";
  if (status === "WARNING") return "#ea580c";
  if (status === "SAFE") return "#16a34a";
  return "#94a3b8";
};

const PredictionTool = () => {
  const [selectedBarangay, setSelectedBarangay] = useState("Malanday");
  const [scrapedPagasaData, setScrapedPagasaData] = useState(defaultPagasaData);
  const [engineData, setEngineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [alertSentStatus, setAlertSentStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- TRUE AI TIMELINE (4-Alarm System) ---
  const generateAITimeline = useCallback((barangay, apiData) => {
    if (!apiData || !apiData.prediction || !apiData.prediction.timeline) return;

    const river = getRelevantRiver(barangay);
    const riverPrediction = apiData.prediction.rivers?.[river.key];
    if (!riverPrediction) return;
    
    const timeSeriesInsights = riverPrediction.time_series_insights || {};

    const hourly = apiData.prediction.timeline.map((hourForecast) => {
      const predictedWL = hourForecast[river.key] ?? 0;
      const alarmInfo = getAlarmInfo(predictedWL);
      return {
        time: hourForecast.time || "--",
        level: predictedWL,
        alarmInfo,
      };
    });

    const peakHour = hourly.length > 0 
      ? hourly.reduce((max, h) => (h.level > max.level ? h : max), hourly[0])
      : { level: 0, time: "--" };

    const peakLevel = peakHour.level;
    const peakTime = peakHour.time;
    const peakAlarm = getAlarmInfo(peakLevel);

    setTimelineData({
      hourly,
      peakLevel,
      peakTime,
      peakAlarm,
      riskLevel: peakAlarm.alarm === "NORMAL" ? "SAFE" : `${peakAlarm.alarm} — ${peakAlarm.label}`,
      riskColor: peakAlarm.color,
      riverLabel: river.label,
      riverKey: river.key,
      predictedWaterLevel: riverPrediction.predicted_water_level || 0,
      timeSeriesInsights: timeSeriesInsights,
    });
  }, []);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch("https://floodguard-engine.onrender.com/api/status");
        const data = await res.json();

        setScrapedPagasaData((prev) => ({
          ...prev,
          cycloneBulletin: {
            ...prev.cycloneBulletin,
            active: data.storm.name !== "None",
            name: data.storm.name,
            category: data.storm.category,
            center: data.storm.center,
            movement: data.storm.movement,
            signalText:
              data.storm.signal > 0
                ? `Signal ${data.storm.signal}`
                : "No Signal",
            lastUpdated: new Date().toLocaleTimeString(),
          },
          koicaFloodAdvisory: {
            ...prev.koicaFloodAdvisory,
            lastUpdated: new Date().toLocaleTimeString(),
            stations: [
              {
                name: "Sto. Niño",
                currentLevel: data.live_sensors.sto_nino,
                status:
                  data.live_sensors.sto_nino >= 15.0 ? "Critical" : "Normal",
              },
              {
                name: "Tumana",
                currentLevel: data.live_sensors.tumana,
                status:
                  data.live_sensors.tumana >= 15.0 ? "Critical" : "Normal",
              },
              {
                name: "Nangka",
                currentLevel: data.live_sensors.nangka,
                status:
                  data.live_sensors.nangka >= 15.0 ? "Critical" : "Normal",
              },
            ],
          },
        }));

        setEngineData(data);
        generateAITimeline(selectedBarangay, data);
      } catch (err) {
        console.error("Flask Backend Fetch Error:", err);
      }
    };

    fetchBackendData();
    const intervalId = setInterval(fetchBackendData, 300000);
    return () => clearInterval(intervalId);
  }, [selectedBarangay, generateAITimeline]);

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
            tempRange: `${Math.round(data.current.temperature_2m)}°C`,
            humidity: `${data.current.relative_humidity_2m}%`,
            lastUpdated: new Date().toLocaleTimeString(),
          },
        }));
      } catch (err) {}
    };
    fetchRealWeather();
  }, []);

  const handleBarangayChange = (barangay) => {
    setSelectedBarangay(barangay);
    setAlertSentStatus(null);
    if (engineData) generateAITimeline(barangay, engineData);
  };

  const sendEmergencyAlert = () => {
    setShowConfirmModal(true);
  };

  const confirmAndSend = () => {
    setShowConfirmModal(false);
    setIsAlertSending(true);
    setTimeout(() => {
      setIsAlertSending(false);
      setAlertSentStatus("SUCCESS");
      setTimeout(() => setAlertSentStatus(null), 5000);
    }, 1500);
  };

  const marikinaBounds = [
    [14.6105, 121.08],
    [14.6785, 121.1275],
  ];

  const getFeatureStyle = (feature) => {
    const barangayName = feature.properties.NAME_3;
    const isSelected = barangayName === selectedBarangay;
    
    let color = "#16a34a"; // Default Safe (Normal)
    
    if (engineData && engineData.prediction && engineData.prediction.rivers) {
      const riverKey = getRelevantRiver(barangayName).key;
      const riverData = engineData.prediction.rivers[riverKey];
      if (riverData) {
        const predictedWL = riverData.predicted_water_level || 0;
        const alarm = getAlarmInfo(predictedWL);
        color = alarm.color;
      }
    }

    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.9 : 0.4,
      weight: isSelected ? 3 : 1.5,
      color: isSelected ? "#0284c7" : "#ffffff",
      dashArray: isSelected ? "" : "3",
    };
  };

  const onEachBarangay = (feature, layer) => {
    const barangayName = feature.properties.NAME_3;
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 3 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        handleBarangayChange(barangayName);
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
              Powered by FloodGuard and real-time APIs.
            </p>
          </div>
          {engineData && engineData.prediction.overall_status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor:
                  engineData.prediction.overall_status !== "SAFE"
                    ? "#fef2f2"
                    : "#e0f2fe",
                border: `1px solid ${engineData.prediction.overall_status !== "SAFE" ? "#fecaca" : "#bae6fd"}`,
                padding: "0.5rem 1rem",
                borderRadius: "999px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: getStatusColor(
                    engineData.prediction.overall_status,
                  ),
                  borderRadius: "50%",
                }}
              ></div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color:
                    engineData.prediction.overall_status !== "SAFE"
                      ? "#b91c1c"
                      : "#0369a1",
                }}
              >
                City-Wide Status: {engineData.prediction.overall_status}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
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
                    Tropical Cyclone
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
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: cycloneCardStyle.textHead,
                    fontWeight: "600",
                  }}
                >
                  Name:
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: cycloneCardStyle.textBody,
                    fontWeight: "800",
                  }}
                >
                  {scrapedPagasaData.cycloneBulletin.name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textHead,
                        fontWeight: "600",
                      }}
                    >
                      Center:
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textBody,
                        fontWeight: "800",
                        textAlign: "right",
                        maxWidth: "65%",
                      }}
                    >
                      {scrapedPagasaData.cycloneBulletin.center}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textHead,
                        fontWeight: "600",
                      }}
                    >
                      Movement:
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textBody,
                        fontWeight: "800",
                        textAlign: "right",
                        maxWidth: "65%",
                      }}
                    >
                      {scrapedPagasaData.cycloneBulletin.movement}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textHead,
                        fontWeight: "600",
                      }}
                    >
                      Warning:
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: cycloneCardStyle.textBody,
                        fontWeight: "800",
                      }}
                    >
                      {scrapedPagasaData.cycloneBulletin.signalText}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

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
                    Daily Weather
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
          </div>

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
                    Sensor Activity
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
              {scrapedPagasaData.koicaFloodAdvisory.stations.length === 0 ? (
                <div
                  style={{ fontSize: "0.85rem", color: floodCardStyle.textSub }}
                >
                  Waiting for API...
                </div>
              ) : (
                scrapedPagasaData.koicaFloodAdvisory.stations.map(
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
                )
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "stretch",
            flexWrap: "wrap",
            marginTop: "2rem",
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
                height: "75vh",
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
                style={{ background: "#e0f2fe", height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {marikinaGeoJSON &&
                  engineData &&
                  engineData.prediction.overall_status && (
                    <GeoJSON
                      key={
                        engineData.prediction.overall_status + selectedBarangay
                      }
                      data={marikinaGeoJSON}
                      style={getFeatureStyle}
                      onEachFeature={onEachBarangay}
                    />
                  )}
              </MapContainer>
            </div>

            {/* --- MOVED ELEMENTS --- */}
            {timelineData && (
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {/* --- TIME SERIES INSIGHTS --- */}
                {timelineData.timeSeriesInsights && (
                  <div style={{ flex: "1 1 350px", padding: "1.5rem", backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.1)" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 1rem 0" }}>
                      📈 Time-Series Analysis
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>TREND</div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "#0284c7" }}>
                          {timelineData.timeSeriesInsights.trend} 
                          <span style={{ fontSize: "0.85rem", color: "#475569", marginLeft: "0.5rem" }}>
                            ({timelineData.timeSeriesInsights.rate_of_change_m_per_h > 0 ? "+" : ""}{timelineData.timeSeriesInsights.rate_of_change_m_per_h}m/h)
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>ETA TO CRITICAL</div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "#ef4444" }}>
                          {timelineData.timeSeriesInsights.eta_to_critical}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>PEAK EXPECTED</div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>
                          {timelineData.timeSeriesInsights.peak_predicted_level}m @ {timelineData.timeSeriesInsights.peak_expected_time}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>ETA TO WARNING</div>
                        <div style={{ fontSize: "1rem", fontWeight: "800", color: "#eab308" }}>
                          {timelineData.timeSeriesInsights.eta_to_warning}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- EMERGENCY ALERT ACTION --- */}
                <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
                  {/* CONFIRMATION MODAL */}
                {showConfirmModal && (
                  <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "20px",
                      padding: "2rem",
                      maxWidth: "440px",
                      width: "90%",
                      boxShadow: "0 25px 60px -10px rgba(0,0,0,0.3)",
                      border: "1px solid #e2e8f0",
                    }}>
                      <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "0.75rem" }}>🚨</div>
                      <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", textAlign: "center", margin: "0 0 0.5rem 0" }}>
                        Confirm Emergency Alert
                      </h2>
                      <p style={{ fontSize: "0.9rem", color: "#475569", textAlign: "center", margin: "0 0 1.5rem 0", lineHeight: 1.6 }}>
                        You are about to dispatch a <strong>push notification</strong> to all app users in:
                      </p>
                      <div style={{
                        backgroundColor: timelineData?.peakAlarm?.alarm === "NORMAL" ? "#f0f9ff" : timelineData?.peakAlarm?.bg || "#fef2f2",
                        border: `1px solid ${timelineData?.peakAlarm?.border || "#fecaca"}`,
                        borderRadius: "12px",
                        padding: "1rem 1.25rem",
                        marginBottom: "1.5rem",
                      }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.25rem" }}>
                          📍 {selectedBarangay}
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: timelineData?.peakAlarm?.textColor || "#991b1b" }}>
                          {timelineData?.peakAlarm?.alarm} — {timelineData?.peakAlarm?.label}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                          Projected Peak: {timelineData?.peakLevel?.toFixed(2)}m @ {timelineData?.peakTime}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", margin: "0 0 1.5rem 0" }}>
                        ⚠️ This action cannot be undone. Make sure the situation warrants an alert.
                      </p>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          style={{
                            flex: 1, padding: "0.85rem",
                            backgroundColor: "#f1f5f9", color: "#475569",
                            border: "1px solid #e2e8f0", borderRadius: "10px",
                            fontSize: "0.95rem", fontWeight: "700", cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmAndSend}
                          style={{
                            flex: 1, padding: "0.85rem",
                            backgroundColor: timelineData?.peakAlarm?.alarm === "NORMAL" ? "#0ea5e9" : timelineData?.peakAlarm?.color || "#dc2626",
                            color: "#ffffff",
                            border: "none", borderRadius: "10px",
                            fontSize: "0.95rem", fontWeight: "800", cursor: "pointer",
                            boxShadow: `0 4px 15px -3px ${timelineData?.peakAlarm?.color || "#dc2626"}88`,
                          }}
                        >
                          ✅ Yes, Send Alert
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {alertSentStatus === "SUCCESS" ? (
                     <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", color: "#166534", fontWeight: "700", textAlign: "center", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.1)" }}>
                        ✅ App Push Notification Dispatched to {selectedBarangay}
                     </div>
                  ) : (
                     <button
                       onClick={sendEmergencyAlert}
                       disabled={isAlertSending}
                       style={{
                         width: "100%",
                         height: "100%",
                         minHeight: "100px",
                         padding: "1rem",
                         backgroundColor: timelineData.peakAlarm.alarm === "NORMAL"
                           ? "#0ea5e9"
                           : timelineData.peakAlarm.color,
                         color: "#ffffff",
                         border: "none",
                         borderRadius: "16px",
                         fontSize: "1rem",
                         fontWeight: "800",
                         cursor: isAlertSending ? "not-allowed" : "pointer",
                         display: "flex",
                         flexDirection: "column",
                         justifyContent: "center",
                         alignItems: "center",
                         gap: "0.25rem",
                         transition: "all 0.2s",
                         boxShadow: timelineData.peakAlarm.alarm !== "NORMAL"
                           ? `0 10px 25px -5px ${timelineData.peakAlarm.color}66`
                           : "0 10px 25px -5px rgba(14,165,233,0.3)",
                         opacity: isAlertSending ? 0.7 : 1,
                       }}
                     >
                       {isAlertSending ? "Dispatching..." : (
                         <>
                           <span>🚨 Send App Alert</span>
                           <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                             {timelineData.peakAlarm.alarm === "NORMAL" ? "Manual Override" : `${timelineData.peakAlarm.alarm} — ${timelineData.peakAlarm.label}`}
                           </span>
                           <span style={{ fontSize: "0.8rem" }}>{selectedBarangay}</span>
                         </>
                       )}
                     </button>
                  )}
                </div>
              </div>
            )}
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
              Live Risk Assessment
            </h2>

            <select
              value={selectedBarangay}
              onChange={(e) => handleBarangayChange(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1.1rem",
                fontWeight: "700",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                marginBottom: "2rem",
              }}
            >
              {marikinaTableData.map((brgy) => (
                <option key={brgy.name} value={brgy.name}>
                  {brgy.name}
                </option>
              ))}
            </select>

            {engineData && timelineData ? (
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                    Forecast for {selectedBarangay}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>
                    Sensor: {timelineData.riverLabel}
                  </div>
                </div>

                <WaterLevelGauge
                  level={timelineData.peakLevel}
                  peakTime={timelineData.peakTime}
                  riverLabel={timelineData.riverLabel}
                />



                <h4
                  style={{
                    fontSize: "1.1rem",
                    color: "#0f172a",
                    fontWeight: "800",
                    margin: "2rem 0 1rem 0",
                  }}
                >
                  24-Hour Projected Timeline
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    overflowX: "auto",
                    paddingBottom: "1rem",
                  }}
                >
                  {timelineData.hourly.map((hour, idx) => (
                    <div
                      key={idx}
                      style={{
                        minWidth: "82px",
                        padding: "0.75rem 0.4rem",
                        backgroundColor: hour.alarmInfo.bg,
                        borderRadius: "12px",
                        textAlign: "center",
                        border: `1px solid ${hour.alarmInfo.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.2rem",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#475569" }}>
                        {hour.time}
                      </div>
                      <div style={{
                        fontSize: "1.25rem", fontWeight: "800",
                        color: hour.alarmInfo.color, lineHeight: 1,
                      }}>
                        {(hour.level || 0).toFixed(1)}
                        <span style={{ fontSize: "0.65rem", fontWeight: "600" }}>m</span>
                      </div>
                      <div style={{
                        fontSize: "0.6rem", fontWeight: "800",
                        color: hour.alarmInfo.textColor,
                        backgroundColor: hour.alarmInfo.bg,
                        border: `1px solid ${hour.alarmInfo.border}`,
                        borderRadius: "4px",
                        padding: "0.1rem 0.3rem",
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                      }}>
                        {hour.alarmInfo.alarm}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#0369a1",
                  fontWeight: "700",
                  marginTop: "2rem",
                }}
              >
                Awaiting connection to AI Engine...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;
