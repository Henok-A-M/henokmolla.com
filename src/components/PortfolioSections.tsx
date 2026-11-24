
import { useEffect,useRef } from "react";
import legacyHtml from "../legacy/portfolio.html?raw";
import { initLegacy } from "../lib/legacy";
export default function PortfolioSections(){
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!root.current)return;return initLegacy(root.current);},[]);
  return <div className="legacy-content" ref={root}>
    <section className="profile-recap" aria-label="About Henok Molla">
      <img className="recap-photo" src="https://raw.githubusercontent.com/Henok-A-M/Henok-A-M/main/assets/henok_clear_highres_85.webp" alt="Henok Molla professional portrait" loading="lazy"/>
      <div><span className="recap-kicker">NETWORK SECURITY / BUILDING WHAT'S NEXT</span>
        <h2>Hi, I'm Henok Molla.</h2>
        <p>I'm building my future in technology through hands-on networking and cybersecurity experience, continuous learning, and a passion for solving problems.</p>
        <div className="recap-tags"><span>Wireshark</span><span>Packet Tracer</span><span>Cisco</span><span>GitHub</span><span>VS Code</span><span>Cybersecurity</span></div>
      </div>
    </section>
    <div dangerouslySetInnerHTML={{__html:legacyHtml}}/>
  </div>;
}
