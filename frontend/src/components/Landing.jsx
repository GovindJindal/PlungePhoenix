import { ArrowRight, Blocks, Leaf, Shuffle } from "lucide-react";
import heroImage from "../../assets/hero-3d.png";
import RippleGrid from "./RippleGrid.jsx";

const features = [
  {
    id: "platform",
    icon: Shuffle,
    title: "Asset Swapping",
    description: "Direct peer-to-peer transactions with real-world assets",
  },
  {
    id: "assets",
    icon: Blocks,
    title: "Shared Ownership",
    description: "Shared ownership through fractionalization of physical assets",
  },
  {
    id: "blog",
    icon: Leaf,
    title: "Carbon Integrity",
    description: "Reliable carbon credit transactions backed by audit trails",
  },
];

export default function Landing() {
  return (
    <main id="home">
      <section className="hero" aria-labelledby="heroTitle">
        <RippleGrid />
        <div className="hero-content">
          <div className="hero-left">
            <span id="why-us" className="hero-tag">
              [ 150+ ORGANIZATIONS ]
            </span>
            <h1 id="heroTitle" className="hero-heading">
              Clear Insights For
              <br />
              Smarter Decisions
            </h1>
            <p className="hero-sub">
              Advanced Audio Sentiment Analysis with
              <br />
              Unrivaled Market Intelligence via PlungePhoenix
            </p>
            <a href="#dashboard" className="btn-primary">
              Get Started <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>

          <div className="hero-right" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>
        </div>
      </section>

      <section className="features-section" aria-label="Platform highlights">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div className="feature-wrap" key={feature.title}>
              {index > 0 && <div className="feature-divider" role="presentation" />}
              <article id={feature.id} className="feature-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Icon size={16} aria-hidden="true" />
                  </div>
                  <h2 className="feature-title">{feature.title}</h2>
                </div>
                <p className="feature-desc">{feature.description}</p>
              </article>
            </div>
          );
        })}
      </section>
    </main>
  );
}
