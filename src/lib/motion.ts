
import { ENTER_RISE, EXIT_LIFT } from "../config";
export function clamp(v:number,min=0,max=1){return Math.max(min,Math.min(max,v));}
export function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
export function damp(a:number,b:number,f:number,dt:number){return lerp(a,b,1-Math.pow(1-f,clamp(dt,0,100)/16.67));}
export function smoothstep(v:number){return v*v*(3-2*v);}
export function invLerp(a:number,b:number,v:number){return clamp((v-a)/(b-a||1));}
export type Timing={enter?:readonly [number,number],exit?:readonly [number,number]};
export function stateStyle(progress:number,t:Timing){
  let opacity=1,y=0;
  if(t.enter&&progress<t.enter[1]){const p=smoothstep(invLerp(t.enter[0],t.enter[1],progress));opacity=p;y=lerp(ENTER_RISE,0,p);}
  else if(t.exit&&progress>t.exit[0]){const p=smoothstep(invLerp(t.exit[0],t.exit[1],progress));opacity=1-p;y=lerp(0,EXIT_LIFT,p);}
  return {opacity,y,visible:opacity>.002};
}
export function applyStory(el:HTMLElement|null,p:number,t:Timing,unit:number){
  if(!el)return;const s=stateStyle(p,t);
  el.style.opacity=String(s.opacity);el.style.transform=`translate3d(0,${s.y*unit}px,0)`;
  el.style.visibility=s.visible?"visible":"hidden";el.style.pointerEvents=s.visible?"auto":"none";
}
