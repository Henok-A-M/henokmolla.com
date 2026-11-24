
import { useEffect,useRef } from "react";
import styles from "./Cursor.module.css";
export default function Cursor(){
 const element=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!matchMedia("(hover: hover) and (pointer: fine)").matches)return;
  const node=element.current;if(!node)return;
  let alive=true,raf=0,last=performance.now(),x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  document.documentElement.dataset.portaleCursor="true";
  const move=(e:PointerEvent)=>{tx=e.clientX;ty=e.clientY;node.style.opacity="1";};
  const out=(e:MouseEvent)=>{if(!e.relatedTarget)node.style.opacity="0";};
  document.addEventListener("pointermove",move,{passive:true});
  document.addEventListener("mouseout",out);
  const tick=(now:number)=>{if(!alive)return;const k=1-Math.pow(.7,Math.max(0,Math.min(100,now-last))/16.67);last=now;
   x+=(tx-x)*k;y+=(ty-y)*k;node.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;raf=requestAnimationFrame(tick);
  };raf=requestAnimationFrame(tick);
  return ()=>{alive=false;cancelAnimationFrame(raf);document.removeEventListener("pointermove",move);document.removeEventListener("mouseout",out);delete document.documentElement.dataset.portaleCursor;};
 },[]);
 return <div className={styles.cursor} ref={element} aria-hidden="true"/>;
}
