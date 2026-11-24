
import { useEffect,useRef } from "react";
import styles from "./Cursor.module.css";
export default function Cursor(){
 const cursor=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!matchMedia("(hover: hover) and (pointer: fine)").matches)return;
  const el=cursor.current;if(!el)return;
  document.documentElement.dataset.easylogCursor="true";
  let alive=true,raf=0,last=performance.now();
  let x=innerWidth/2,y=innerHeight/2,targetX=x,targetY=y;
  const move=(e:PointerEvent)=>{targetX=e.clientX;targetY=e.clientY;el.style.opacity="1";};
  const leave=(e:MouseEvent)=>{if(!e.relatedTarget)el.style.opacity="0";};
  const tick=(now:number)=>{
   if(!alive)return;const dt=Math.max(0,Math.min(100,now-last));last=now;
   const k=1-Math.pow(.7,dt/16.67);x+=(targetX-x)*k;y+=(targetY-y)*k;
   el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;raf=requestAnimationFrame(tick);
  };
  document.addEventListener("pointermove",move,{passive:true});
  document.addEventListener("mouseout",leave);
  raf=requestAnimationFrame(tick);
  return ()=>{alive=false;cancelAnimationFrame(raf);document.removeEventListener("pointermove",move);document.removeEventListener("mouseout",leave);delete document.documentElement.dataset.easylogCursor;};
 },[]);
 return <div ref={cursor} className={styles.cursor} aria-hidden="true"/>;
}
