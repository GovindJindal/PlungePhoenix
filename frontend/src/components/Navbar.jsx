import { AudioLines } from "lucide-react";

export default function Navbar({ links, health, compact = false }) {
  return (
    <header className={`navbar ${compact ? "navbar-compact" : ""}`}>
      <a className="logo" href="#home" aria-label="PlungePhoenix home">
        <AudioLines size={24} strokeWidth={2.5} aria-hidden="true" />
        <span>PlungePhoenix</span>
      </a>

      {!compact && (
        <nav className="nav-links" aria-label="Primary">
          {links.map((link, index) => (
            <a key={link.label} href={link.href} className={index === 0 ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </nav>
      )}

      <div className="nav-right">
        {compact && (
          <div className={`connection-pill connection-${health.status}`} role="status">
            <span aria-hidden="true" />
            {health.message}
          </div>
        )}
        <a href="mailto:hello@plungephoenix.ai" className="btn-outline">
          Contact Us
        </a>
      </div>
    </header>
  );
}
