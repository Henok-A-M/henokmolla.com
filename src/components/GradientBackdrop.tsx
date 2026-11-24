import { Component, Fragment, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const Aurora = lazy(async () => {
  const { ShaderGradientCanvas, ShaderGradient } = await import("@shadergradient/react");
  return {
    default: () => (
      <ShaderGradientCanvas pixelDensity={1} pointerEvents="none" powerPreference="low-power" style={{ position: "absolute", inset: 0 }}>
        <ShaderGradient type="waterPlane" animate="on" lightType="3d" grain="off"
          color1="#101116" color2="#a9bdde" color3="#333e58"
          cDistance={3.1} cAzimuthAngle={38} cPolarAngle={74} rotationZ={-18} uTime={5} uSpeed={0.13}
          uFrequency={2.6} uStrength={2.4} uDensity={1.15} brightness={0.92} />
      </ShaderGradientCanvas>
    ),
  };
});

class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

// Red and green encode horizontal and vertical refraction. Neutral grey
// leaves the image in place; three concentric crests bend it in opposite directions.
function makeWaveMap() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(128, 128);
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const dx = (x - 63.5) / 64, dy = (y - 63.5) / 64;
      const radius = Math.hypot(dx, dy);
      const crest = radius < 1 ? Math.sin(radius * 23) * Math.sin(radius * Math.PI) ** 2 : 0;
      const index = 4 * (128 * y + x);
      image.data[index] = 128 + 124 * crest * dx / (radius || 1);
      image.data[index + 1] = 128 + 124 * crest * dy / (radius || 1);
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

function CursorWaves({ surface }: { surface: React.RefObject<HTMLDivElement | null> }) {
  const filter = useRef<SVGFilterElement>(null);
  useEffect(() => {
    const element = surface.current, effect = filter.current;
    if (!element || !effect) return;
    const images = Array.from(effect.querySelectorAll("feImage"));
    const displacements = Array.from(effect.querySelectorAll("feDisplacementMap"));
    const map = makeWaveMap();
    if (!map) return;
    images.forEach(image => image.setAttribute("href", map));
    const waves = images.map(() => ({ x: 0, y: 0, birth: -Infinity, power: 0 }));
    let next = 0, lastTime = -Infinity, lastX = 0, lastY = 0, frame = 0;
    const resize = () => {
      effect.setAttribute("width", String(element.clientWidth));
      effect.setAttribute("height", String(element.clientHeight));
    };
    resize();
    function draw(now: number) {
      let alive = false;
      waves.forEach((wave, i) => {
        const age = (now - wave.birth) / 1250;
        if (age >= 1) { displacements[i].setAttribute("scale", "0"); return; }
        alive = true;
        const radius = 24 + 162 * age;
        const image = images[i];
        image.setAttribute("x", String(wave.x - radius));
        image.setAttribute("y", String(wave.y - radius));
        image.setAttribute("width", String(radius * 2));
        image.setAttribute("height", String(radius * 2));
        displacements[i].setAttribute("scale", String(wave.power * (1-age)**1.5));
      });
      if (alive) frame = requestAnimationFrame(draw);
      else { element!.style.filter = ""; frame = 0; }
    }
    function move(event: PointerEvent) {
      const now = performance.now();
      const distance = Math.hypot(event.clientX-lastX, event.clientY-lastY);
      if (now-lastTime < 110 || (distance < 12 && now-lastTime < 500)) return;
      waves[next] = { x:event.clientX, y:event.clientY, birth:now, power:Math.min(105, 55+distance*.3) };
      next = (next+1) % waves.length;
      lastTime = now; lastX = event.clientX; lastY = event.clientY;
      if (!frame) { element!.style.filter = "url(#cursor-water)"; frame = requestAnimationFrame(draw); }
    }
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); element.style.filter = ""; window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize); };
  }, [surface]);
  return <svg aria-hidden="true" width="0" height="0" style={{position:"absolute"}}><defs>
    <filter ref={filter} id="cursor-water" x="0" y="0" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feFlood floodColor="#808080" result="neutral" />
      {[0,1,2].map(i => <Fragment key={i}>
        <feImage x="0" y="0" width="1" height="1" result={"wave"+i} />
        <feComposite in={"wave"+i} in2="neutral" operator="over" result={"field"+i} />
        <feDisplacementMap in={i ? "bent"+(i-1) : "SourceGraphic"} in2={"field"+i} scale="0" xChannelSelector="R" yChannelSelector="G" result={"bent"+i}/>
      </Fragment>)}
    </filter>
  </defs></svg>;
}

export default function GradientBackdrop({ paused }: { paused: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(true);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(preference.matches || document.hidden);
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div aria-hidden="true" style={{ position:"fixed", inset:0, zIndex:-1, overflow:"hidden", pointerEvents:"none" }}>
    {!still && !paused && <CursorWaves surface={surface} />}
    <div ref={surface} style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
      background: "linear-gradient(153deg, #090a10 5%, #202433 31%, #62718c 39%, #30394d 44%, #10131d 58%, #45516b 76%, #131620 89%)" }}>
      {!still && !paused && <Fallback><Suspense fallback={null}><Aurora /></Suspense></Fallback>}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(90deg, #080a10b8, #10131c33 32%, #0b0e1938 66%, #090b13bb)" }} />
    </div></div>
  );
}
