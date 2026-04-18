import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Importing Marikina GeoJSON
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

// --- SIMULATED CROWDSOURCING DATA GENERATOR ---
const generateCrowdsourcedData = () => {
  const depths = [
    "Ankle Deep",
    "Knee Deep",
    "Waist Deep",
    "Torso Deep",
    "Shoulder Deep",
    "Above Head",
  ];
  const firstNames = [
    "Juan",
    "Maria",
    "Roberto",
    "Liza",
    "Antonio",
    "Elena",
    "Dante",
    "Sisa",
    "Ricardo",
    "Carmen",
  ];
  const lastNames = [
    "Dela Cruz",
    "Santos",
    "Reyes",
    "Pascual",
    "Luna",
    "Garcia",
    "Quizon",
    "Mabini",
  ];

  let reports = [];
  let id = 1;

  const barangayStreets = {
    Barangka: ["A. Bonifacio Ave", "General Julian Cruz St"],
    Calumpang: ["M.H. del Pilar St", "J.P. Rizal St"],
    "Concepcion Uno": ["Bayan-Bayanan Ave", "J. Molina St"],
    "Concepcion Dos": ["Lilac St", "Olive St"],
    Fortune: ["Fortune Ave", "Champaca St"],
    "Industrial Valley (IVC)": ["Major Dizon St", "Olandes St"],
    "Jesus de la Peña": ["Kapt. Moy St", "P. Gomez St"],
    Malanday: ["Libis St", "Malanday Creek side"],
    "Marikina Heights": ["Liwasang Kalayaan", "Champagnat Ave"],
    Nangka: ["Balubad St", "Makabayan St"],
    Parang: ["B.G. Molina St", "Fortune Ave"],
    "San Roque": ["Shoe Ave", "V. Gomez St"],
    "Santa Elena": ["W. Paz St", "M. Cruz St"],
    "Santo Niño": ["Guerilla St", "E. Rodriguez St"],
    Tañong: ["Loyola Subd", "A. Bonifacio Ave"],
    Tumana: ["Angel Santos St", "Farmers Ave"],
  };

  marikinaBarangays.forEach((brgy) => {
    const reportVolume = Math.floor(Math.random() * 20) + 5;
    for (let i = 0; i < reportVolume; i++) {
      const streets = barangayStreets[brgy];
      reports.push({
        id: id++,
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        phone: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
        depth: depths[Math.floor(Math.random() * depths.length)],
        barangay: brgy,
        street: streets[Math.floor(Math.random() * streets.length)],
        time: `${Math.floor(Math.random() * 59) + 1} mins ago`,
      });
    }
  });
  return reports.sort(() => Math.random() - 0.5);
};

const allReports = generateCrowdsourcedData();

const getHeatmapColor = (count) => {
  if (count >= 20) return "#ef4444";
  if (count >= 12) return "#f97316";
  if (count >= 7) return "#eab308";
  if (count > 0) return "#22c55e";
  return "#cbd5e1";
};

const getBarangayReportCount = (barangayName) =>
  allReports.filter((r) => r.barangay === barangayName).length;

const Reports = () => {
  const [selectedBarangay, setSelectedBarangay] = useState("All");

  const filteredReports =
    selectedBarangay === "All"
      ? allReports
      : allReports.filter((r) => r.barangay === selectedBarangay);

  // FIXED: Consistent bounds and zoom with Overview component
  const marikinaBounds = [
    [14.6105, 121.08],
    [14.6785, 121.1275],
  ];

  const getFeatureStyle = (feature) => {
    const barangayName = feature.properties.NAME_3;
    const count = getBarangayReportCount(barangayName);
    const isSelected = selectedBarangay === barangayName;

    return {
      fillColor: getHeatmapColor(count),
      fillOpacity: isSelected ? 0.9 : 0.65,
      weight: isSelected ? 3 : 1.5,
      color: isSelected ? "#000000" : "#ffffff",
      dashArray: isSelected ? "" : "3",
    };
  };

  const onEachBarangay = (feature, layer) => {
    const barangayName = feature.properties.NAME_3;
    const count = getBarangayReportCount(barangayName);
    layer.bindTooltip(
      `<div style="text-align: center;"><b>${barangayName}</b><br/>${count} Reports</div>`,
      { sticky: true },
    );
    layer.on({
      click: () => setSelectedBarangay(barangayName),
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.85, weight: 3 }),
      mouseout: (e) => e.target.setStyle(getFeatureStyle(feature)),
    });
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "2.5rem",
        padding: "2rem",
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
        }}
      >
        {/* LEFT SIDE: Heatmap */}
        <div
          style={{
            flex: "1.6",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Crowdsourced Reports
              </h1>
              <p style={{ color: "#475569" }}>
                Active citizen flood monitoring across Marikina City.
              </p>
            </div>
            {/* Legend... */}
          </div>

          <div
            style={{
              height: "75vh",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 15px 35px -5px rgba(2, 132, 199, 0.1)",
              border: "1px solid #bae6fd",
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
                  key={selectedBarangay}
                  data={marikinaGeoJSON}
                  style={getFeatureStyle}
                  onEachFeature={onEachBarangay}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT SIDE: Incident Feed */}
        <div
          style={{
            flex: "1.2",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #bae6fd",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            height: "calc(75vh + 60px)",
            boxShadow: "0 15px 35px -5px rgba(2, 132, 199, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>
              Incident Feed
            </h2>
            <span
              style={{
                backgroundColor: "#e0f2fe",
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: "800",
              }}
            >
              {filteredReports.length} Reports
            </span>
          </div>

          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "12px",
              border: "2px solid #e0f2fe",
              marginBottom: "1.5rem",
              fontWeight: "700",
            }}
          >
            <option value="All">All Barangays</option>
            {marikinaBarangays.sort().map((b) => (
              <option key={b} value={b}>
                {b} ({getBarangayReportCount(b)})
              </option>
            ))}
          </select>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              scrollbarWidth: "thin",
            }}
          >
            {filteredReports.map((report) => (
              <div
                key={report.id}
                style={{
                  padding: "1.25rem",
                  borderRadius: "18px",
                  border: "1px solid #f0f9ff",
                  borderLeft: `6px solid ${getHeatmapColor(getBarangayReportCount(report.barangay))}`,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}
                  >
                    {report.depth}
                  </h3>
                  <span style={{ fontSize: "0.7rem", color: "#adb5bd" }}>
                    {report.time}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0.3rem 0",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                  }}
                >
                  📍 {report.street}
                </p>
                <div
                  style={{
                    marginTop: "0.6rem",
                    borderTop: "1px solid #f8faff",
                    paddingTop: "0.6rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>
                    {report.phone}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                    — {report.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
