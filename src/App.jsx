import { useState } from "react";
import InstallerDisplayRegister from "./pages/InstallerDisplayRegister";
import Home from "./pages/Home";
import Login from "./pages/Login";

export default function App() {
  // 🔍 Detect QR installer flow
  const params = new URLSearchParams(window.location.search);
  const deviceId = params.get("deviceId");

  // 🔐 Normal app login state
  const [loggedIn, setLoggedIn] = useState(false);

  /* ================= INSTALLER FLOW ================= */
  // If QR scanned → ALWAYS show installer page
  if (deviceId) {
    return <InstallerDisplayRegister />;
  }

  /* ================= NORMAL APP FLOW ================= */
  // No QR → normal login + dashboard
  return loggedIn ? (
    <Home />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}
