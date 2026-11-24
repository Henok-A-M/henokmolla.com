
import { useState } from "react";
import type { ReactNode } from "react";
import styles from "./Header.module.css";
import { PILL_BLUR } from "../config";
type Props={intro:boolean};
function CloseLink({href,children,onClick}:{href:string,children:ReactNode,onClick?:()=>void}){return <a href={href} onClick={onClick}>{children}</a>;}
export default function Header({intro}:Props){
  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);
  return <header className={styles.header} data-intro={intro}>
    <a className={styles.logo} href="#home" aria-label="Henok Molla portfolio home">HM<span>://</span>desk</a>
    <div className={styles.controls}>
      <nav className={styles.pill} aria-label="Main navigation">
        <canvas data-blur={PILL_BLUR} aria-hidden="true" className={styles.blur} />
        <CloseLink href="#about">About</CloseLink>
        <CloseLink href="#skills">Expertise</CloseLink>
        <CloseLink href="#projects">Projects</CloseLink>
      </nav>
      <div className={styles.menuPair}>
        <button className={styles.menuLabel} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>Menu</button>
        <button className={styles.menuIcon} aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="stage-menu" onClick={()=>setOpen(v=>!v)}><span className={styles.squares}><i/><i/><i/><i/></span></button>
      </div>
    </div>
    {open&&<nav id="stage-menu" className={styles.dropdown} aria-label="All sections">
      <CloseLink href="#home" onClick={close}>Home</CloseLink>
      <CloseLink href="#about" onClick={close}>About Me</CloseLink>
      <CloseLink href="#skills" onClick={close}>Technical Skills</CloseLink>
      <CloseLink href="#projects" onClick={close}>Projects</CloseLink>
      <CloseLink href="#experience" onClick={close}>My Journey</CloseLink>
      <CloseLink href="#contact" onClick={close}>Get in Touch</CloseLink>
      <a href="https://github.com/Henok-A-M" target="_blank" rel="noopener noreferrer" onClick={close}>GitHub ↗</a>
    </nav>}
  </header>;
}
