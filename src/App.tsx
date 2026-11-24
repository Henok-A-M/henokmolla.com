
import { useEffect,useRef,useState } from "react";
import styles from "./App.module.css";
import { FRAME_COUNT,SCROLL_SMOOTHING,POINTER_SMOOTHING,CURSOR_SMOOTHING,TIMING,MIN_LOADER_MS,LOADER_TIMEOUT_MS,BURN_MS,INTRO_AT_MS } from "./config";
import { clamp,damp,invLerp,applyStory } from "./lib/motion";
import { Sequence } from "./lib/sequence";
import { DepthRenderer } from "./lib/depthRenderer";
import { BurnRenderer } from "./lib/burnRenderer";
import { redrawGlass } from "./lib/glassBlur";
import Header from "./components/Header";
import CopyState from "./components/CopyState";
import GlassCards from "./components/GlassCards";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import PortfolioSections from "./components/PortfolioSections";
type Phase="loading"|"burning"|"ready"|"done";
export default function App(){
  const storyRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null);
  const caveHost=useRef<HTMLDivElement>(null),burnHost=useRef<HTMLDivElement>(null),probe=useRef<HTMLDivElement>(null);
  const heroRef=useRef<HTMLElement>(null),midRef=useRef<HTMLElement>(null),finalRef=useRef<HTMLElement>(null);
  const numberRef=useRef<HTMLSpanElement>(null),barRef=useRef<HTMLDivElement>(null),cursorRef=useRef<HTMLDivElement>(null);
  const [phase,setPhase]=useState<Phase>("loading");
  const intro=phase==="ready"||phase==="done";
  // Fragments requested in bookmarks or shared links must be restored after React adds the sections.
  useEffect(()=>{
    const jump=()=>{if(!window.location.hash)return;
      const id=decodeURIComponent(window.location.hash.slice(1));
      const target=document.getElementById(id);if(target)target.scrollIntoView({behavior:"auto",block:"start"});
    };
    const t1=window.setTimeout(jump,50),t2=window.setTimeout(jump,500);
    window.addEventListener("load",jump,{once:true});
    return ()=>{window.clearTimeout(t1);window.clearTimeout(t2);window.removeEventListener("load",jump);};
  },[]);
  useEffect(()=>{
    const story=storyRef.current,stage=stageRef.current,ch=caveHost.current,bh=burnHost.current;
    if(!story||!stage||!ch||!bh)return;
    let alive=true,raf=0;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seq=new Sequence();
    const cave=document.createElement("canvas");
    cave.setAttribute("role","img");cave.setAttribute("aria-label","Journey through a frozen blue ice cave");
    ch.appendChild(cave);
    const burnCanvas=document.createElement("canvas");burnCanvas.setAttribute("aria-hidden","true");bh.appendChild(burnCanvas);
    let depth:DepthRenderer|null=null,burn:BurnRenderer|null=null;
    try{depth=new DepthRenderer(cave);}catch(e){console.warn("Cave WebGL unavailable; showing scenic fallback",e);}
    if(!reduced){try{burn=new BurnRenderer(burnCanvas);burn.draw(0,performance.now());}catch(e){console.warn("Burn WebGL unavailable; using solid preloader",e);}}
    let phaseLocal:Phase="loading",assetsReady=false;
    const start=performance.now();
    let burnStart=0,last=start,scrollTarget=0,scrollProgress=0,unit=1,requestedIndex=-1;
    const pointerTarget={x:0,y:0},pointer={x:0,y:0};
    const mouse={x:window.innerWidth/2,y:window.innerHeight/2},cursorPos={x:mouse.x,y:mouse.y};
    let seenMouse=false,mouseActive=true;
    const changePhase=(next:Phase)=>{phaseLocal=next;if(alive)setPhase(next);document.documentElement.dataset.cursorActive=String((next==="ready"||next==="done")&&!reduced);};
    const updateMeasurements=()=>{unit=(probe.current?.getBoundingClientRect().width||100)/100;scrollTarget=clamp(-story.getBoundingClientRect().top/Math.max(1,story.offsetHeight-window.innerHeight));};
    const move=(e:PointerEvent)=>{
      if(e.pointerType==="touch")return;
      seenMouse=true;mouseActive=true;mouse.x=e.clientX;mouse.y=e.clientY;
      pointerTarget.x=(e.clientX/window.innerWidth-.5)*2;
      pointerTarget.y=(.5-e.clientY/window.innerHeight)*2;
      const c=cursorRef.current;if(c)c.dataset.seen="true";
    };
    const leave=()=>{pointerTarget.x=0;pointerTarget.y=0;mouseActive=false;const c=cursorRef.current;if(c)c.dataset.seen="false";};
    const over=(e:PointerEvent)=>{
      const el=e.target instanceof Element?e.target.closest<HTMLElement>("a,button,[data-cursor-label]"):null;
      const c=cursorRef.current;if(!c)return;
      c.dataset.hover=String(!!el);
      const label=el?.dataset.cursorLabel||"";
      c.dataset.labelActive=String(!!label);
      const text=c.querySelector<HTMLElement>("[data-cursor-text]");if(text&&label)text.textContent=label;
    };
    window.addEventListener("scroll",updateMeasurements,{passive:true});
    window.addEventListener("resize",updateMeasurements,{passive:true});
    window.addEventListener("pointermove",move,{passive:true});
    document.addEventListener("pointerover",over,{passive:true});
    document.documentElement.addEventListener("mouseleave",leave);
    updateMeasurements();
    // The only readiness gate is first paired frame and both fonts; any failure still unblocks the site.
    const fonts=Promise.allSettled([document.fonts.load('400 1em "Instrument Sans"'),document.fonts.load('italic 400 1em "Instrument Serif"')]);
    void Promise.allSettled([seq.start(),fonts]).then(()=>{if(alive)assetsReady=true;});
    function revealWords(el:HTMLElement|null,enter:readonly [number,number],progress:number){
      if(!el)return;
      const local=invLerp(enter[0],enter[1],progress);
      const words=Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
      words.forEach((word,i)=>word.style.setProperty("--reveal",String(clamp((local-(i/Math.max(1,words.length))*.58)/.34))));
      el.querySelector<HTMLElement>("[data-detail]")?.style.setProperty("--detail",String(clamp((local-.62)/.38)));
    }
    const frame=(now:number)=>{
      if(!alive)return;
      const dt=clamp(now-last,0,100);last=now;
      const elapsed=Math.max(0,now-start);
      if(phaseLocal==="loading"){
        const ready=assetsReady||elapsed>=LOADER_TIMEOUT_MS;
        const n=Math.floor(Math.min(elapsed/MIN_LOADER_MS,ready?1:.99)*100);
        if(numberRef.current)numberRef.current.textContent=String(n);
        if(barRef.current)barRef.current.style.transform=`scaleX(${n/100})`;
        burn?.draw(0,now);
        if(ready&&elapsed>=MIN_LOADER_MS){
          if(numberRef.current)numberRef.current.textContent="100";
          if(barRef.current)barRef.current.style.transform="scaleX(1)";
          burnStart=now;changePhase(reduced?"ready":"burning");
        }
      } else if(phaseLocal==="burning"){
        const t=clamp(Math.max(0,now-burnStart)/BURN_MS);
        const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
        burn?.draw(eased,now);
        if(now-burnStart>=INTRO_AT_MS)changePhase("ready");
      } else if(phaseLocal==="ready"){
        const t=clamp(Math.max(0,now-burnStart)/BURN_MS);
        const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
        if(!reduced)burn?.draw(eased,now);
        if(now-burnStart>=(reduced?200:BURN_MS))changePhase("done");
      }
      scrollProgress=damp(scrollProgress,scrollTarget,SCROLL_SMOOTHING,dt);
      const targetIndex=Math.round(scrollProgress*(FRAME_COUNT-1));
      if(targetIndex!==requestedIndex){requestedIndex=targetIndex;void seq.load(targetIndex);}
      const pTarget=reduced?{x:0,y:0}:pointerTarget;
      pointer.x=damp(pointer.x,pTarget.x,POINTER_SMOOTHING,dt);
      pointer.y=damp(pointer.y,pTarget.y,POINTER_SMOOTHING,dt);
      if(depth){depth.draw(seq.nearest(targetIndex),pointer);redrawGlass(stage,cave);}
      applyStory(heroRef.current,scrollProgress,TIMING.hero,unit);
      applyStory(midRef.current,scrollProgress,TIMING.mid,unit);
      applyStory(stage.querySelector<HTMLElement>("[data-story-cards]"),scrollProgress,TIMING.cards,unit);
      applyStory(finalRef.current,scrollProgress,TIMING.final,unit);
      revealWords(midRef.current,TIMING.mid.enter,scrollProgress);
      revealWords(finalRef.current,TIMING.final.enter,scrollProgress);
      const cursor=cursorRef.current;
      if(cursor){
        cursor.dataset.intro=String(phaseLocal==="ready"||phaseLocal==="done");
        if(!mouseActive||!seenMouse)cursor.dataset.seen="false";
        cursorPos.x=damp(cursorPos.x,mouse.x,CURSOR_SMOOTHING,dt);
        cursorPos.y=damp(cursorPos.y,mouse.y,CURSOR_SMOOTHING,dt);
        cursor.style.transform=`translate3d(${cursorPos.x}px,${cursorPos.y}px,0)`;
      }
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    return ()=>{
      alive=false;cancelAnimationFrame(raf);seq.destroy();delete document.documentElement.dataset.cursorActive;
      window.removeEventListener("scroll",updateMeasurements);
      window.removeEventListener("resize",updateMeasurements);
      window.removeEventListener("pointermove",move);
      document.removeEventListener("pointerover",over);
      document.documentElement.removeEventListener("mouseleave",leave);
      depth?.destroy();burn?.destroy();cave.remove();burnCanvas.remove();
    };
  },[]);
  return <>
    <main ref={storyRef} className={styles.story}>
      <div ref={stageRef} className={styles.stage} id="home">
        <div ref={caveHost} className={styles.caveHost}/>
        <div className={styles.shade} aria-hidden="true"/>
        <div className={styles.content}>
          <GlassCards/>
          <CopyState kind="hero" sectionRef={heroRef} intro={intro} title={["Building secure systems.","One challenge at a time."]} paragraph="I'm Henok Molla, building my future in networking and cybersecurity through hands-on learning, troubleshooting and real-world projects." button="Explore Projects" href="#projects"/>
          <CopyState kind="mid" sectionRef={midRef} title={["Complex networks.","Clear direction."]} paragraph="From TCP/IP and VLANs to packet analysis, I enjoy understanding how systems work and learning how to protect them."/>
          <CopyState kind="final" sectionRef={finalRef} title={["Built on curiosity.","Driven by purpose."]} paragraph="Learning. Building. Growing. One challenge at a time."/>
        </div>
        <Header intro={intro}/>
        <Preloader phase={phase} hostRef={burnHost} numberRef={numberRef} barRef={barRef}/>
        <div className={styles.probe} ref={probe} aria-hidden="true"/>
      </div>
    </main>
    <PortfolioSections/>
    <Cursor cursorRef={cursorRef}/>
  </>;
}
