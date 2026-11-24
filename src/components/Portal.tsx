
import { useEffect,useRef } from "react";
import { quadToMatrix3d,lerpQuad,rectQuad,scaleQuad,segment } from "../lib/quad";
import type { Quad } from "../lib/quad";
import { DESERT } from "../lib/loadImages";
import styles from "./Portal.module.css";
export type PortalState={scale:number;face:number;flash:number;p:number};
const CARD_CORNERS:readonly [number,number][]=[[1738,944],[2359,994],[2359,1984],[1738,2052]];
const inOut=(t:number)=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
export default function Portal({state,photo}:{state:React.RefObject<PortalState>;photo:string|null}){
 const media=useRef<HTMLDivElement>(null),over=useRef<HTMLDivElement>(null),photoBox=useRef<HTMLDivElement>(null);
 const light=useRef<HTMLDivElement>(null),plane=useRef<HTMLDivElement>(null),lightFace=useRef<HTMLDivElement>(null),rim=useRef<HTMLDivElement>(null),fill=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let raf=0,lastSig="",alive=true;
  const draw=()=>{
   if(!alive)return;
   const m=media.current,o=over.current,box=photoBox.current,l=light.current,portal=plane.current,s=state.current;
   if(m&&o&&box&&l&&portal&&s){
    const W=m.clientWidth,H=m.clientHeight,bx=box.offsetLeft,by=box.offsetTop,bw=box.offsetWidth,bh=box.offsetHeight;
    const sig=[W,H,bx,by,bw,bh,s.scale,s.p,s.face,s.flash].join(":");
    if(sig!==lastSig&&W&&H&&bw&&bh){
     lastSig=sig;m.style.transform=o.style.transform=`scale(${s.scale})`;
     const base=CARD_CORNERS.map(([x,y])=>({x:bx+(x/4096)*bw,y:by+(y/2640)*bh})) as Quad;
     const c={x:base.reduce((sum,v)=>sum+v.x,0)/4,y:base.reduce((sum,v)=>sum+v.y,0)/4};
     const d=1+.18*inOut(segment(s.p,0,.7));
     box.style.transformOrigin=`${c.x-bx}px ${c.y-by}px`;box.style.transform=`scale(${d})`;
     const inPhoto=scaleQuad(base,c,d);
     const height=((inPhoto[3].y-inPhoto[0].y+inPhoto[2].y-inPhoto[1].y)/2)*1.06;
     const turned=lerpQuad(inPhoto,rectQuad(c.x,c.y,height*652/1024,height),inOut(segment(s.p,0,.45)));
     const coverH=Math.max(H,W*1024/652)*1.2;
     const cover=rectQuad(W/2,H/2,coverH*652/1024,coverH);
     const quad=lerpQuad(turned,cover,segment(s.p,.5,.82)**3);
     const matrix=quadToMatrix3d(652,1024,quad);
     l.style.transform=portal.style.transform=matrix;
     if(lightFace.current)lightFace.current.style.opacity=String(s.face*(1-segment(s.p,.15,.4)));
     if(rim.current)rim.current.style.opacity=String(Math.max(s.flash,segment(s.p,.1,.4)));
     if(fill.current)fill.current.style.opacity=String(segment(s.p,.35,.62));
    }
   }
   raf=requestAnimationFrame(draw);
  };
  const observer=new ResizeObserver(()=>{lastSig="";});
  if(media.current)observer.observe(media.current);if(photoBox.current)observer.observe(photoBox.current);
  raf=requestAnimationFrame(draw);
  return ()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();};
 },[state]);
 return <>
  <div ref={media} className={styles.media} data-portal-media="true">
   <div ref={photoBox} className={styles.photoBox}>
    <img src={photo||DESERT} className={styles.photo} alt="Golden desert landscape with an illuminated translucent card-like doorway" draggable={false}/>
   </div>
   <div ref={light} className={styles.lightPlane} aria-hidden="true">
    <div ref={lightFace} className={styles.lightFace}>
     <div className={styles.cardLandscape}>
      <div className={styles.cardOutline}/>
      <img className={styles.cardLogo} src="https://assets.uberdesigner.ai/portale/card-logo.svg" alt=""/>
      <img className={styles.chip} src="https://assets.uberdesigner.ai/portale/card-chip.svg" alt=""/>
      <div className={styles.cardName}>HENOK MOLLA</div>
      <div className={styles.cardNumber}>NETWORK SECURITY</div>
     </div>
    </div>
   </div>
  </div>
  <div ref={over} className={styles.over} aria-hidden="true" data-portal-over="true">
   <div ref={plane} className={styles.portalPlane}>
    <div ref={fill} className={styles.portalFill}/>
    <div ref={rim} className={styles.portalRim}/>
   </div>
  </div>
 </>;
}
