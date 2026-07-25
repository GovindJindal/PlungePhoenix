import { useEffect, useRef } from "react";

export default function RippleGrid({ stress = 0 }) {
  const canvasRef = useRef(null);
  const stressRef = useRef(stress);

  useEffect(() => {
    stressRef.current = stress;
  }, [stress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let raf = 0;
    let particles = [];

    // Grid config
    const spacing = 45;
    const focalLength = 600;

    // Wave config — multiple overlapping waves for organic rise & fall
    const WAVES = [
      { speed: 0.0018, freq: 0.013, amp: 140 },  // primary slow swell
      { speed: 0.0031, freq: 0.022, amp:  55 },  // secondary ripple
      { speed: 0.0008, freq: 0.007, amp:  30 },  // slow deep undulation
    ];

    // Color cycle: blue(26,86,219) → violet(120,60,240) → cyan(26,180,220) → back
    // Uses time in ms, one full rotation ≈ 12 seconds so it's clearly visible
    const COLOR_SPEED = 0.05; // degrees per ms

    const mouse = { x: 0, z: 0 };
    const target = { x: 0, z: 0 };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      initParticles();
    }

    function initParticles() {
      particles = [];
      const cols = Math.ceil(width / spacing) + 18;
      const rows = Math.ceil(height / spacing) + 18;
      const offsetX = (cols * spacing) / 2;
      const offsetZ = (rows * spacing) / 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: i * spacing - offsetX,
            z: j * spacing - offsetZ,
          });
        }
      }
    }

    function updateAndRender(time) {
      ctx.clearRect(0, 0, width, height);

      target.x += (mouse.x - target.x) * 0.05;
      target.z += (mouse.z - target.z) * 0.05;

      // ── Color cycling (clearly visible, 12-second loop) ──
      const deg = (time * COLOR_SPEED) % 360;
      const rad = (deg / 360) * Math.PI * 2;
      const r = Math.round(60  + 80  * Math.sin(rad));           // 60–140
      const g = Math.round(100 + 80  * Math.sin(rad + 2.094));   // phase 120°
      const b = Math.round(220 + 30  * Math.sin(rad + 4.189));   // phase 240° — stays mostly blue

      for (const particle of particles) {
        const dx = particle.x - target.x;
        const dz = particle.z - target.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const dampening = Math.max(0, 1 - distance / 1200);

        // ── Multi-wave layered rise & fall ──
        let y = 0;
        for (const w of WAVES) {
          y += Math.sin(distance * w.freq - time * w.speed) * w.amp * dampening;
        }

        const translatedZ = particle.z + 900;
        const scale = focalLength / (focalLength + translatedZ);
        const screenX = width / 2 + particle.x * scale;
        const screenY = height / 2 + (y + 160) * scale;
        const opacity = Math.min(1, Math.max(0, scale * 1.8 - 0.15));
        const radius = Math.max(0.3, 2.0 * scale);

        if (opacity > 0) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.75})`;
          ctx.fill();
        }
      }

      raf = window.requestAnimationFrame(updateAndRender);
    }

    function onPointerMove(event) {
      const rect = canvas.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / Math.max(width, 1)) * 2 - 1;
      const ny = ((event.clientY - rect.top) / Math.max(height, 1)) * 2 - 1;
      mouse.x = nx * 1000;
      mouse.z = ny * 1000;
    }

    resize();
    raf = window.requestAnimationFrame(updateAndRender);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} id="rippleGrid" className="hero-ripple" aria-hidden="true" />;
}
