import API from "./api.js";
import Logger from "./logger.js";

export default class VoiceRecorder {
  constructor(options = {}) {
    this.onTranscript = options.onTranscript || (() => {});
    this.onPanic = options.onPanic || (() => {});
    this.onAnalysis = options.onAnalysis || (() => {});
    this.onError = options.onError || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});

    this.mediaRecorder = null;
    this.chunks = [];
    this.isRecording = false;
    this.stream = null;
  }

  pickMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
    return "";
  }

  async startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone recording is not available in this browser.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = this.pickMimeType();
      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => this.uploadCurrentRecording();
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.onStatusChange("recording");
    } catch (err) {
      const message =
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access and try again."
          : `Could not start recording: ${err.message}`;
      Logger.error("Recording failed", err);
      this.onError(message);
      this.onStatusChange("error");
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.isRecording = false;
      this.onStatusChange("processing");
    }
  }

  async uploadCurrentRecording() {
    const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || "audio/webm" });
    await this.uploadFile(blob, "recording.webm");
  }

  async uploadFile(file, filename) {
    this.onStatusChange("processing");
    try {
      const transcriptResponse = await API.transcribeAudio(file, filename || file.name);
      const transcript = transcriptResponse.data;
      this.onTranscript(transcript.text || "");
      this.onPanic(transcript.panic || null);
      this.onStatusChange("analyzing");

      if (!transcript.text?.trim()) {
        throw new Error("Transcription returned no text. Try a longer recording.");
      }

      const analysisResponse = await API.fullPipeline(transcript.text);
      this.onAnalysis(analysisResponse.data);
      this.onStatusChange("done");
    } catch (err) {
      Logger.error("Voice upload failed", err);
      this.onError(err.message || "Transcription failed");
      this.onStatusChange("error");
    }
  }

  destroy() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((track) => track.stop());
  }
}
