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
      // Translucent curtains lean across the sky. Each cursor ripple displaces
      // the curtain's silhouette before its light fades back into the scene.
      const colors = ["87,111,224", "78,202,189", "154,130,220"];
      const step = Math.max(7, width / 145);
      for (let layer = 0; layer < colors.length; layer++) {
        const ribbon = new Path2D();
        for (let x = -step; x <= width + step; x += step) {
          const u = x / width;
          const phase = time * .13 + layer * .78;
          let y = height * (.40 + layer * .10 + .19 * Math.sin(5*u + phase)
            + .06 * Math.sin(11*u - phase) - .13*u);
          for (const wave of waves) {
            const age = time - wave.born;
            const band = (Math.hypot(x-wave.x, y-wave.y) - age*210) / 55;
            y += 31 * Math.sin(band*2) * Math.exp(-band*band) * (1-age/1.6);
          }
          // Vertical light columns feather upward from the lower lip.
          const reach = height * (.23 + .13 * (.5 + .5*Math.cos(6*u-phase)));
          const light = ctx.createLinearGradient(x,y-reach,x,y+height*.05);
          const color = colors[layer];
          const strength = .33 + .15*Math.sin(u*24+phase)*Math.sin(u*8-phase);
          light.addColorStop(0, "rgba("+color+",0)");
          light.addColorStop(.70, "rgba("+color+","+strength*.36+")");
          light.addColorStop(.83, "rgba("+color+","+strength+")");
          light.addColorStop(1, "rgba("+color+",0)");
          ctx.fillStyle = light;
          ctx.fillRect(x,y-reach,step+.2,reach+height*.05);
          if (x === -step) ribbon.moveTo(x,y-height*.014);
          else ribbon.lineTo(x,y-height*.014);
        }
        ctx.strokeStyle = "rgba("+colors[layer]+",.12)";
        ctx.lineWidth = 1;
        ctx.stroke(ribbon);
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
