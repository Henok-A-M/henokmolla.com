import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

const Aurora = lazy(async () => {
  const { ShaderGradientCanvas, ShaderGradient } = await import("@shadergradient/react");
  return {
    default: () => (
      <ShaderGradientCanvas pixelDensity={1} pointerEvents="none" powerPreference="low-power" style={{ position: "absolute", inset: 0 }}>
        <ShaderGradient type="plane" animate="on" lightType="3d" grain="off"
          color1="#062133" color2="#43a7a4" color3="#304f85"
          cDistance={3.6} cPolarAngle={90} uTime={3} uSpeed={0.16}
          uFrequency={4} uStrength={3.1} uDensity={1.3} brightness={1.05} />
      </ShaderGradientCanvas>
    ),
  };
});

class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function GradientBackdrop({ paused }: { paused: boolean }) {
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
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
      background: "radial-gradient(ellipse at 72% 16%, #315d7c, transparent 65%), radial-gradient(ellipse at 25% 90%, #206064, transparent 64%), #06131e" }}>
      {!still && !paused && <Fallback><Suspense fallback={null}><Aurora /></Suspense></Fallback>}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(90deg, #03101bba, #05142240 32%, #04132149 66%, #030c17bd)" }} />
    </div>
  );
}
