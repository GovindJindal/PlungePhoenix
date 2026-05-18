const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function parseResponse(response) {
  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const detail = body.detail || body.error || response.statusText || "Request failed";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return body;
}

const API = {
  base: API_BASE,

  health: () => fetch(`${API_BASE}/health`).then(parseResponse),

  ingestNews: () =>
    fetch(`${API_BASE}/api/news/ingest`, { method: "POST" }).then(parseResponse),

  transcribeAudio: (file, filename) => {
    const formData = new FormData();
    formData.append("file", file, filename || file.name || "recording.webm");
    return fetch(`${API_BASE}/api/audio/transcribe`, {
      method: "POST",
      body: formData,
    }).then(parseResponse);
  },

  scoreText: (text) =>
    fetch(`${API_BASE}/api/audio/score-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(parseResponse),

  fullPipeline: (text) =>
    fetch(`${API_BASE}/api/analysis/full-pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(parseResponse),

  demo: () => fetch(`${API_BASE}/api/analysis/demo`).then(parseResponse),
};

window.API = API;

export default API;
