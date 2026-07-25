import { useEffect, useMemo, useState } from "react";
import API from "./lib/api.js";
import Logger from "./lib/logger.js";
import Landing from "./components/Landing.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";

function readRoute() {
  return window.location.hash.replace(/^#/, "") || "home";
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [health, setHealth] = useState({ status: "checking", message: "Checking backend..." });

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        await API.health();
        if (!cancelled) {
          setHealth({ status: "online", message: "Backend connected" });
        }
      } catch (err) {
        Logger.error("Backend health check failed", err);
        if (!cancelled) {
          setHealth({
            status: "offline",
            message: "Backend offline - run uvicorn backend.main:app --reload",
          });
        }
      }
    }

    checkHealth();
    const timer = window.setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const isDashboard = route === "dashboard";
  const navLinks = useMemo(
    () => [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Architecture", href: "#architecture" },
      { label: "Technology", href: "#technology" },
      { label: "Features", href: "#features" },
      { label: "Roadmap", href: "#roadmap" },
    ],
    []
  );

  return (
    <div className="app-shell">
      <Navbar links={navLinks} health={health} compact={isDashboard} />
      {isDashboard ? <Dashboard health={health} /> : <Landing />}
    </div>
  );
}
