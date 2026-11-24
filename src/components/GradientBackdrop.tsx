import { useEffect, useRef } from "react";

type Ripple = { x: number; y: number; born: number };

export default function GradientBackdrop({ paused }: { paused: boolean }) {
  const surface = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = surface.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const waves: Ripple[] = [];
    let width = 1, height = 1, frame = 0, time = 0, lastFrame = 0;
    let lastX = -1000, lastY = -1000, lastDrop = -Infinity;
    const moving = () => !paused && !motion.matches && !document.hidden;

    function draw(now: number) {
      frame = 0;
      if (!canvas || !ctx) return;
      if (moving() && lastFrame) time += Math.min(now - lastFrame, 70) / 1000;
      lastFrame = now;
      while (waves.length && time - waves[0].born > 1.6) waves.shift();
      ctx.clearRect(0, 0, width, height);
      // Each sheet is woven from continuous curves. Highlights gather at its folds.
      const layers = ["144,125,184", "116,195,196"];
      for (const [layer, color] of layers.entries()) {
        const phase = time * .095 + layer * 1.4;
        const steps = 72;
        const strands = width < 650 ? 26 : 42;
        for (let i = 0; i < strands; i++) {
          const v = i / (strands - 1);
          ctx.beginPath();
          for (let j = 0; j <= steps; j++) {
            const u = j / steps, x = u * width;
            const fold = Math.sin(6*u + phase + v*.75);
            let y = height * (.53 + layer*.13 + fold*.16 - u*.16
              + (v-.5)*(.16 + .14*Math.cos(5*u-phase)));
            for (const wave of waves) {
              const age = time-wave.born;
              const band = (Math.hypot(x-wave.x,y-wave.y)-age*210)/55;
              y += 25*Math.sin(band*2)*Math.exp(-band*band)*(1-age/1.6);
            }
            if (j === 0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
          }
          ctx.lineWidth = Math.max(1,height*.18/strands);
          ctx.strokeStyle = "rgba("+color+","+
            ((.035+.13*Math.pow(v,3))*Math.sin(Math.PI*v)**.4)+")";
          ctx.stroke();
        }
      }
      if (moving()) frame = requestAnimationFrame(schedule);
    }
    function schedule(now: number) {
      if (now - lastFrame >= 32) draw(now);
      else frame = requestAnimationFrame(schedule);
    }
    function refresh() {
      cancelAnimationFrame(frame);
      lastFrame = 0;
      if (!moving()) waves.length = 0;
      draw(performance.now());
    }
    function resize() {
      if (!canvas || !ctx) return;
      width = canvas.clientWidth || 1;
      height = canvas.clientHeight || 1;
      const ratio = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      refresh();
    }
    function stir(event: PointerEvent) {
      if (!moving() || time - lastDrop < .11 || Math.hypot(event.clientX-lastX,event.clientY-lastY) < 10) return;
      lastX = event.clientX;
      lastY = event.clientY;
      lastDrop = time;
      waves.push({x:lastX,y:lastY,born:time});
      if (waves.length > 5) waves.shift();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    window.addEventListener("pointermove", stir, { passive:true });
    document.addEventListener("visibilitychange",refresh);
    motion.addEventListener("change",refresh);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove",stir);
      document.removeEventListener("visibilitychange",refresh);
      motion.removeEventListener("change",refresh);
    };
  }, [paused]);

  return <canvas ref={surface} aria-hidden="true" style={{
    position:"fixed", inset:0, width:"100%", height:"100%", zIndex:-1, pointerEvents:"none",
    background:"radial-gradient(ellipse at 65% 35%, #17253a, transparent 60%), linear-gradient(155deg,#030814,#10192d 55%,#040913)"
  }}/>;
}
