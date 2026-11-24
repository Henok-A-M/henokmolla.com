
import styles from "./Nav.module.css";
export default function Nav({theme}:{theme:"light"|"dark"}){
 return <header className={styles.nav} data-nav="true" data-theme={theme}>
  <a className={styles.logo} href="#home" aria-label="Henok Molla home">HM<span>.</span>DESK</a>
  <nav className={styles.pill} aria-label="Main navigation">
   <a className={theme==="light"?styles.active:""} href="#about">About</a>
   <a href="#skills">Skills</a>
   <a className={theme==="dark"?styles.active:""} href="#projects">Projects</a>
   <a href="#experience">Journey</a>
   <a href="#contact">Contact</a>
  </nav>
  <div className={styles.actions}>
   <a className={styles.account} href="https://github.com/Henok-A-M" target="_blank" rel="noopener noreferrer"><span className={styles.accountIcon}>⌁</span> GitHub</a>
   <a className={styles.cta} href="#projects">View Projects</a>
  </div>
 </header>;
}
