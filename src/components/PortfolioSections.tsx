
import { useEffect,useRef } from "react";
import legacyHtml from "../legacy/portfolio.html?raw";
import { initLegacy } from "../lib/legacy";
export default function PortfolioSections(){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!root.current)return;return initLegacy(root.current);},[]);
 return <div className="legacy-content" ref={root}>
  <section className="editorial-bridge" aria-label="My learning journey">
   <div className="bridge-top"><span className="bridge-index">THE WORK BEHIND THE GOAL</span><span className="bridge-marker">03 / A STORY IN PROGRESS</span></div>
   <div className="bridge-main"><h2>Curiosity got me started.<br/><em>Practice keeps me going.</em></h2><p>What began with helping family fix phones and computers has grown into a goal: to become a network engineer or cybersecurity engineer. Every project here is one more opportunity to understand, practice, and improve.</p></div>
   <div className="bridge-track"><span>RESEARCH A PROBLEM</span><span aria-hidden="true">→</span><span>TEST A SOLUTION</span><span aria-hidden="true">→</span><span>DOCUMENT WHAT I LEARNED</span></div>
  </section>
  <div dangerouslySetInnerHTML={{__html:legacyHtml}}/>
 </div>;
}
