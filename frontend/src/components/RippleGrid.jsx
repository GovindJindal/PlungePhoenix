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
    const spacing = 45;
    const focalLength = 600;
    const waveSpeed = 0.003;
    const waveFrequency = 0.015;
    const waveAmplitude = 120;
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

      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          particles.push({
            x: i * spacing - offsetX,
            z: j * spacing - offsetZ,
          });
        }
      }
    }

    function updateAndRender(time) {
      const currentStress = Math.min(1, Math.max(0, stressRef.current || 0));
      ctx.clearRect(0, 0, width, height);

      target.x += (mouse.x - target.x) * 0.05;
      target.z += (mouse.z - target.z) * 0.05;

      for (const particle of particles) {
        const dx = particle.x - target.x;
        const dz = particle.z - target.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const dampening = Math.max(0, 1 - distance / 1200);
        const y =
          Math.sin(distance * waveFrequency - time * waveSpeed) *
          waveAmplitude *
          dampening *
          (1 + currentStress * 0.35);

        const translatedZ = particle.z + 900;
        const scale = focalLength / (focalLength + translatedZ);
        const screenX = width / 2 + particle.x * scale;
        const screenY = height / 2 + (y + 160) * scale;
        const opacity = Math.min(1, Math.max(0, scale * 1.5 - 0.25));
        const radius = Math.max(0.2, 1.7 * scale);

        if (opacity > 0) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26,86,219,${opacity * 0.6})`;
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
