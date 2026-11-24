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
      const rows = width < 650 ? 42 : 68;
      const step = Math.max(5, width / 190);
      for (let row = 0; row < rows; row++) {
        const d = row / (rows - 1);
        const depth = d * d;
        const base = height * (.39 + depth * .79);
        const path = new Path2D();
        for (let x = -step; x <= width + step; x += step) {
          const u = x / width;
          const ridge = Math.sin(u * 8 + d * 4 + time * .044)
            + .42 * Math.sin(u * 16 - d * 5 - time * .033);
          const banks = .3 + .7 * Math.abs(Math.cos(u * Math.PI));
          let y = base - height * .084 * ridge * banks;
          for (const wave of waves) {
            const age = time - wave.born;
            const radius = Math.hypot(x - wave.x, y - wave.y);
            const band = (radius - age * 175) / 23;
            if (Math.abs(band) < 3) y += 16 * Math.sin(band * 2) * Math.exp(-band * band) * (1 - age / 1.6);
          }
          if (x === -step) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        const major = row % 6 === 0;
        ctx.strokeStyle = major ? "rgba(244,182,112," + (.19 + .34*d) + ")" : "rgba(187,155,126," + (.085 + .22*d) + ")";
        ctx.lineWidth = major ? 1.25 : .8;
        ctx.stroke(path);
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
    background:"radial-gradient(ellipse at 76% 42%, #342921 0%, transparent 47%), radial-gradient(ellipse at 26% 53%, #162129, transparent 55%), linear-gradient(180deg,#080d14,#16191d 54%,#0c0f14)"
  }}/>;
}
