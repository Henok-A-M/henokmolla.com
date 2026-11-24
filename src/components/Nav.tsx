
import { useState } from "react";
import styles from "./Nav.module.css";
const navItems:[string,string][]=[
 ["Main","#home"],["Platform","#skills"],["Use","#about"],["Cases","#projects"],
 ["Integrations","#projects"],["Journal","#experience"],["Contact","#contact"]
];
export default function Nav(){
 const [open,setOpen]=useState(false);
 return <header className={styles.nav} data-reveal="nav">
   <a href="#home" className={styles.logo} aria-label="Easylog hero, return to top"><img src="https://assets.uberdesigner.ai/easylog/logo.svg" width="90" height="30" alt="easylog"/></a>
   <nav className={styles.pill} aria-label="Main navigation">
     {navItems.map(([label,href])=><a href={href} key={label}>{label}</a>)}
   </nav>
   <div className={styles.menuWrap}>
    <button type="button" className={styles.menu} aria-expanded={open} aria-controls="easylog-menu" onClick={()=>setOpen(v=>!v)}>{open?"close":"menu"}</button>
    {open&&<nav id="easylog-menu" className={styles.dropdown} aria-label="All portfolio sections">
      {navItems.map(([label,href])=><a key={label} href={href} onClick={()=>setOpen(false)}>{label}</a>)}
      <a href="https://github.com/Henok-A-M" target="_blank" rel="noopener noreferrer" onClick={()=>setOpen(false)}>GitHub ↗</a>
    </nav>}
   </div>
 </header>;
}
