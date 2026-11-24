
import { useEffect,useLayoutEffect,useRef,useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "./Nav";
import LogCanvas from "./LogCanvas";
import { loadImages } from "../lib/loadImages";
import type { LogPair } from "../lib/loadImages";
import styles from "./Hero.module.css";
gsap.registerPlugin(ScrollTrigger);
export type HeroMotion={zoom:number;pixel:number};
const PORTRAIT="https://raw.githubusercontent.com/Henok-A-M/Henok-A-M/main/assets/henok_clear_highres_85.webp";
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
function Words({text}:{text:string}){
 return <>{text.split(" ").map((word,index)=><span data-hero-word="true" key={index} className={styles.word}>{word}{index<text.split(" ").length-1?"\u00a0":""}</span>)}</>;
}
export default function Hero(){
 const introRef=useRef<HTMLElement>(null),storyTrack=useRef<HTMLElement>(null),storyStage=useRef<HTMLDivElement>(null);
 const preloader=useRef<HTMLDivElement>(null),counter=useRef<HTMLSpanElement>(null),progressBar=useRef<HTMLDivElement>(null);
 const stageOne=useRef<HTMLDivElement>(null),stageTwo=useRef<HTMLDivElement>(null),wipe=useRef<HTMLDivElement>(null);
 const motion=useRef<HeroMotion>({zoom:1.085,pixel:0});
 const [images,setImages]=useState<LogPair|null>(null);
 useEffect(()=>{
  const ac=new AbortController();let alive=true;let owned:LogPair|null=null;
  void loadImages(ac.signal,()=>{}).then(pair=>{
   if(!alive){pair?.dispose();return;}
   owned=pair;if(pair)setImages(pair);
  }).catch(error=>{if(alive)console.warn("Interactive artwork unavailable",error);});
  return ()=>{alive=false;ac.abort();owned?.dispose();};
 },[]);
 useLayoutEffect(()=>{
  const intro=introRef.current,track=storyTrack.current,one=stageOne.current,two=stageTwo.current,curtain=wipe.current;
  if(!intro||!track||!one||!two||!curtain)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alive=true;
  const onScroll=()=>{
   const extent=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
   if(progressBar.current)progressBar.current.style.transform=`scaleX(${clamp(window.scrollY/extent)})`;
  };
  window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll,{passive:true});onScroll();
  const context=gsap.context(()=>{
   const header=document.querySelector<HTMLElement>('[data-site-nav="true"]');
   const introWords=intro.querySelectorAll<HTMLElement>("[data-hero-word]");
   const eyebrow=intro.querySelector<HTMLElement>("[data-intro-eyebrow]");
   const lead=intro.querySelector<HTMLElement>("[data-intro-lead]");
   const buttons=intro.querySelector<HTMLElement>("[data-intro-buttons]");
   const portrait=intro.querySelector<HTMLElement>("[data-intro-portrait]");
   const skills=intro.querySelector<HTMLElement>("[data-intro-chips]");
   const hint=intro.querySelector<HTMLElement>("[data-intro-scroll]");
   const countObj={v:0};
   const tl=gsap.timeline({defaults:{ease:"power2.out"},onComplete:()=>{
     if(!alive)return;ScrollTrigger.refresh();
     if(location.hash&&location.hash!=="#home")window.setTimeout(()=>{
       const id=decodeURIComponent(location.hash.slice(1));document.getElementById(id)?.scrollIntoView({behavior:"instant",block:"start"});
     },100);
   }});
   if(preloader.current){
    if(reduced){tl.set(preloader.current,{autoAlpha:0},0);}
    else{
     tl.to(countObj,{v:100,duration:1.18,ease:"power1.out",onUpdate:()=>{
       if(counter.current)counter.current.textContent=String(Math.floor(countObj.v)).padStart(2,"0");
     }},0);
     tl.to(preloader.current,{autoAlpha:0,duration:.65,ease:"power2.inOut"},1.10);
    }
   }
   const revealAt=reduced?0:1.05,duration=reduced?.01:.85;
   if(header)tl.fromTo(header,{autoAlpha:0,y:-18},{autoAlpha:1,y:0,duration},revealAt);
   if(eyebrow)tl.fromTo(eyebrow,{autoAlpha:0,y:20,filter:reduced?"none":"blur(8px)"},{autoAlpha:1,y:0,filter:"none",duration:.7,clearProps:"filter"},revealAt+.12);
   if(introWords.length)tl.fromTo(introWords,{autoAlpha:0,y:24,filter:reduced?"none":"blur(12px)"},{autoAlpha:1,y:0,filter:"none",duration:reduced?.01:.9,stagger:reduced?0:.09,clearProps:"filter,transform"},revealAt+.26);
   if(lead)tl.fromTo(lead,{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.7},revealAt+.55);
   if(buttons)tl.fromTo(buttons,{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.7},revealAt+.69);
   if(portrait)tl.fromTo(portrait,{autoAlpha:0,y:reduced?0:42,scale:reduced?1:.975},{autoAlpha:1,y:0,scale:1,duration:reduced?.01:1.2,ease:"power3.out"},revealAt+.19);
   if(skills)tl.fromTo(skills,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.65},revealAt+.92);
   if(hint)tl.fromTo(hint,{autoAlpha:0},{autoAlpha:1,duration:.6},revealAt+1.0);
   if(portrait&&!reduced)gsap.to(portrait,{y:-32,ease:"none",scrollTrigger:{trigger:intro,start:"top top",end:"bottom top",scrub:.65}});
   const updateStory=(p:number)=>{
     const first=1-clamp((p-.18)/.18),second=clamp((p-.32)/.20)*(1-clamp((p-.73)/.13));
     gsap.set(one,{autoAlpha:first,y:reduced?0:-30*(1-first),filter:reduced?"none":`blur(${(1-first)*5}px)`});
     gsap.set(two,{autoAlpha:second,y:reduced?0:26*(1-second),filter:reduced?"none":`blur(${(1-second)*6}px)`});
     const white=clamp((p-.80)/.20);
     curtain.style.clipPath=`circle(${white*145}% at 50% 52%)`;
     motion.current.zoom=reduced?1:1.085-.085*clamp(p/.8);
   };
   updateStory(0);
   ScrollTrigger.create({trigger:track,start:"top top",end:"bottom bottom",invalidateOnRefresh:true,onUpdate:self=>updateStory(self.progress)});
   if(!reduced){
     gsap.utils.toArray<HTMLElement>(".legacy-content .section").forEach(section=>{
       const heading=section.querySelector<HTMLElement>("h2");
       if(heading)gsap.fromTo(heading,{y:24,filter:"blur(7px)"},{y:0,filter:"blur(0px)",duration:1,ease:"power2.out",clearProps:"filter",scrollTrigger:{trigger:section,start:"top 82%",once:true}});
     });
   }
  },intro);
  return ()=>{alive=false;window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);context.revert();};
 },[]);
 return <>
  <Nav/>
  <div className={styles.pageProgress} aria-hidden="true"><div ref={progressBar}/></div>
  <main>
   <section id="home" className={styles.intro} ref={introRef} aria-label="Henok Molla introduction">
    <div className={styles.mesh} aria-hidden="true"/>
    <div className={styles.orbit} aria-hidden="true"><span/><span/><span/></div>
    <div className={styles.introInner}>
     <div className={styles.introCopy}>
      <p className={styles.eyebrow} data-intro-eyebrow><span className={styles.statusDot}/>HENOK MOLLA / NETWORK SECURITY</p>
      <h1 className={styles.headline} aria-label="Learning the network. Securing the future.">
       <span className={styles.headlineTop}><Words text="Learning the network."/></span>
       <span className={styles.headlineBottom}><Words text="Securing the future."/></span>
      </h1>
      <p className={styles.description} data-intro-lead>I'm Henok Molla. Through Year Up United's Network Security track and my studies at City University of Seattle, I'm building practical skills in networking, troubleshooting, and cybersecurity.</p>
      <div className={styles.buttons} data-intro-buttons>
       <a className={styles.primaryButton} href="#projects">Explore My Projects <span aria-hidden="true">↗</span></a>
       <a className={styles.secondaryButton} href="#contact">Get in Touch <span aria-hidden="true">↗</span></a>
      </div>
      <div className={styles.skillPills} data-intro-chips aria-label="Tools and skills I'm learning">
       {["Wireshark","Cisco","Packet Tracer","GitHub","VS Code"].map(skill=><span key={skill}>{skill}</span>)}
      </div>
     </div>
     <div className={styles.portraitZone} data-intro-portrait>
      <div className={styles.portraitRing} aria-hidden="true"/>
      <div className={styles.portraitGlow} aria-hidden="true"/>
      <img className={styles.portrait} src={PORTRAIT} alt="Henok Molla, professional portrait" decoding="async" fetchPriority="high"/>
      <div className={styles.portraitLabel}>
       <span className={styles.portraitLabelIcon} aria-hidden="true">⌘</span>
       <div><strong>Learning by building.</strong><small>Network security · Hands-on projects</small></div>
      </div>
     </div>
    </div>
    <a className={styles.scrollHint} data-intro-scroll href="#layers"><span className={styles.scrollLine}/><span>SCROLL TO EXPLORE</span><span aria-hidden="true">↓</span></a>
    <div className={styles.preloader} ref={preloader} aria-label="Loading portfolio"><div className={styles.preloaderMark}>HM<span>.</span></div><div className={styles.preloaderCounter}><span ref={counter}>00</span><sup>%</sup></div><p>CONNECTING THE LAYERS</p><div className={styles.preloaderTrack}><span/></div></div>
   </section>
   <section className={styles.storyTrack} ref={storyTrack} id="layers" aria-label="Interactive network discovery">
    <div className={styles.storyStage} ref={storyStage}>
     <LogCanvas state={motion} images={images} host={storyStage}/>
     <div className={styles.chapter} aria-hidden="true">CHAPTER 02 / UNDER THE SURFACE</div>
     <div className={styles.storyCopy} ref={stageOne}>
      <p className={styles.storyEyebrow}>A CLOSER LOOK</p>
      <h2>Look beneath<br/><em>the surface.</em></h2>
      <p className={styles.storyLead}>Every connection has a story. I use tools like Wireshark and Cisco Packet Tracer to explore the traffic, protocols, and decisions happening underneath.</p>
     </div>
     <div className={styles.storyCopy+" "+styles.secondStory} ref={stageTwo}>
      <p className={styles.storyEyebrow}>FROM LEARNING TO DOING</p>
      <h2>Understand.<br/><em>Then protect.</em></h2>
      <p className={styles.storyLead}>Packet analysis, VLAN segmentation, and troubleshooting are helping me build the foundation for a future in network engineering and cybersecurity.</p>
     </div>
     <div className={styles.interactionHint}>MOVE YOUR CURSOR ACROSS THE LOG <span>·</span> REVEAL WHAT'S BENEATH</div>
     <div className={styles.storyCounter}>02 — 05</div>
     <div ref={wipe} className={styles.storyWipe} aria-hidden="true"/>
    </div>
   </section>
  </main>
 </>;
}
