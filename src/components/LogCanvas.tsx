
import { useEffect,useRef } from "react";
import type { RefObject } from "react";
import type { HeroMotion } from "./Hero";
import type { LogPair } from "../lib/loadImages";
import styles from "./LogCanvas.module.css";
const BRUSH_RADIUS=240;
const STAMP_DISTANCE=.12;
const STAMP_MOVING=.5;
const STAMP_RESTING=.25;
const FADE_SECONDS=1.1;
const REST_INTERVAL_MS=50;
const MAX_DPR=2;
type Stamp={x:number;y:number;strength:number;born:number};
type Props={state:RefObject<HeroMotion>;images:LogPair|null;host:RefObject<HTMLElement|null>};
export default function LogCanvas({state,images,host}:Props){
 const canvasRef=useRef<HTMLCanvasElement>(null),clipRef=useRef<HTMLDivElement>(null),imageRef=useRef<HTMLDivElement>(null),probeRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const canvas=canvasRef.current,hero=host.current,clip=clipRef.current,imgBox=imageRef.current,probe=probeRef.current;
  if(!canvas||!hero||!clip||!imgBox||!probe)return;
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx)return;
  let alive=true,raf=0,width=0,height=0,dpr=1,unit=1,dirty=true;
  let clipRect={x:0,y:0,w:0,h:0},imgRect={x:0,y:0,w:0,h:0};
  let sprite:HTMLCanvasElement|null=null,maskRadius=0;
  let stamps:Stamp[]=[],activePointer=false,lastMouseX=0,lastMouseY=0,lastMove=0,lastRest=0,carry=0;
  let lastFrameSignature="",lastActive=false;
  const touch=matchMedia("(hover: none)").matches;
  const scene=document.createElement("canvas");
  const layer=document.createElement("canvas");
  const mask=document.createElement("canvas");
  const low=document.createElement("canvas");
  const sceneCtx=scene.getContext("2d"),layerCtx=layer.getContext("2d"),maskCtx=mask.getContext("2d"),lowCtx=low.getContext("2d");
  if(!sceneCtx||!layerCtx||!maskCtx||!lowCtx)return;
  const makeSprite=()=>{
   maskRadius=Math.max(1,Math.round(BRUSH_RADIUS*unit*.5));
   const size=maskRadius*2;
   sprite=document.createElement("canvas");sprite.width=sprite.height=size;
   const c=sprite.getContext("2d");if(!c)return;
   const gradient=c.createRadialGradient(maskRadius,maskRadius,0,maskRadius,maskRadius,maskRadius);
   gradient.addColorStop(0,"rgba(0,0,0,1)");
   gradient.addColorStop(.45,"rgba(0,0,0,.85)");
   gradient.addColorStop(1,"rgba(0,0,0,0)");
   c.fillStyle=gradient;c.fillRect(0,0,size,size);
  };
  const measure=()=>{
   const hr=hero.getBoundingClientRect(),cr=clip.getBoundingClientRect(),ir=imgBox.getBoundingClientRect();
   width=hr.width;height=hr.height;
   if(width<1||height<1)return;
   unit=probe.getBoundingClientRect().width/100;
   dpr=Math.min(window.devicePixelRatio||1,MAX_DPR);
   const pw=Math.max(1,Math.round(width*dpr)),ph=Math.max(1,Math.round(height*dpr));
   for(const surface of [canvas,scene,layer]){if(surface.width!==pw||surface.height!==ph){surface.width=pw;surface.height=ph;}}
   const mw=Math.max(1,Math.ceil(width*.5)),mh=Math.max(1,Math.ceil(height*.5));
   if(mask.width!==mw||mask.height!==mh){mask.width=mw;mask.height=mh;}
   clipRect={x:cr.left-hr.left,y:cr.top-hr.top,w:cr.width,h:cr.height};
   imgRect={x:ir.left-hr.left,y:ir.top-hr.top,w:ir.width,h:ir.height};
   makeSprite();dirty=true;
  };
  const observer=new ResizeObserver(measure);observer.observe(hero);
  window.addEventListener("resize",measure,{passive:true});
  measure();
  const addStamp=(x:number,y:number,strength:number,at:number)=>{
   stamps.push({x,y,strength,born:at/1000});
   if(stamps.length>1400)stamps=stamps.slice(-1200);
  };
  const pointer=(e:PointerEvent)=>{
   if(touch||e.pointerType==="touch")return;
   const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
   const now=performance.now();
   if(x<0||y<0||x>r.width||y>r.height){activePointer=false;return;}
   if(!activePointer){activePointer=true;carry=0;addStamp(x,y,STAMP_MOVING,now);}
   else{
    const radius=Math.max(2,BRUSH_RADIUS*unit),step=Math.max(1,radius*STAMP_DISTANCE);
    const dx=x-lastMouseX,dy=y-lastMouseY,dist=Math.hypot(dx,dy);
    if(dist>0){
     for(let at=step-carry;at<=dist;at+=step)addStamp(lastMouseX+dx*at/dist,lastMouseY+dy*at/dist,STAMP_MOVING,now);
     carry=(carry+dist)%step;
    }
   }
   lastMouseX=x;lastMouseY=y;lastMove=now;lastRest=now;
  };
  const leave=(e:MouseEvent)=>{if(!e.relatedTarget){activePointer=false;carry=0;}};
  window.addEventListener("pointermove",pointer,{passive:true});
  document.addEventListener("mouseout",leave);
  const drawImage=(c:CanvasRenderingContext2D,bitmap:ImageBitmap,zoom:number)=>{
   const {x,y,w,h}=imgRect;
   c.save();c.beginPath();c.rect(clipRect.x,clipRect.y,clipRect.w,clipRect.h);c.clip();
   c.drawImage(bitmap,x-(w*(zoom-1))/2,y-(h*(zoom-1))/2,w*zoom,h*zoom);
   c.restore();
  };
  const render=(now:number)=>{
   if(!alive)return;
   raf=requestAnimationFrame(render);
   if(!images||width<1||height<1)return;
   if(!touch&&activePointer&&now-lastMove>=REST_INTERVAL_MS&&now-lastRest>=REST_INTERVAL_MS){
    addStamp(lastMouseX,lastMouseY,STAMP_RESTING,now);lastRest=now;
   }
   const seconds=now/1000;
   stamps=stamps.filter(s=>s.strength*Math.exp(-Math.max(0,seconds-s.born)/FADE_SECONDS)>=.004);
   const motion=state.current;
   const zoom=motion.zoom,block=Math.pow(2,motion.pixel);
   const signature=[width,height,dpr,zoom.toFixed(4),block.toFixed(4),imgRect.x,imgRect.y,imgRect.w,imgRect.h].join(":");
   if(!dirty&&!stamps.length&&!lastActive&&signature===lastFrameSignature)return;
   dirty=false;lastFrameSignature=signature;lastActive=stamps.length>0;
   sceneCtx.setTransform(dpr,0,0,dpr,0,0);sceneCtx.clearRect(0,0,width,height);
   drawImage(sceneCtx,images.bare,zoom);
   layerCtx.setTransform(dpr,0,0,dpr,0,0);layerCtx.clearRect(0,0,width,height);
   drawImage(layerCtx,images.moss,zoom);
   if(!touch){
    maskCtx.setTransform(1,0,0,1,0,0);maskCtx.clearRect(0,0,mask.width,mask.height);
    if(sprite){
     for(const stamp of stamps){
      maskCtx.globalAlpha=stamp.strength*Math.exp(-Math.max(0,seconds-stamp.born)/FADE_SECONDS);
      maskCtx.drawImage(sprite,stamp.x*.5-maskRadius,stamp.y*.5-maskRadius);
     }
     maskCtx.globalAlpha=1;
    }
    layerCtx.globalCompositeOperation="destination-in";
    layerCtx.drawImage(mask,0,0,width,height);
    layerCtx.globalCompositeOperation="source-over";
   }
   sceneCtx.drawImage(layer,0,0,width,height);
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
   if(block>1.08){
    const lw=Math.max(1,Math.ceil(width/block)),lh=Math.max(1,Math.ceil(height/block));
    if(low.width!==lw||low.height!==lh){low.width=lw;low.height=lh;}
    lowCtx.setTransform(1,0,0,1,0,0);lowCtx.clearRect(0,0,lw,lh);
    lowCtx.imageSmoothingEnabled=true;lowCtx.drawImage(scene,0,0,lw,lh);
    ctx.imageSmoothingEnabled=false;ctx.drawImage(low,0,0,canvas.width,canvas.height);
   }else{
    ctx.imageSmoothingEnabled=true;ctx.drawImage(scene,0,0,canvas.width,canvas.height);
   }
  };
  raf=requestAnimationFrame(render);
  return ()=>{
   alive=false;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener("resize",measure);
   window.removeEventListener("pointermove",pointer);document.removeEventListener("mouseout",leave);
  };
 },[images,state,host]);
 return <>
  <canvas className={styles.canvas} ref={canvasRef} role="img" aria-label="A sculptural wooden log; moving the pointer reveals moss that fades behind it"/>
  <div ref={clipRef} className={styles.clip} aria-hidden="true"><div ref={imageRef} className={styles.image}/></div>
  <div ref={probeRef} className={styles.probe} aria-hidden="true"/>
 </>;
}
