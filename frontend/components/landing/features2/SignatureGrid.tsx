"use client";

import { useEffect, useRef } from "react";
import { frameLoop, setupCanvas } from "../fx";

// Background of "Attestation made easy": a 28px grid of two signature sprites whose opacity
// pulses in a travelling wave. Only animates while on screen.
const TILE = 28;

export default function SignatureGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stop = () => {};
    let dispose = () => {};
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const c = setupCanvas(canvas);
      dispose = c.dispose;
      const cols = canvas.clientWidth / TILE;
      const rows = canvas.clientHeight / TILE;
      const sprites = [0, 1].map((i) => { const img = new Image(TILE, TILE); img.src = `/assets/images/features/signature/${i}.png`; return img; });
      const tiles = Array.from({ length: Math.floor(cols * rows) }, (_, t) => ({
        x: Math.floor(t % cols) * TILE,
        y: Math.floor(t / cols) * TILE,
        sprite: Math.random() > 0.5 ? 1 : 0,
        phase: Math.random(),
      }));
      Promise.all(sprites.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; })))).then(() => {
        if (cancelled) return;
        stop = frameLoop({
          target: canvas,
          frames: 10,
          animate: () => {
            c.ctx.clearRect(0, 0, canvas.width, canvas.height);
            const now = (Date.now() % 1000) / 1000;
            for (const t of tiles) {
              let a = (t.phase + now) % 1;
              a = (a > 0.5 ? 1 - a : a) * 2;
              c.ctx.globalAlpha = 0.1 + (1 - a) * 0.22;
              c.ctx.drawImage(sprites[t.sprite], t.x, t.y, TILE, TILE);
            }
          },
        });
      });
    });
    io.observe(canvas);
    return () => { cancelled = true; io.disconnect(); stop(); dispose(); };
  }, []);
  return <canvas ref={ref} className="w-[calc(100%-64px)] features-signature-background h-240 absolute top-32 left-32"></canvas>;
}
