import {useEffect,useRef,useState} from "react";
import legacy from "../legacy/portfolio.html?raw";
import scenarioImage from "../../assets/images/image(5)(1).png?url";
import captureImage from "../../assets/images/image(6)(1).png?url";

const portfolioMarkup = {
  __html: legacy
    .replace('src="assets/images/image(5)(1).png"', `src="${scenarioImage}"`)
    .replace('src="assets/images/image(6)(1).png"', `src="${captureImage}"`),
};
import {initLegacy} from "../lib/legacy";

const nodes=[{id:"about",name:"Identity",sub:"My story",lat:.32,lon:0},{id:"projects",name:"Projects",sub:"Lab evidence",lat:.05,lon:1.58},{id:"skills",name:"Capabilities",sub:"Technical skills",lat:-.55,lon:2.8},{id:"experience",name:"Journey",sub:"Education & experience",lat:.55,lon:4.1},{id:"contact",name:"Connect",sub:"Get in touch",lat:-.55,lon:5.1}];
const portrait="https://raw.githubusercontent.com/Henok-A-M/Henok-A-M/main/assets/henok_clear_highres_85.webp";
type V=[number,number,number];
const point=(lat:number,lon:number):V=>[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];
const dots=Array.from({length:220},(_,i)=>{const y=1-2*(i+.5)/220;return point(Math.asin(y),i*2.39996323)});
const edges=dots.flatMap((a,i)=>dots.slice(i+1).map((b,j)=>({i,j:i+j+1,d:Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])})).filter(e=>e.d<.31));
const initial=()=>nodes.some(n=>n.id===location.hash.slice(1))?location.hash.slice(1):"";
import GradientBackdrop from './GradientBackdrop';
export default function Network(){
 const [active,setActive]=useState(initial),[paused,setPaused]=useState(false),[focused,setFocused]=useState("");const canvas=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null),labels=useRef<(HTMLButtonElement|null)[]>([]),content=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null),readout=useRef<HTMLSpanElement>(null),meter=useRef<HTMLDivElement>(null);
 const motion=useRef({yaw:-.6,pitch:.12,zoom:1,targetZoom:1,drag:false,moved:false,startX:0,startY:0,lastX:0,lastY:0,active:"",paused:false,targetYaw:-.6,targetPitch:.12,focus:"",points:[] as {id:string;x:number;y:number;z:number}[],touches:new Map<number,{x:number;y:number}>(),pinch:0});
 const select=(id:string)=>{motion.current.focus="";setFocused("");setActive(id);history.replaceState(null,"",id?`#${id}`:location.pathname+location.search);};
 const aim=(id:string)=>{const m=motion.current,n=nodes.find(n=>n.id===id);if(!n)return;m.focus=id;setFocused(id);m.targetYaw=m.yaw+Math.atan2(Math.sin(-n.lon-m.yaw),Math.cos(-n.lon-m.yaw));m.targetPitch=n.lat;};
 const zoomAt=(amount:number,x?:number,y?:number,nodeId?:string)=>{const m=motion.current;if(m.active){if(amount<0)select("");return;}if(amount>0&&!m.focus&&nodeId)aim(nodeId);if(amount>0&&!m.focus&&x!==undefined&&y!==undefined&&stage.current){const rect=stage.current.getBoundingClientRect();const nearest=m.points.map(p=>({...p,d:Math.hypot(p.x-(x-rect.left),p.y-(y-rect.top))})).sort((a,b)=>a.d-b.d)[0];if(nearest&&nearest.d<Math.max(105,rect.width*.17))aim(nearest.id);}m.targetZoom=Math.max(.5,Math.min(2.35,m.targetZoom+amount));if(m.targetZoom<=1){m.focus="";setFocused("");}};
 const reset=()=>{const m=motion.current;m.yaw=-.6;m.pitch=.12;m.targetZoom=1;m.touches.clear();m.pinch=0;m.drag=false;select("");};
 useEffect(()=>{const root=content.current;if(root)return initLegacy(root)},[]);
 useEffect(()=>{motion.current.paused=paused},[paused]);
 useEffect(()=>{const m=motion.current;m.active=active;m.targetZoom=active?2.15:1;if(active){const n=nodes.find(n=>n.id===active);if(n){m.targetYaw=m.yaw+Math.atan2(Math.sin(-n.lon-m.yaw),Math.cos(-n.lon-m.yaw));m.targetPitch=n.lat;}if(panel.current)panel.current.scrollTop=0;}},[active]);
 // Return to the same node after the camera pulls back.
 const returnToNetwork = () => {
   const index = nodes.findIndex(node => node.id === motion.current.active);
   select("");
   requestAnimationFrame(() => labels.current[index]?.focus({ preventScroll: true }));
 };

 useEffect(() => {
   function shortcut(event: KeyboardEvent) {
     if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey ||
         document.querySelector("dialog[open]") ||
         (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true]"))) return;
     if (event.key === "Escape" || event.key === "-" || event.key === "_") {
       if (motion.current.active) returnToNetwork();
       else if (event.key === "Escape") reset();
       else zoomAt(-0.3);
       event.preventDefault();
     } else if (!motion.current.active && (event.key === "+" || event.key === "=")) {
       if (!motion.current.focus) {
         const front = [...motion.current.points].sort((a,b) => b.z-a.z)[0];
         if (front) aim(front.id);
       }
       zoomAt(0.3);
       event.preventDefault();
     }
   }
   window.addEventListener("keydown", shortcut);
   return () => window.removeEventListener("keydown", shortcut);
 }, []);

 useEffect(() => {
   const surface = panel.current;
   if (!surface || !active) return;
   let initialSpan = 0;
   const span = (e: TouchEvent) => Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
   const start = (e: TouchEvent) => {
     initialSpan = e.touches.length === 2 && !surface.querySelector("dialog[open]") ? span(e) : 0;
   };
   const move = (e: TouchEvent) => {
     if (!initialSpan || e.touches.length !== 2) return;
     const ratio = span(e) / initialSpan;
     if (ratio < 0.97 && e.cancelable) e.preventDefault();
     if (ratio < 0.78) { initialSpan = 0; returnToNetwork(); }
   };
   const wheel = (e: WheelEvent) => {
     const onToolbar = e.target instanceof Element && e.target.closest(".panel-top");
     if (e.deltaY <= 0 || (!onToolbar && !e.ctrlKey) || surface.querySelector("dialog[open]")) return;
     e.preventDefault();
     returnToNetwork();
   };
   surface.addEventListener("touchstart", start, { passive: true });
   surface.addEventListener("touchmove", move, { passive: false });
   surface.addEventListener("wheel", wheel, { passive: false });
   return () => {
     surface.removeEventListener("touchstart", start);
     surface.removeEventListener("touchmove", move);
     surface.removeEventListener("wheel", wheel);
   };
 }, [active]);
 useEffect(()=>{const handler=()=>setActive(initial());window.addEventListener("hashchange",handler);return()=>window.removeEventListener("hashchange",handler)},[]);
 useEffect(()=>{const c=canvas.current,host=stage.current;if(!c||!host)return;const ctx=c.getContext("2d");if(!ctx)return;let raf=0,w=0,h=0,dpr=1;const m=motion.current;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const resize=()=>{w=host.clientWidth;h=host.clientHeight;dpr=Math.min(devicePixelRatio,2);c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};const ro=new ResizeObserver(resize);ro.observe(host);resize();const stopWheel=(e:WheelEvent)=>{e.preventDefault()};host.addEventListener("wheel",stopWheel,{passive:false});
  const render=(t:number)=>{if(!m.drag){if(m.active||m.focus){m.yaw+=(m.targetYaw-m.yaw)*(reduced?1:.075);m.pitch+=(m.targetPitch-m.pitch)*(reduced?1:.075);}else if(!m.paused&&!reduced)m.yaw+=.001;}m.zoom+=(m.targetZoom-m.zoom)*(reduced?1:.075);ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,r=Math.min(w*.29,h*.34)*m.zoom;
   const project=(v:V)=>{const [x,y,z]=v;const a=x*Math.cos(m.yaw)+z*Math.sin(m.yaw),b=z*Math.cos(m.yaw)-x*Math.sin(m.yaw),p=y*Math.cos(m.pitch)-b*Math.sin(m.pitch),q=b*Math.cos(m.pitch)+y*Math.sin(m.pitch);const s=3.8/(3.8-q);return {x:cx+a*r*s,y:cy-p*r*s,z:q,s};};
   const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.65);glow.addColorStop(0,"#123b5c66");glow.addColorStop(.6,"#0b365033");glow.addColorStop(1,"#07152200");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
   const phase=reduced||m.paused?0:t*.00035;
   ctx.save();ctx.translate(cx,cy);ctx.lineWidth=1;[1.18,1.31,1.44].forEach((k,i)=>{ctx.save();ctx.rotate(i===1?.56:-.35);ctx.scale(1,.82);ctx.strokeStyle="#4e9bb534";ctx.beginPath();ctx.arc(0,0,r*k,0,Math.PI*2);ctx.stroke();const start=phase*(i%2?-.7:1)+i*1.8;ctx.strokeStyle=i===1?"#48c5f08a":"#93efffb0";ctx.lineWidth=i===1?2:1.4;ctx.beginPath();ctx.arc(0,0,r*k,start,start+.72);ctx.stroke();ctx.strokeStyle="#8be9ff48";ctx.lineWidth=1;for(let q=0;q<60;q++){const angle=q*Math.PI/30;const inner=r*k-(q%5===0?8:3);ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);ctx.lineTo(Math.cos(angle)*r*k,Math.sin(angle)*r*k);ctx.stroke()}ctx.restore()});ctx.restore();
   const scan=phase% (Math.PI*2);ctx.beginPath();ctx.ellipse(cx,cy,r*1.04,r*.32,scan*.35,0,Math.PI*2);ctx.strokeStyle="#75d8f14a";ctx.stroke();
   const pulse=.5+.5*Math.sin(phase*4);ctx.strokeStyle=`rgba(100,219,250,${.13*(1-pulse)})`;ctx.beginPath();ctx.arc(cx,cy,r*(.67+.46*pulse),0,Math.PI*2);ctx.stroke();
   const p=dots.map(project);for(const e of edges){const a=p[e.i],b=p[e.j];const alpha=.06+.22*(a.z+b.z+2)/4;ctx.strokeStyle=`rgba(73,196,234,${alpha})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();if(e.i%17===0){const f=reduced?.5:(t*.00022+e.i*.071)%1;ctx.fillStyle="#b4f4ff";ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,1.6,0,7);ctx.fill()}}
   for(const a of p){ctx.fillStyle=`rgba(133,222,249,${.15+.65*(a.z+1)/2})`;ctx.beginPath();ctx.arc(a.x,a.y,Math.max(1,a.s*1.5),0,7);ctx.fill()}
   m.points=nodes.map((n,i)=>{const a=project(point(n.lat,n.lon));const el=labels.current[i],selected=n.id===(m.focus||m.active);if(el){el.style.left=`${a.x}px`;el.style.top=`${a.y}px`;el.style.opacity=selected?"1":m.focus?".22":a.z<-.15?".35":"1";el.style.zIndex=String(selected?48:Math.round(20+a.z*10));el.style.setProperty("--node-scale",String(selected?Math.min(2.2,1+(m.zoom-1)*1.1):Math.max(.75,Math.min(1.2,a.s))));}ctx.strokeStyle=selected?"#c9f8ff":"#59c7ec88";ctx.beginPath();ctx.arc(a.x,a.y,selected?19*m.zoom:13,0,7);ctx.stroke();if(selected){ctx.strokeStyle="#92e7ff9a";ctx.setLineDash([4,6]);ctx.lineDashOffset=-phase*22;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(a.x,a.y);ctx.stroke();ctx.setLineDash([]);const radius=22*m.zoom;ctx.strokeStyle="#6de8ffaa";ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,radius,phase*3,phase*3+2.4);ctx.stroke();ctx.lineWidth=1;}return {id:n.id,...a};});
   if(readout.current)readout.current.textContent=`${Math.round(m.zoom*100)}%`;if(meter.current)meter.current.style.transform=`scaleX(${Math.max(0,Math.min(1,(m.zoom-.5)/1.85))})`;
   if(m.focus&&m.targetZoom>=2.05&&m.zoom>=1.97&&!m.active)select(m.focus);
   raf=requestAnimationFrame(render);
  };raf=requestAnimationFrame(render);return()=>{cancelAnimationFrame(raf);ro.disconnect();host.removeEventListener("wheel",stopWheel)};
 },[]);
 return <main className="network-app" data-open={!!active} style={{isolation:"isolate",background:"transparent"}}><GradientBackdrop paused={paused} />
  <header className="network-header"><button className="network-brand" onClick={reset}><span className="brand-icon">HM</span><span>HENOK MOLLA<small>NETWORK / SECURITY</small></span></button><nav aria-label="Portfolio sections"><button className={!active?"selected":""} onClick={reset}>Overview</button>{nodes.map(n=><button key={n.id} className={active===n.id?"selected":""} onClick={()=>select(n.id)}>{n.id==="about"?"About":n.name}</button>)}</nav><a className="header-git" href="https://github.com/Henok-A-M" target="_blank" rel="noreferrer">GitHub</a></header>
  <div className="network-layout"><section className="network-intro profile-console"><div className="eyeline"><i/> PERSONAL NETWORK · ONLINE</div><button className="profile-portrait" onClick={()=>select("about")} aria-label="Open about Henok"><img src={portrait} alt="Henok Molla"/><span className="portrait-corner corner-tl"/><span className="portrait-corner corner-br"/></button><h1>Henok Molla.</h1><p className="profile-role">Aspiring Network &amp; Cybersecurity Engineer</p><p className="profile-location">Seattle · Year Up United<br/>City University of Seattle</p><button className="profile-about" onClick={()=>select("about")}>About me <span>＋</span></button></section>
   <div className="network-stage" ref={stage} style={{userSelect:"none", WebkitUserSelect:"none"}}
     onDragStart={event => event.preventDefault()}
     onClickCapture={event => {
       if (event.detail && motion.current.moved) {
         event.preventDefault();
         event.stopPropagation();
       }
     }}
     onPointerDown={event => {
       if (event.button !== 0) return;
       const m = motion.current;
       m.touches.set(event.pointerId, {x:event.clientX, y:event.clientY});
       m.startX = m.lastX = event.clientX;
       m.startY = m.lastY = event.clientY;
       m.moved = m.touches.size > 1;
       m.drag = true;
       if (m.touches.size === 2) {
         const [a,b] = [...m.touches.values()];
         m.pinch = Math.hypot(a.x-b.x, a.y-b.y);
       }
       if (!(event.target as HTMLElement).closest("button")) event.currentTarget.setPointerCapture(event.pointerId);
     }}
     onPointerMove={event => {
       const m = motion.current;
       if (!m.touches.has(event.pointerId)) return;
       m.touches.set(event.pointerId, {x:event.clientX, y:event.clientY});
       if (m.touches.size === 2) {
         const [a,b] = [...m.touches.values()];
         const distance = Math.hypot(a.x-b.x, a.y-b.y);
         if (m.pinch) zoomAt((distance-m.pinch)*.008, (a.x+b.x)/2, (a.y+b.y)/2);
         m.pinch = distance;
         return;
       }
       if (!m.drag || (!m.moved && Math.hypot(event.clientX-m.startX,event.clientY-m.startY)<5)) return;
       m.moved = true;
       if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
       if (m.focus) { m.focus=""; setFocused(""); }
       m.yaw += (event.clientX-m.lastX)*.007;
       m.pitch = Math.max(-1.3, Math.min(1.3, m.pitch+(event.clientY-m.lastY)*.007));
       m.lastX = event.clientX;
       m.lastY = event.clientY;
     }}
     onPointerUp={e=>{const m=motion.current;m.touches.delete(e.pointerId);m.drag=false;m.pinch=0;}}
     onPointerCancel={e=>{const m=motion.current;m.touches.delete(e.pointerId);m.drag=false;m.pinch=0;}} onWheel={e=>zoomAt(-e.deltaY*.0025,e.clientX,e.clientY,(e.target as HTMLElement).closest<HTMLElement>("[data-node]")?.dataset.node)}>
    <canvas ref={canvas} aria-hidden="true"/><div className="scene-hud" aria-hidden="true"><span>{focused?"TARGET ACQUIRED":"NETWORK EXPLORER"}</span><span>MAGNIFICATION <b ref={readout}>100%</b></span><div className="scene-meter"><div ref={meter}/></div></div><div className="sphere-axis" aria-hidden="true"><span>HM</span><small>NETWORK CORE</small></div>{nodes.map((n,i)=><button ref={el=>{labels.current[i]=el}} className={`sphere-node ${active===n.id?"active":""} ${focused===n.id?"focused":""}`} key={n.id} data-node={n.id} onClick={()=>{aim(n.id);motion.current.targetZoom=2.2;}}><i/><span>{n.name}<small>{n.sub}</small></span></button>)}<div className="sphere-caption"><span>NETWORK CORE / 05 NODES</span></div>
   </div><aside className="network-side"><span className="side-kicker">SYSTEM INDEX</span>{nodes.map((n,i)=><button key={n.id} className={active===n.id?"selected":""} onClick={()=>select(n.id)}><span>0{i+1}</span><div>{n.name}<small>{n.sub}</small></div><b>＋</b></button>)}<div className="network-controls"><button onClick={()=>{const m=motion.current;if(!m.focus){const nearest=[...m.points].sort((a,b)=>b.z-a.z)[0];if(nearest)aim(nearest.id);}zoomAt(.4)}} aria-label="Zoom in">＋</button><button onClick={()=>zoomAt(-.4)} aria-label="Zoom out">−</button><button onClick={()=>setPaused(p=>!p)}>{paused?"Resume":"Pause"}</button><button onClick={reset}>Reset view</button></div></aside>
  </div><div ref={panel} className="network-panel" aria-hidden={!active} inert={!active}><div className="panel-top"><span>HM / {nodes.find(n=>n.id===active)?.name.toUpperCase()}</span><button onClick={returnToNetwork}>− Zoom out to network</button></div><div className="legacy-content network-content" data-section={active} ref={content} dangerouslySetInnerHTML={portfolioMarkup}/></div>
  <footer className="network-footer"><span>HENOK MOLLA © 2026</span><span>BUILT TO LEARN. DESIGNED TO CONNECT.</span><button onClick={()=>select("contact")}>LET'S CONNECT</button></footer>
 </main>
}
