import { useEffect, useRef, useCallback, useState, memo } from "react";
import {
  ArrowRight, Activity, Brain, Mic, Search, Shield, Zap,
  BarChart3, Globe, Rss, Database, Cpu, Radio, TrendingUp,
  Users, Briefcase, Building2, FlaskConical, Eye, LineChart,
  Rocket, Layers, Server, AudioLines, Wifi, ChevronRight,
  Sparkles, Target, Clock, CheckCircle2, XCircle, ArrowDown,
  Monitor, Code2, Bot, Boxes, GitBranch, Languages, PieChart,
  Lock, Newspaper, FileAudio, MessagesSquare
} from "lucide-react";
import heroImage from "../../assets/hero-3d.png";
import RippleGrid from "./RippleGrid.jsx";

/* ═══════════════════════════════════════════════
   SCROLL-REVEAL HOOK (shared IntersectionObserver)
   ═══════════════════════════════════════════════ */
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* respect reduced-motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("sr-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("sr-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* helper: staggered children wrapper */
function Reveal({ children, className = "", delay = 0, style = {} }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`sr ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════ */
function AnimatedCounter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            /* ease-out quad */
            const eased = 1 - (1 - progress) * (1 - progress);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="metric-number">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   SECTION DATA
   ═══════════════════════════════════════════════ */

const COMPARISON_DATA = [
  { old: "Manual Research", oldDesc: "Hours spent reading reports", new: "Real-Time AI Analysis", newDesc: "Instant AI-powered insights from live data", icon: Brain },
  { old: "Keyword Search", oldDesc: "Surface-level text matching", new: "Semantic Vector Search", newDesc: "Deep contextual understanding via RAG", icon: Search },
  { old: "Delayed News", oldDesc: "Markets move before you react", new: "Live RSS Monitoring", newDesc: "Continuous financial news ingestion", icon: Clock },
  { old: "Human Analysis", oldDesc: "Subjective and slow", new: "AI Financial Reasoning", newDesc: "LLM-powered objective recommendations", icon: Cpu },
  { old: "Text-Only Monitoring", oldDesc: "Ignores audio commentary", new: "Speech + News + Context", newDesc: "Audio sentiment meets market intelligence", icon: Mic },
];

const WHY_CARDS = [
  { icon: Zap, title: "Real-Time AI", desc: "Process financial news and audio in real-time with AI-powered analysis that delivers actionable insights within seconds." },
  { icon: Brain, title: "Financial Intelligence", desc: "Context-aware AI reasoning that combines market news, audio sentiment, and vector search for comprehensive analysis." },
  { icon: Mic, title: "Speech Understanding", desc: "Transform spoken market commentary into structured sentiment scores using AssemblyAI speech recognition." },
  { icon: Search, title: "Semantic Search", desc: "ChromaDB vector search finds contextually relevant news—not just keyword matches—for deeper market understanding." },
  { icon: Shield, title: "Live Risk Detection", desc: "Real-time panic detection engine identifies market stress signals from both text and audio sources simultaneously." },
  { icon: Target, title: "Context-Aware Recommendations", desc: "RAG-powered trading recommendations that combine retrieved context with AI reasoning for reliable guidance." },
];

const PIPELINE_STEPS = [
  { icon: Globe, label: "Financial News", desc: "Web scraping & RSS feeds" },
  { icon: Rss, label: "Data Ingestion", desc: "Continuous collection" },
  { icon: Sparkles, label: "Cleaning", desc: "Text normalization" },
  { icon: Boxes, label: "Embeddings", desc: "Vector generation" },
  { icon: Database, label: "ChromaDB", desc: "Vector storage" },
  { icon: FileAudio, label: "Audio Upload", desc: "Market commentary" },
  { icon: Radio, label: "AssemblyAI", desc: "Speech-to-text" },
  { icon: Activity, label: "Panic Detection", desc: "Stress scoring" },
  { icon: Search, label: "RAG Retrieval", desc: "Context matching" },
  { icon: Bot, label: "LLM Analysis", desc: "AI reasoning" },
  { icon: TrendingUp, label: "Recommendation", desc: "Trading signals" },
  { icon: Monitor, label: "Dashboard", desc: "Interactive UI" },
];

const ARCH_LAYERS = [
  {
    name: "Presentation",
    color: "#1a56db",
    nodes: [
      { label: "React 19", desc: "Modern UI framework powering the interactive dashboard and landing page" },
      { label: "Landing Page", desc: "SaaS homepage with scroll animations and premium design" },
      { label: "Dashboard", desc: "Real-time analysis interface with panic meter and recommendations" },
      { label: "WebSockets", desc: "Live streaming connection for real-time data updates" },
    ],
  },
  {
    name: "Application",
    color: "#059669",
    nodes: [
      { label: "FastAPI", desc: "High-performance Python API framework handling all backend routes" },
      { label: "REST APIs", desc: "RESTful endpoints for audio, news, and analysis operations" },
      { label: "Middleware", desc: "Request logging, CORS, structured error handling" },
      { label: "Uvicorn", desc: "ASGI server running the FastAPI application" },
    ],
  },
  {
    name: "AI Services",
    color: "#7c3aed",
    nodes: [
      { label: "AssemblyAI", desc: "Speech-to-text transcription with exponential backoff retries" },
      { label: "OpenRouter", desc: "Primary LLM provider for financial analysis and reasoning" },
      { label: "Gemini Flash", desc: "Fallback LLM provider ensuring 100% uptime via auto-failover" },
      { label: "Panic Engine", desc: "Weighted keyword scoring engine for market stress detection" },
    ],
  },
  {
    name: "Knowledge",
    color: "#dc2626",
    nodes: [
      { label: "Embeddings", desc: "Text-to-vector conversion for semantic similarity matching" },
      { label: "ChromaDB", desc: "Local vector database for persistent article storage and retrieval" },
      { label: "RAG Pipeline", desc: "Retrieval Augmented Generation combining search with AI analysis" },
    ],
  },
  {
    name: "Data Sources",
    color: "#d97706",
    nodes: [
      { label: "RSS Feeds", desc: "Economic Times and financial RSS feed ingestion" },
      { label: "Web Scrapers", desc: "Automated collection of financial news from multiple sources" },
      { label: "Audio Input", desc: "Microphone recording and file upload for market commentary" },
    ],
  },
];

const TECH_STACK = [
  { category: "Frontend", items: [
    { name: "React 19", desc: "UI Framework", icon: Code2 },
    { name: "Vite", desc: "Build Tool", icon: Zap },
    { name: "Vanilla CSS", desc: "Styling", icon: Layers },
    { name: "Lucide", desc: "Icons", icon: Sparkles },
  ]},
  { category: "Backend", items: [
    { name: "FastAPI", desc: "API Framework", icon: Server },
    { name: "Python", desc: "Language", icon: Code2 },
    { name: "Uvicorn", desc: "ASGI Server", icon: Rocket },
    { name: "WebSockets", desc: "Real-time", icon: Wifi },
  ]},
  { category: "AI & ML", items: [
    { name: "AssemblyAI", desc: "Speech-to-Text", icon: Mic },
    { name: "OpenRouter", desc: "LLM Provider", icon: Brain },
    { name: "Gemini", desc: "Fallback LLM", icon: Bot },
    { name: "RAG", desc: "Retrieval Pipeline", icon: GitBranch },
  ]},
  { category: "Data", items: [
    { name: "ChromaDB", desc: "Vector Database", icon: Database },
    { name: "RSS Feeds", desc: "News Ingestion", icon: Rss },
    { name: "Web Scraping", desc: "Data Collection", icon: Globe },
    { name: "Embeddings", desc: "Vectorization", icon: Boxes },
  ]},
];

const FEATURES_BENTO = [
  { icon: Activity, title: "Real-Time Panic Detection", desc: "Weighted keyword scoring engine that quantifies market stress from text and audio in real time.", size: "wide" },
  { icon: Mic, title: "Speech Intelligence", desc: "AssemblyAI-powered transcription converts spoken market commentary into actionable text.", size: "normal" },
  { icon: Newspaper, title: "News Monitoring", desc: "Continuous RSS ingestion and web scraping of financial news sources.", size: "normal" },
  { icon: Search, title: "Semantic Search", desc: "ChromaDB vector search finds contextually relevant articles beyond simple keyword matching.", size: "normal" },
  { icon: Brain, title: "Context-Aware AI", desc: "RAG pipeline retrieves relevant context before LLM analysis for grounded recommendations.", size: "normal" },
  { icon: Monitor, title: "Live Dashboard", desc: "Interactive real-time dashboard with panic meter, transcript view, and trading recommendations.", size: "wide" },
  { icon: Radio, title: "Streaming Analysis", desc: "WebSocket-powered live analysis with real-time panic scoring updates.", size: "normal" },
  { icon: TrendingUp, title: "Trading Recommendations", desc: "AI-generated buy/sell/hold signals with confidence scores and sector analysis.", size: "normal" },
  { icon: Database, title: "RAG Intelligence", desc: "Retrieval Augmented Generation combines vector search with LLM reasoning.", size: "normal" },
];

const USE_CASES = [
  { icon: Users, title: "Retail Investors", desc: "Get AI-powered insights without expensive Bloomberg terminals or analyst subscriptions." },
  { icon: Building2, title: "Trading Firms", desc: "Augment existing strategies with real-time audio sentiment and panic detection signals." },
  { icon: BarChart3, title: "Financial Analysts", desc: "Accelerate research with semantic search across thousands of financial articles." },
  { icon: FlaskConical, title: "Research Teams", desc: "Explore market narratives through RAG-powered contextual analysis." },
  { icon: Shield, title: "Risk Management", desc: "Monitor market stress in real-time with automated panic scoring and alerts." },
  { icon: Eye, title: "Media Intelligence", desc: "Track financial media sentiment and emerging narratives across multiple sources." },
];

const METRICS = [
  { value: 500, suffix: "+", label: "News Articles Processed", desc: "Financial articles ingested and vectorized" },
  { value: 17, suffix: "ms", label: "Vector Search Latency", desc: "ChromaDB semantic retrieval speed" },
  { value: 13, suffix: "ms", label: "Panic Score Latency", desc: "Real-time text scoring engine" },
  { value: 99, suffix: "%", label: "AI Uptime", desc: "LLM fallback ensures reliability" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "Current Platform", items: ["Audio Sentiment Analysis", "Panic Detection Engine", "RAG Pipeline", "Real-Time Dashboard", "LLM Fallback System"], status: "done" },
  { phase: "Phase 2", title: "Enhanced Intelligence", items: ["Predictive Analytics", "Portfolio Risk Scoring", "Multi-Exchange Support", "Historical Backtesting"], status: "next" },
  { phase: "Phase 3", title: "Enterprise Scale", items: ["Institutional APIs", "Custom AI Models", "Global Markets", "Multilingual Support", "White-Label Solutions"], status: "future" },
];

/* ═══════════════════════════════════════════════
   LANDING COMPONENT
   ═══════════════════════════════════════════════ */

export default function Landing() {
  return (
    <main id="home">
      {/* ──────── HERO (preserved) ──────── */}
      <section className="hero" aria-labelledby="heroTitle">
        <RippleGrid />
        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-tag"></span>
            <h1 id="heroTitle" className="hero-heading">
              Clear Insights&nbsp;For
              <br />
              Smarter&nbsp;Decisions
            </h1>
            <p className="hero-sub">
              <br />
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

      {/* ──────── SCROLL CUE ──────── */}
      <div className="scroll-cue" aria-hidden="true">
        <ArrowDown size={18} className="scroll-cue-icon" />
      </div>

      {/* ──────── SECTION 1: WHAT IS PLUNGEPHOENIX ──────── */}
      <section id="about" className="lp-section" aria-labelledby="aboutTitle">
        <div className="about-grid">
          <Reveal className="about-text">
            <span className="section-kicker">AI Market Intelligence</span>
            <h2 id="aboutTitle" className="section-title">
              What is PlungePhoenix?
            </h2>
            <p className="section-body">
              PlungePhoenix is an AI-powered market intelligence platform that transforms live financial news 
              and spoken market commentary into actionable investment insights. It continuously collects data 
              from financial websites, RSS feeds, and web scrapers—then processes audio commentary through 
              AssemblyAI, detects panic levels, retrieves relevant context using RAG and ChromaDB vector search, 
              and generates AI-powered trading recommendations through OpenRouter and Gemini LLMs.
            </p>
            <div className="about-pills">
              {["AI Analysis", "Audio Sentiment", "Panic Detection", "RAG Pipeline", "Vector Search", "Real-Time"].map((t) => (
                <span key={t} className="about-pill">{t}</span>
              ))}
            </div>
          </Reveal>
          <Reveal className="about-visual" delay={200}>
            <div className="ai-orb">
              <div className="orb-ring orb-ring-1" />
              <div className="orb-ring orb-ring-2" />
              <div className="orb-ring orb-ring-3" />
              <div className="orb-core">
                <Brain size={42} />
              </div>
              {[Activity, Mic, Database, Search, TrendingUp, Radio].map((Icon, i) => (
                <div key={i} className="orb-node" style={{ "--i": i, "--total": 6 }}>
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────── SECTION 2: WHY TRADITIONAL FAILS ──────── */}
      <section id="comparison" className="lp-section lp-section-dark" aria-labelledby="compTitle">
        <Reveal>
          <span className="section-kicker section-kicker-light">The Problem</span>
          <h2 id="compTitle" className="section-title section-title-light">
            Why Traditional Market Monitoring Fails
          </h2>
        </Reveal>
        <div className="comparison-grid">
          {COMPARISON_DATA.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={i} delay={i * 100} className="comparison-row">
                <div className="comp-old">
                  <XCircle size={18} className="comp-x" aria-hidden="true" />
                  <div>
                    <strong>{item.old}</strong>
                    <p>{item.oldDesc}</p>
                  </div>
                </div>
                <div className="comp-arrow" aria-hidden="true">
                  <ChevronRight size={20} />
                </div>
                <div className="comp-new">
                  <div className="comp-new-icon"><Icon size={20} /></div>
                  <div>
                    <strong>{item.new}</strong>
                    <p>{item.newDesc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 3: WHY PLUNGEPHOENIX ──────── */}
      <section id="why" className="lp-section" aria-labelledby="whyTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">The Solution</span>
          <h2 id="whyTitle" className="section-title">Why PlungePhoenix</h2>
          <p className="section-subtitle">Everything you need for AI-powered market intelligence in one platform.</p>
        </Reveal>
        <div className="why-grid">
          {WHY_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={i} delay={i * 80} className="why-card">
                <div className="why-card-icon"><Icon size={24} /></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 4: HOW IT WORKS ──────── */}
      <section id="how-it-works" className="lp-section lp-section-dark" aria-labelledby="howTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker section-kicker-light">End-to-End Pipeline</span>
          <h2 id="howTitle" className="section-title section-title-light">How It Works</h2>
          <p className="section-subtitle section-subtitle-light">From raw data to actionable intelligence in seconds.</p>
        </Reveal>
        <div className="pipeline-track">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={i} delay={i * 70} className="pipeline-node">
                <div className="pipeline-icon"><Icon size={22} /></div>
                <strong>{step.label}</strong>
                <span>{step.desc}</span>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="pipeline-connector" aria-hidden="true" />
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 5: ARCHITECTURE ──────── */}
      <section id="architecture" className="lp-section" aria-labelledby="archTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">System Design</span>
          <h2 id="archTitle" className="section-title">System Architecture</h2>
          <p className="section-subtitle">A layered, production-grade architecture designed for reliability.</p>
        </Reveal>
        <div className="arch-stack">
          {ARCH_LAYERS.map((layer, li) => (
            <Reveal key={li} delay={li * 120} className="arch-layer">
              <div className="arch-layer-label" style={{ "--layer-color": layer.color }}>
                <Layers size={16} />
                <span>{layer.name}</span>
              </div>
              <div className="arch-nodes">
                {layer.nodes.map((node, ni) => (
                  <div key={ni} className="arch-node" style={{ "--layer-color": layer.color }} title={node.desc}>
                    <strong>{node.label}</strong>
                    <p>{node.desc}</p>
                  </div>
                ))}
              </div>
              {li < ARCH_LAYERS.length - 1 && (
                <div className="arch-flow" aria-hidden="true">
                  <div className="arch-flow-dot" />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────── SECTION 6: TECHNOLOGY STACK ──────── */}
      <section id="technology" className="lp-section lp-section-alt" aria-labelledby="techTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">Built With</span>
          <h2 id="techTitle" className="section-title">Technology Stack</h2>
        </Reveal>
        <div className="tech-categories">
          {TECH_STACK.map((cat, ci) => (
            <Reveal key={ci} delay={ci * 100} className="tech-category">
              <h3 className="tech-cat-title">{cat.category}</h3>
              <div className="tech-items">
                {cat.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <div key={ii} className="tech-item">
                      <div className="tech-item-icon"><Icon size={20} /></div>
                      <strong>{item.name}</strong>
                      <span>{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────── SECTION 7: KEY FEATURES ──────── */}
      <section id="features" className="lp-section" aria-labelledby="featTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">Capabilities</span>
          <h2 id="featTitle" className="section-title">Key Features</h2>
        </Reveal>
        <div className="bento-grid">
          {FEATURES_BENTO.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={i} delay={i * 60} className={`bento-card ${f.size === "wide" ? "bento-wide" : ""}`}>
                <div className="bento-icon"><Icon size={24} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 8: DASHBOARD PREVIEW ──────── */}
      <section id="preview" className="lp-section lp-section-dark" aria-labelledby="prevTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker section-kicker-light">Experience</span>
          <h2 id="prevTitle" className="section-title section-title-light">Dashboard Preview</h2>
          <p className="section-subtitle section-subtitle-light">A powerful real-time interface for market intelligence.</p>
        </Reveal>
        <Reveal delay={200} className="preview-window">
          <div className="preview-chrome">
            <span /><span /><span />
            <div className="preview-url">localhost:5173/#dashboard</div>
          </div>
          <div className="preview-body">
            <div className="preview-features">
              {[
                { icon: MessagesSquare, label: "Real-Time Transcript" },
                { icon: Activity, label: "Panic Meter" },
                { icon: TrendingUp, label: "Trading Recommendations" },
                { icon: Search, label: "Keyword Extraction" },
                { icon: Wifi, label: "System Status" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="preview-feature-tag">
                    <Icon size={16} /> {f.label}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="preview-cta">
            <a href="#dashboard" className="btn-primary">
              Open Dashboard <ArrowRight size={17} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ──────── SECTION 9: USE CASES ──────── */}
      <section id="use-cases" className="lp-section" aria-labelledby="ucTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">Who It's For</span>
          <h2 id="ucTitle" className="section-title">Use Cases</h2>
        </Reveal>
        <div className="uc-grid">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <Reveal key={i} delay={i * 80} className="uc-card">
                <div className="uc-icon"><Icon size={24} /></div>
                <h3>{uc.title}</h3>
                <p>{uc.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 10: PERFORMANCE METRICS ──────── */}
      <section id="metrics" className="lp-section lp-section-alt" aria-labelledby="metTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">Performance</span>
          <h2 id="metTitle" className="section-title">Performance Metrics</h2>
        </Reveal>
        <div className="metrics-grid">
          {METRICS.map((m, i) => (
            <Reveal key={i} delay={i * 120} className="metric-card">
              <AnimatedCounter end={m.value} suffix={m.suffix} />
              <strong>{m.label}</strong>
              <p>{m.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────── SECTION 11: ROADMAP ──────── */}
      <section id="roadmap" className="lp-section" aria-labelledby="rmTitle">
        <Reveal className="section-header-center">
          <span className="section-kicker">What's Next</span>
          <h2 id="rmTitle" className="section-title">Future Roadmap</h2>
        </Reveal>
        <div className="roadmap-track">
          {ROADMAP.map((phase, i) => (
            <Reveal key={i} delay={i * 150} className={`roadmap-phase roadmap-${phase.status}`}>
              <div className="roadmap-marker">
                {phase.status === "done" ? <CheckCircle2 size={20} /> : <div className="roadmap-dot" />}
              </div>
              <div className="roadmap-content">
                <span className="roadmap-label">{phase.phase}</span>
                <h3>{phase.title}</h3>
                <ul>
                  {phase.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────── SECTION 12: CTA ──────── */}
      <section id="cta" className="lp-section lp-cta" aria-labelledby="ctaTitle">
        <Reveal className="cta-inner">
          <Sparkles size={32} className="cta-sparkle" aria-hidden="true" />
          <h2 id="ctaTitle" className="cta-title">
            Experience AI-Powered<br />Market Intelligence
          </h2>
          <p className="cta-sub">Transform raw financial data into actionable insights today.</p>
          <div className="cta-buttons">
            <a href="#dashboard" className="btn-primary btn-lg">
              Open Dashboard <ArrowRight size={18} />
            </a>
            <a href="#about" className="btn-outline btn-lg">
              Learn More
            </a>
          </div>
        </Reveal>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer id="contact" className="lp-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="logo" href="#home">
              <AudioLines size={22} strokeWidth={2.5} />
              <span>PlungePhoenix</span>
            </a>
            <p>AI-powered market intelligence platform combining audio sentiment analysis with real-time financial data.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#about">About</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#architecture">Architecture</a>
            <a href="#features">Features</a>
            <a href="#dashboard">Dashboard</a>
          </div>
          <div className="footer-col">
            <h4>Technology</h4>
            <a href="#technology">React 19</a>
            <a href="#technology">FastAPI</a>
            <a href="#technology">ChromaDB</a>
            <a href="#technology">AssemblyAI</a>
            <a href="#technology">Gemini</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href="mailto:hello@plungephoenix.ai">Contact</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#roadmap">Roadmap</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PlungePhoenix. All rights reserved.</span>
          <span className="footer-version">v1.0.0</span>
        </div>
      </footer>
    </main>
  );
}
