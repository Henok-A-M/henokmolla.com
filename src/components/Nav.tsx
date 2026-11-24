
import { useState } from "react";
import styles from "./Nav.module.css";
const navItems:[string,string][]=[["About","#about"],["Skills","#skills"],["Projects","#projects"],["My Journey","#experience"],["Contact","#contact"]];
export default function Nav(){
 const [open,setOpen]=useState(false);
 return <header className={styles.nav} data-site-nav="true">
  <a className={styles.brand} href="#home" aria-label="Henok Molla, back to home"><span className={styles.symbol}>HM<span className={styles.dot}>.</span></span><span className={styles.brandCaption}>HENOK MOLLA</span></a>
  <nav className={styles.links} aria-label="Main navigation">{navItems.map(([label,href])=><a key={href} href={href}>{label}</a>)}</nav>
  <div className={styles.actions}>
   <a className={styles.social} href="https://github.com/Henok-A-M" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">GH</a>
   <a className={styles.social} href="https://www.linkedin.com/in/henok-molla" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">in</a>
   <a className={styles.social} href="mailto:henok.molla73@gmail.com" aria-label="Email Henok" title="Email"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></a>
   <button className={styles.menu} type="button" aria-controls="henok-mobile-nav" aria-expanded={open} aria-label={open?"Close navigation":"Open navigation"} onClick={()=>setOpen(v=>!v)}>
    <span className={styles.menuBars} data-open={open}><i/><i/></span>
   </button>
  </div>
  {open&&<nav className={styles.dropdown} id="henok-mobile-nav" aria-label="Mobile navigation">
   {navItems.map(([label,href])=><a key={href} href={href} onClick={()=>setOpen(false)}>{label}<span aria-hidden="true">↗</span></a>)}
   <a href="#layers" onClick={()=>setOpen(false)}>The interactive chapter <span aria-hidden="true">↗</span></a>
  </nav>}
 </header>;
}
