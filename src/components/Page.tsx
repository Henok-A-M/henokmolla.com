
import { useEffect,useLayoutEffect,useRef,useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Portal from "./Portal";
import type { PortalState } from "./Portal";
import HeroCopy from "./HeroCopy";
import Ready from "./Ready";
import Nav from "./Nav";
import Preloader from "./Preloader";
import PortfolioSections from "./PortfolioSections";
import { loadPhotos } from "../lib/loadImages";
import type { LoadedPhotos } from "../lib/loadImages";
import { segment } from "../lib/quad";
import styles from "./Page.module.css";
gsap.registerPlugin(ScrollTrigger);
const INTRO_END=2.3, SCROLL_DISTANCE=1.5, DARK_THEME_AT=.76, READY_START=.8, READY_REVERSE=.74;
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
export default function Page(){
 const wrapper=useRef<HTMLDivElement>(null),stage=useRef<HTMLElement>(null),preloader=useRef<HTMLDivElement>(null);
 const portal=useRef<PortalState>({scale:0,face:0,flash:0,p:0});
 const [photos,setPhotos]=useState<LoadedPhotos>({desert:null,card:null});
 const [loaded,setLoaded]=useState(false);
 const [theme,setTheme]=useState<"light"|"dark">("light");
 const progress=useRef(0);
 useEffect(()=>{
  let alive=true;const ac=new AbortController();let finished:LoadedPhotos|null=null;
  const oldRestore=history.scrollRestoration;history.scrollRestoration="manual";
  document.documentElement.dataset.loading="true";
  const counter=preloader.current?.querySelector<HTMLElement>("[data-counter]");
  const counterAnim={n:0};
  const write=()=>{if(counter)counter.textContent=String(Math.min(100,Math.floor(counterAnim.n))).padStart(2,"0");};
  const quick=gsap.quickTo(counterAnim,"n",{duration:.4,ease:"power1.out",onUpdate:write});
  let settled=false;
  const timeout=window.setTimeout(()=>{if(!settled)ac.abort();},9500);
  const fonts=Promise.allSettled([
    document.fonts.load('300 1em "Geist"'),document.fonts.load('400 1em "Geist"'),document.fonts.load('500 1em "Geist"')
  ]);
  const images=loadPhotos(ac.signal,f=>{if(alive){progress.current=Math.max(progress.current,f*.9);quick(progress.current*100);}});
  void Promise.allSettled([images,fonts]).then(async results=>{
    if(!alive)return;
    settled=true;clearTimeout(timeout);
    if(results[0].status==="fulfilled"){finished=results[0].value;setPhotos(finished);}
    quick(90);
    setLoaded(true);
  });
  return ()=>{alive=false;ac.abort();clearTimeout(timeout);quick.tween.kill();finished?.desert?.revoke();finished?.card?.revoke();history.scrollRestoration=oldRestore;delete document.documentElement.dataset.loading;};
 },[]);
 useLayoutEffect(()=>{
  if(!loaded||!stage.current||!wrapper.current)return;
  const st=stage.current,wrap=wrapper.current,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alive=true,lastTheme:"light"|"dark"="light";
  const oldRestore=history.scrollRestoration;
  const hero=st.querySelector<HTMLElement>("[data-hero]");
  const media=st.querySelector<HTMLElement>("[data-portal-media]");
  const over=st.querySelector<HTMLElement>("[data-portal-over]");
  const ready=st.querySelector<HTMLElement>("[data-ready-screen]");
  const nav=document.querySelector<HTMLElement>("[data-nav]");
  const badge=st.querySelector<HTMLElement>('[data-intro="badge"]');
  const headline=st.querySelector<HTMLElement>('[data-intro="headline"]');
  const words=Array.from(st.querySelectorAll<HTMLElement>('[data-intro="headline"] [data-word]'));
  const buttons=st.querySelector<HTMLElement>('[data-intro="buttons"]');
  const lead=st.querySelector<HTMLElement>('[data-intro="lead"]');
  const loader=preloader.current;
  const counter=loader?.querySelector<HTMLElement>("[data-counter]");
  const wordmark=loader?.querySelector<HTMLElement>("[data-preloader-wordmark]");
  const counterObj={n:90};
  const updateCounter=()=>{if(counter)counter.textContent=String(Math.min(100,Math.floor(counterObj.n))).padStart(2,"0");};
  const stageCopy=hero;
  const prev=document.documentElement.dataset.loading;
  const restoreLink=()=>{const hash=window.location.hash;if(hash&&hash!=="#home"){const el=document.getElementById(decodeURIComponent(hash.slice(1)));el?.scrollIntoView({behavior:"auto",block:"start"});}};
  const ctx=gsap.context(()=>{
    ScrollTrigger.config({ignoreMobileResize:true});
    const state=portal.current;
    const readyCard=st.querySelector<HTMLElement>('[data-ready="card"]');
    const readyFloat=st.querySelector<HTMLElement>('[data-ready="card-float"]');
    const readyImage=st.querySelector<HTMLElement>('[data-ready="card-image"]');
    const readyTextGroup=st.querySelectorAll<HTMLElement>('[data-ready="wordmark"],[data-ready="more"],[data-ready="copy"],[data-ready="action"],[data-ready="scroll"]');
    const reveal=gsap.timeline({paused:true});
    if(readyCard)reveal.to(readyCard,{opacity:1,duration:.5,ease:"power1.out"},0);
    if(readyFloat)reveal.fromTo(readyFloat,{rotationY:-70,rotation:18,scale:.75,filter:"blur(16px) brightness(1.6)"},{rotationY:0,rotation:0,scale:1,filter:"blur(0px) brightness(1)",duration:1.4,ease:"power3.out",clearProps:"filter"},0);
    const top=st.querySelectorAll<HTMLElement>('[data-ready="text"]')[0];
    const bottom=st.querySelectorAll<HTMLElement>('[data-ready="text"]')[1];
    if(top)reveal.to(top.querySelectorAll<HTMLElement>("[data-word]"),{opacity:1,filter:"blur(0px)",yPercent:0,duration:.7,stagger:.09,ease:"power2.out",clearProps:"filter,transform"},.15);
    if(bottom)reveal.to(bottom.querySelectorAll<HTMLElement>("[data-word]"),{opacity:1,filter:"blur(0px)",yPercent:0,duration:.7,stagger:.09,ease:"power2.out",clearProps:"filter,transform"},.3);
    const starts=[.4,.55,.65,.75,.9];
    readyTextGroup.forEach((el,i)=>reveal.to(el,{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},starts[i]??.9));
    if(readyImage&&!reduced){
      gsap.fromTo(readyImage,{yPercent:.75,rotation:-.75},{yPercent:-.75,rotation:.75,duration:3.2,ease:"sine.inOut",yoyo:true,repeat:-1});
      const toY=gsap.quickTo(readyImage,"rotationY",{duration:.8,ease:"power2.out"});
      const toX=gsap.quickTo(readyImage,"rotationX",{duration:.8,ease:"power2.out"});
      const pointer=(e:PointerEvent)=>{toY((e.clientX/innerWidth-.5)*16);toX(-(e.clientY/innerHeight-.5)*12);};
      window.addEventListener("pointermove",pointer,{passive:true});
      // GSAP context collects the unsubscribe function.
      ctx.add("cleanupPointer",()=>window.removeEventListener("pointermove",pointer));
    }
    let lastShow=false;
    const scrub={p:0};
    gsap.to(scrub,{p:1,ease:"none",scrollTrigger:{trigger:st,start:"top top",end:()=>"+="+innerHeight*SCROLL_DISTANCE,pin:true,scrub:reduced?true:.6,invalidateOnRefresh:true},onUpdate:()=>{
      if(!alive)return;
      const p=clamp(scrub.p);state.p=reduced?0:p;
      if(reduced){state.scale=1;state.face=1;state.flash=0;}
      if(stageCopy&&!reduced)stageCopy.style.transform=`translate3d(0,calc(-120 * ${segment(p,.2,.8)} * var(--u)),0)`;
      if(ready){
        const v=reduced?segment(p,.3,.6):segment(p,.79,.81);
        ready.style.opacity=String(v);ready.style.visibility=v>0?"visible":"hidden";
        ready.style.pointerEvents=v>.99?"auto":"none";
      }
      const dark=reduced?p>=.55:p>=DARK_THEME_AT;
      const next=dark?"dark":"light";
      if(lastTheme!==next){lastTheme=next;setTheme(next);}
      const show=reduced?p>=.6:p>=READY_START;
      const reverse=reduced?p<.3:p<READY_REVERSE;
      if(show&&!lastShow){lastShow=true;reveal.play();}
      if(reverse&&lastShow){lastShow=false;reveal.reverse(reduced?2:undefined);}
    }});
    if(reduced){
      gsap.set([media,over],{scale:1});
      state.scale=1;state.face=1;
      const all=[nav,badge,headline,buttons,lead,...words].filter(Boolean);
      gsap.to(all,{opacity:1,filter:"none",yPercent:0,duration:.4,ease:"power1.out"});
      gsap.to(loader,{opacity:0,visibility:"hidden",duration:.4,ease:"power1.out",onComplete:()=>{
        if(!alive)return;delete document.documentElement.dataset.loading;window.setTimeout(()=>{ScrollTrigger.refresh();restoreLink();},30);
      }});
      return;
    }
    const intro=gsap.timeline({onComplete:()=>{
      if(!alive)return;
      delete document.documentElement.dataset.loading;
      ScrollTrigger.refresh();
      window.setTimeout(restoreLink,80);
    }});
    intro.to(counterObj,{n:100,duration:.5,ease:"power1.out",onUpdate:updateCounter},0);
    if(counter)intro.to(counter,{opacity:0,duration:.15,ease:"power1.in"},.5);
    intro.to(state,{scale:1,duration:.85,ease:"power2.out"},.6);
    if(wordmark)intro.to(wordmark,{opacity:0,duration:.4,ease:"power1.out"},.7);
    intro.to(state,{keyframes:{face:[0,.8,.15,1,.55,1]},duration:.45,ease:"none"},1.05);
    intro.to(state,{keyframes:{flash:[0,1,0]},duration:.7,ease:"power1.out"},1.05);
    if(badge)intro.to(badge,{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},1.1);
    if(nav)intro.fromTo(nav,{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},1.15);
    if(headline)intro.set(headline,{opacity:1},1.25);
    intro.to(words,{opacity:1,filter:"blur(0px)",yPercent:0,duration:.7,ease:"power2.out",stagger:.09,clearProps:"filter,transform"},1.25);
    if(buttons)intro.to(buttons,{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},1.55);
    if(lead)intro.to(lead,{opacity:1,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"filter"},1.85);
    if(loader)intro.set(loader,{autoAlpha:0},1.5);
    intro.to({}, {duration:0},INTRO_END);
  },wrap);
  const suppress=(e:MouseEvent)=>{const target=e.target instanceof Element?e.target.closest('a[href="#"]'):null;if(target)e.preventDefault();};
  document.addEventListener("click",suppress);
  return ()=>{alive=false;document.removeEventListener("click",suppress);ctx.revert();history.scrollRestoration=oldRestore;if(prev===undefined)delete document.documentElement.dataset.loading;else document.documentElement.dataset.loading=prev;};
 },[loaded]);
 return <>
  <Nav theme={theme}/>
  <div ref={wrapper} className={styles.wrapper}>
   <main ref={stage} className={styles.stage} id="home">
    <Preloader ref={preloader}/>
    <Portal state={portal} photo={photos.desert?.url||null}/>
    <HeroCopy/>
    <Ready photo={photos.card?.url||null}/>
   </main>
  </div>
  <PortfolioSections/>
 </>;
}
