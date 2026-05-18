import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  FileAudio,
  Loader2,
  Mic,
  Square,
  UploadCloud,
} from "lucide-react";
import API from "../lib/api.js";
import Logger from "../lib/logger.js";
import VoiceRecorder from "../lib/VoiceRecorder.js";

const loadingMessages = [
  "Transcribing with AssemblyAI...",
  "Retrieving market news...",
  "PhoenixAdvisor is analyzing...",
];

function levelClass(level = "low") {
  return `level-${String(level).toLowerCase()}`;
}

function actionClass(action = "hold") {
  return `action-${String(action).toLowerCase()}`;
}

function normalizeAction(action = "Hold") {
  const value = String(action).toLowerCase();
  if (["buy", "sell", "hedge", "hold"].includes(value)) return value;
  return "hold";
}

function formatScore(score) {
  if (typeof score !== "number") return "0.00";
  return score.toFixed(2);
}

export default function Dashboard({ health }) {
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [panic, setPanic] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [newsUsed, setNewsUsed] = useState([]);
  const [error, setError] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const recorderRef = useRef(null);
  const fileInputRef = useRef(null);

  const isBusy = ["processing", "analyzing"].includes(status);
  const isRecording = status === "recording";

  useEffect(() => {
    const recorder = new VoiceRecorder({
      onTranscript: setTranscript,
      onPanic: setPanic,
      onAnalysis: renderAnalysis,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        setStatusMessage(statusLabel(nextStatus));
      },
      onError: (message) => setError(message),
    });
    recorderRef.current = recorder;

    API.ingestNews().catch((err) => {
      Logger.error("Background news ingest failed", err);
    });

    return () => recorder.destroy();
  }, []);

  useEffect(() => {
    if (!isBusy) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setLoadingMessageIndex((index) => (index + 1) % loadingMessages.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [isBusy]);

  useEffect(() => {
    const nextScore = panic?.score || 0;
    let frame = 0;
    const start = displayScore;
    const diff = nextScore - start;

    function tick() {
      frame += 1;
      const progress = Math.min(1, frame / 24);
      setDisplayScore(start + diff * progress);
      if (progress < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }, [panic?.score]);

  function statusLabel(nextStatus) {
    const labels = {
      idle: "Ready for audio",
      recording: "Recording...",
      processing: "Processing audio",
      analyzing: "Analyzing transcript",
      done: "Analysis complete",
      error: "Needs attention",
    };
    return labels[nextStatus] || labels.idle;
  }

  function renderAnalysis(payload) {
    setAnalysis(payload.analysis || null);
    setNewsUsed(payload.news_used || []);
    if (payload.transcript_result) {
      setTranscript(payload.transcript_result.text || "");
      setPanic(payload.transcript_result.panic || null);
    }
  }

  async function handleMicClick() {
    setError("");
    if (!recorderRef.current) return;

    if (recorderRef.current.isRecording) {
      recorderRef.current.stopRecording();
    } else {
      setAnalysis(null);
      setNewsUsed([]);
      await recorderRef.current.startRecording();
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file || !recorderRef.current) return;
    setError("");
    setAnalysis(null);
    setNewsUsed([]);
    recorderRef.current.uploadFile(file, file.name);
    event.target.value = "";
  }

  async function runDemo() {
    setError("");
    setStatus("analyzing");
    setStatusMessage(statusLabel("analyzing"));
    try {
      const result = await API.demo();
      renderAnalysis(result.data);
      setStatus("done");
      setStatusMessage(statusLabel("done"));
    } catch (err) {
      Logger.error("Demo analysis failed", err);
      setError(err.message || "Demo analysis failed");
      setStatus("error");
      setStatusMessage(statusLabel("error"));
    }
  }

  const recommendations = analysis?.recommendations || [];
  const sectors = analysis?.sector_impact || [];
  const keywords = panic?.keywords_found || [];
  const risk = analysis?.risk_level || panic?.level || "Low";
  const riskClass = levelClass(risk);

  const newsRows = useMemo(() => newsUsed.slice(0, 5), [newsUsed]);

  return (
    <main className="dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <a className="back-link" href="#home">
            Home
          </a>
          <h1>PlungePhoenix Dashboard</h1>
        </div>
        <div className="dashboard-title-actions">
          <span className="live-badge">[ LIVE ANALYSIS ]</span>
          <div className={`connection-pill connection-${health.status}`} role="status">
            <span aria-hidden="true" />
            {health.message}
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="dashboard-grid">
        <div className="dashboard-left">
          <article className="panel voice-panel">
            {isBusy && (
              <div className="panel-overlay">
                <Loader2 className="spin" size={28} aria-hidden="true" />
                <p>{loadingMessages[loadingMessageIndex]}</p>
              </div>
            )}

            <div className="panel-heading">
              <div>
                <span className="panel-kicker">Voice Input</span>
                <h2>Record or upload market audio</h2>
              </div>
              <StatusIndicator status={status} message={statusMessage || "Ready for audio"} />
            </div>

            <div className="voice-controls">
              <button
                type="button"
                className={`mic-button ${isRecording ? "recording" : ""}`}
                onClick={handleMicClick}
                aria-pressed={isRecording}
              >
                {isRecording ? <Square size={30} fill="currentColor" /> : <Mic size={34} />}
              </button>

              <button
                type="button"
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={28} aria-hidden="true" />
                <strong>Upload audio</strong>
                <span>.mp3 .wav .m4a .webm .ogg</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                hidden
                onChange={handleFileChange}
              />
            </div>

            <label className="transcript-label" htmlFor="transcript">
              Transcript
            </label>
            <textarea
              id="transcript"
              className="transcript-area"
              value={transcript}
              placeholder="Your transcribed audio will appear here."
              readOnly
            />
          </article>

          <article className={`panel reveal ${panic ? "visible" : ""}`}>
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">Panic Score</span>
                <h2>Market stress signal</h2>
              </div>
              <span className={`level-badge ${levelClass(panic?.level)}`}>
                {panic?.level || "Low"}
              </span>
            </div>
            <div className="panic-layout">
              <div className="panic-score">{formatScore(displayScore)}</div>
              <div className="keyword-list" aria-label="Keywords found">
                {keywords.length ? (
                  keywords.map((keyword) => <span key={keyword}>{keyword}</span>)
                ) : (
                  <span>No panic keywords yet</span>
                )}
              </div>
            </div>
          </article>
        </div>

        <div className="dashboard-right">
          <article className={`panel reveal ${analysis ? "visible" : ""}`}>
            <div className={`risk-banner ${riskClass}`}>Risk level: {risk}</div>
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">Investment Advice</span>
                <h2>PhoenixAdvisor recommendations</h2>
              </div>
            </div>
            <p className="analysis-summary">
              {analysis?.summary || "Run a demo or transcribe audio to generate advice."}
            </p>
            <div className="recommendation-list">
              {recommendations.slice(0, 3).map((rec, index) => {
                const action = normalizeAction(rec.action);
                return (
                  <div className="recommendation-row" key={`${rec.asset}-${index}`}>
                    <span className={`action-badge ${actionClass(action)}`}>{rec.action}</span>
                    <div>
                      <strong>{rec.asset}</strong>
                      <p>{rec.reasoning}</p>
                    </div>
                    <span className="confidence-badge">{rec.confidence || "Medium"}</span>
                  </div>
                );
              })}
            </div>
            {!!sectors.length && (
              <div className="sector-strip">
                {sectors.slice(0, 3).map((sector) => (
                  <span key={sector.sector}>
                    {sector.sector}: {sector.impact}
                  </span>
                ))}
              </div>
            )}
          </article>

          <article className="panel">
            <div className="panel-heading compact-heading">
              <div>
                <span className="panel-kicker">News Used</span>
                <h2>Sources used by AI</h2>
              </div>
              <FileAudio size={20} aria-hidden="true" />
            </div>
            <div className="news-list">
              {newsRows.length ? (
                newsRows.map((item, index) => (
                  <a href={item.url || "#"} className="news-row" key={`${item.title}-${index}`}>
                    <strong>{item.title || "Untitled market source"}</strong>
                    <span>
                      {item.source || "Economic Times"} {item.published_at ? `- ${item.published_at}` : ""}
                    </span>
                  </a>
                ))
              ) : (
                <p className="empty-state">News sources will appear after analysis.</p>
              )}
            </div>
          </article>
        </div>
      </section>

      <div className="demo-row">
        <button type="button" className="btn-primary" onClick={runDemo}>
          Try Demo Analysis <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}

function StatusIndicator({ status, message }) {
  return (
    <div className={`status-indicator status-${status}`}>
      <span aria-hidden="true" />
      {message}
    </div>
  );
}
