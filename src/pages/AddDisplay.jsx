import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { QRCodeCanvas } from "qrcode.react";
import L from "leaflet";

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function AddDisplay() {
  const [mode, setMode] = useState(null); // null | desktop | physical
  const [showMap, setShowMap] = useState(false);
  const [latLng, setLatLng] = useState(null);

  const DEVICE_UID = "DISPLAY-UID-001"; // demo UID
  const installUrl = `${window.location.origin}/?install=1&deviceId=${DEVICE_UID}`;

  const [form, setForm] = useState({
    displayName: "",
    locationName: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleMapPick = (pos) => {
    setLatLng({
      lat: pos.lat.toFixed(6),
      lng: pos.lng.toFixed(6),
    });
    setShowMap(false);
  };

  // ✅ SAVE TO BACKEND (TEMP)
  const handleSaveDesktop = async () => {
    if (!latLng) {
      alert("Please pin location first");
      return;
    }

    const payload = {
      deviceId: `DESKTOP-${Date.now()}`,
      displayName: form.displayName,
      locationName: form.locationName,
      latitude: latLng.lat,
      longitude: latLng.lng,
      method: "desktop",
    };

    try {
      const res = await fetch("http://localhost:8000/displays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to save");
        return;
      }

      alert("Display saved successfully");

      // reset safely
      setForm({ displayName: "", locationName: "" });
      setLatLng(null);
      setShowMap(false);
      setMode(null);
    } catch (e) {
      alert("Backend not reachable");
    }
  };

  return (
    <div>
      <h2>Add Display</h2>

      {/* ========== METHOD SELECTION ========== */}
      {!mode && (
        <div style={{ display: "flex", gap: 20 }}>
          <div
            onClick={() => setMode("desktop")}
            style={{ flex: 1, padding: 20, border: "1px solid #ccc", cursor: "pointer" }}
          >
            <h3>🖥️ Desktop Entry</h3>
            <p>Enter display details and pin location</p>
          </div>

          <div
            onClick={() => setMode("physical")}
            style={{ flex: 1, padding: 20, border: "1px solid #ccc", cursor: "pointer" }}
          >
            <h3>📱 Physical Demo</h3>
            <p>Simulate QR-based installation</p>
          </div>
        </div>
      )}

      {/* ========== DESKTOP ENTRY ========== */}
      {mode === "desktop" && (
        <div style={{ marginTop: 20, maxWidth: 500 }}>
          <h3>🖥️ Desktop Entry</h3>

          <input
            name="displayName"
            placeholder="Display Name"
            value={form.displayName}
            onChange={handleChange}
          />
          <br /><br />

          <input
            name="locationName"
            placeholder="Location Name"
            value={form.locationName}
            onChange={handleChange}
          />
          <br /><br />

          <button onClick={() => setShowMap(true)}>
            📍 Pin Location
          </button>

          {latLng && (
            <p style={{ marginTop: 10, color: "green" }}>
              ✔ Location pinned
            </p>
          )}

          {showMap && (
            <div style={{ marginTop: 15 }}>
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={13}
                style={{ height: 300, width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onPick={handleMapPick} />
                {latLng && <Marker position={[latLng.lat, latLng.lng]} />}
              </MapContainer>

              <p style={{ fontSize: 12 }}>
                Click on map to pin location
              </p>
            </div>
          )}

          <br />

          <button disabled={!latLng} onClick={handleSaveDesktop}>
            💾 Save Display
          </button>

          <button style={{ marginLeft: 10 }} onClick={() => setMode(null)}>
            ← Back
          </button>
        </div>
      )}

      {/* ========== PHYSICAL DEMO ========== */}
      {mode === "physical" && (
        <div style={{ marginTop: 20 }}>
          <h3>📱 Physical Installation (Demo)</h3>

          <div style={{ background: "#fff", padding: 16, width: 220 }}>
            <QRCodeCanvas size={180} value={installUrl} />
            <p style={{ textAlign: "center", marginTop: 8 }}>
              {DEVICE_UID}
            </p>
          </div>

          <p style={{ marginTop: 10 }}>
            Installer scans QR → mobile login → GPS auto-captured
          </p>

          <button onClick={() => setMode(null)}>← Back</button>
        </div>
      )}
    </div>
  );
}
