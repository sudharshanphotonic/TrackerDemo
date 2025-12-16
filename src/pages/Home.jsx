import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "./Dashboard";
import AddDisplay from "./AddDisplay";
import AddBus from "./AddBus";
import AddStops from "./AddStops";

export default function Home() {
  const [view, setView] = useState("dashboard");

  const [displayCount, setDisplayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch display count from backend
  const fetchDisplayCount = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/displays/count");
      const data = await res.json();
      setDisplayCount(data.total);
    } catch (err) {
      console.error("Failed to fetch display count");
      setDisplayCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Refresh count whenever Dashboard is opened
  useEffect(() => {
    if (view === "dashboard") {
      fetchDisplayCount();
    }
  }, [view]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar setView={setView} />

      <div style={{ padding: 20, width: "100%" }}>
        {view === "dashboard" && (
          <Dashboard
            displayCount={displayCount}
            loading={loading}
          />
        )}

        {view === "addDisplay" && (
          <AddDisplay onSaved={fetchDisplayCount} />
        )}

        {view === "addBus" && <AddBus />}
        {view === "addStop" && <AddStops />}
      </div>
    </div>
  );
}
