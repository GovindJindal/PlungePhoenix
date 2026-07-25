import { AudioLines, Menu, X } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

export default function Navbar({ links, health, compact = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef(null);

  /* ── scroll blur effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── active section tracking ── */
  useEffect(() => {
    if (compact) return;

    const sectionIds = links.map((l) => l.href.replace("#", ""));
    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    });

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [links, compact]);

  /* ── close mobile menu & smooth scroll ── */
  const handleLinkClick = useCallback((e, href) => {
    setMobileOpen(false);
    
    if (href.startsWith("#") && href !== "#dashboard") {
      e.preventDefault();
      
      // Update URL hash without jumping
      if (window.history.pushState) {
        window.history.pushState(null, "", href);
      } else {
        window.location.hash = href;
      }
      
      // Force the route state update for App.jsx
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      
      // Give React a tick to render Landing if we were on Dashboard
      setTimeout(() => {
        const id = href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        } else if (id === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  }, []);

  return (
    <header
      className={`navbar ${compact ? "navbar-compact" : ""} ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <a 
        className="logo" 
        href="#home" 
        aria-label="PlungePhoenix home"
        onClick={(e) => handleLinkClick(e, "#home")}
      >
        <AudioLines size={24} strokeWidth={2.5} aria-hidden="true" />
        <span>PlungePhoenix</span>
      </a>

      {!compact && (
        <>
          <nav
            className={`nav-links ${mobileOpen ? "nav-links-open" : ""}`}
            aria-label="Primary"
          >
            {links.map((link) => {
              const sectionId = link.href.replace("#", "");
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={activeSection === sectionId ? "active" : ""}
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </>
      )}

      <div className="nav-right">
        {compact && (
          <div className={`connection-pill connection-${health.status}`} role="status">
            <span aria-hidden="true" />
            {health.message}
          </div>
        )}
        <a 
          href="#contact" 
          className="btn-outline" 
          onClick={(e) => handleLinkClick(e, "#contact")}
        >
          Contact Us
        </a>
      </div>
    </header>
  );
}
