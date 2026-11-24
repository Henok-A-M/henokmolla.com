
import { useEffect,useLayoutEffect,useRef,useState } from "react";
import gsap from "gsap";
import Nav from "./Nav";
import LogCanvas from "./LogCanvas";
import { loadImages } from "../lib/loadImages";
import type { LogPair } from "../lib/loadImages";
import styles from "./Hero.module.css";
export type HeroMotion={zoom:number;pixel:number};
const PIXEL_START=6,ZOOM_START=2.6,LOAD_TIMEOUT=11000;
function Characters({text}:{text:string}){
 return <>{Array.from(text).map((c,i)=><span key={i} data-character="true" className={styles.character}>{c===" "?"\u00a0":c}</span>)}</>;
}
export default function Hero(){
 const root=useRef<HTMLElement>(null),counter=useRef<HTMLElement>(null);
 const motion=useRef<HeroMotion>({zoom:ZOOM_START,pixel:PIXEL_START});
 const [images,setImages]=useState<LogPair|null>(null);
 const [ready,setReady]=useState(false);
 const currentProgress=useRef({n:0});
 useEffect(()=>{
  const ac=new AbortController();let active=true,owned:LogPair|null=null;
  const value=currentProgress.current;
  const write=()=>{if(counter.current)counter.current.textContent=String(Math.min(100,Math.max(0,Math.round(value.n)))).padStart(2,"0");};
  const quick=gsap.quickTo(value,"n",{duration:.4,ease:"power1.out",onUpdate:write});
  let hasFinished=false;
  const timeout=window.setTimeout(()=>{
   if(hasFinished)return;ac.abort();quick.tween.kill();
   if(active){hasFinished=true;setReady(true);}
  },LOAD_TIMEOUT);
  const fonts=Promise.allSettled([
   document.fonts.load('italic 400 1em "Instrument Serif"'),
   document.fonts.load('400 1em "Instrument Sans"'),
   document.fonts.load('500 1em "Instrument Sans"')
  ]);
  const artwork=loadImages(ac.signal,part=>{
   if(active&&!hasFinished)quick(Math.max(value.n,Math.min(90,part*90)));
  });
  void Promise.allSettled([artwork,fonts]).then(results=>{
   if(!active)return;
   if(results[0].status==="fulfilled"){owned=results[0].value;}
   if(hasFinished){owned?.dispose();owned=null;return;}
   hasFinished=true;clearTimeout(timeout);quick.tween.kill();
   if(owned)setImages(owned);
   setReady(true);
  });
  return ()=>{
   active=false;ac.abort();clearTimeout(timeout);quick.tween.kill();owned?.dispose();
  };
 },[]);
 useLayoutEffect(()=>{
  if(!ready||!root.current)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el=root.current;
  const ctx=gsap.context(()=>{
   const nav=el.querySelector<HTMLElement>('[data-reveal="nav"]');
   const lead=el.querySelector<HTMLElement>('[data-reveal="lead"]');
   const bottom=el.querySelector<HTMLElement>('[data-reveal="bottom"]');
   const action=el.querySelector<HTMLElement>('[data-reveal="action"]');
   const cta=el.querySelector<HTMLElement>('[data-reveal="cta"]');
   const headline=el.querySelector<HTMLElement>('[data-reveal="headline"]');
   const counterWrap=el.querySelector<HTMLElement>('[data-counter-wrap="true"]');
   const line1=Array.from(el.querySelectorAll<HTMLElement>('[data-line="first"] [data-character]'));
   const line2=Array.from(el.querySelectorAll<HTMLElement>('[data-line="second"] [data-character]'));
   const elements=[nav,lead,bottom,action,cta,headline].filter((x):x is HTMLElement=>!!x);
   if(reduced){
    motion.current.zoom=1;motion.current.pixel=0;
    gsap.to(elements,{opacity:1,duration:.4,ease:"power1.out"});
    gsap.set([...line1,...line2],{opacity:1});
    if(counterWrap)gsap.set(counterWrap,{autoAlpha:0});
    return;
   }
   const tl=gsap.timeline();
   tl.to(currentProgress.current,{n:100,duration:.8,ease:"power1.out",onUpdate:()=>{
    if(counter.current)counter.current.textContent=String(Math.min(100,Math.round(currentProgress.current.n))).padStart(2,"0");
   }},0);
   tl.to(motion.current,{zoom:1,duration:.9,ease:"expo.out"},0);
   tl.to(motion.current,{pixel:0,duration:1,ease:"none"},0);
   if(counterWrap)tl.to(counterWrap,{opacity:0,duration:.4,ease:"power1.in"},.85);
   if(nav)tl.fromTo(nav,{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0px)",duration:.5,ease:"power2.out",clearProps:"filter"},1);
   if(headline)tl.set(headline,{opacity:1},1.3);
   for(const letters of [line1,line2]){
    tl.fromTo(letters,{opacity:0,filter:"blur(18px)",xPercent:-30},{
     opacity:1,filter:"blur(0px)",xPercent:0,duration:.8,stagger:.035,ease:"power2.out",clearProps:"filter,transform"
    },1.3);
   }
   const reveal=(target:HTMLElement|null,at:number)=>{
    if(target)tl.fromTo(target,{opacity:0,filter:"blur(10px)"},{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},at);
   };
   reveal(lead,2.1);reveal(bottom,2.5);reveal(action,2.7);reveal(cta,2.85);
  },el);
  return ()=>ctx.revert();
 },[ready]);
 return <main className={styles.hero} ref={root} id="home" aria-label="Easylog interactive landing page">
  <LogCanvas state={motion} images={images} host={root}/>
  <Nav/>
  <div className={styles.top}>
   <h1 className={styles.headline} aria-label="Every layer tells a story." data-reveal="headline">
    <span className={styles.serif} data-line="first" aria-hidden="true"><Characters text="Every layer"/></span>
    <span className={styles.sans} data-line="second" aria-hidden="true"><Characters text="tells a story."/></span>
   </h1>
   <p className={styles.lead} data-reveal="lead">Turn forgotten records, scattered logs, and silent activity into something readable.</p>
  </div>
  <div className={styles.action}>
   <p data-reveal="action">EASYLOG transforms historical data into structured decisions — without losing the story behind it.</p>
   <a href="#projects" className={styles.cta} data-reveal="cta">Start uncovering</a>
  </div>
  <div className={styles.bottom} data-reveal="bottom">
   <a className={styles.scroll} href="#about"><span className={styles.arrow} aria-hidden="true">↓</span><span>Scroll down for more</span></a>
   <span>20–26</span>
  </div>
  <p className={styles.counter} data-counter-wrap="true" aria-label="Loading percentage"><span ref={counter}>00</span><span className={styles.percent}>%</span></p>
  <div className={styles.probe} data-unit-probe="true" aria-hidden="true"/>
 </main>;
}
