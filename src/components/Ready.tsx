
import Words from "./Words";
import styles from "./Ready.module.css";
import { CARD } from "../lib/loadImages";
export default function Ready({photo}:{photo:string|null}){
 return <section className={styles.ready} data-ready-screen="true" aria-label="Network security portfolio highlights">
  <div className={styles.wordmark} data-ready="wordmark"><img src="https://assets.uberdesigner.ai/portale/wordmark.svg" alt="" aria-hidden="true"/><span>HENOK MOLLA</span></div>
  <h2 className={styles.heading} aria-label="Everything Connected Built for What's Next">
   <span className={styles.headingTop} data-ready="text"><Words text="Everything Connected" className={styles.word}/></span>
   <span className={styles.headingBottom} data-ready="text"><Words text="Built for What's Next" className={styles.word}/></span>
  </h2>
  <div className={styles.cardBox} data-ready="card">
   <div className={styles.cardFloat} data-ready="card-float"><img data-ready="card-image" src={photo||CARD} alt="Pale-blue translucent card representing connected technology" draggable={false}/></div>
  </div>
  <a className={styles.more} data-ready="more" href="#skills"><span aria-hidden="true">✳</span> Skills</a>
  <p className={styles.copy} data-ready="copy">From network fundamentals to security analysis, I'm building a strong technical foundation through hands-on labs, teamwork, and continuous learning.</p>
  <a className={styles.action} data-ready="action" href="#projects">Explore My Projects ↗</a>
  <span className={styles.scroll} data-ready="scroll">Scroll down for more ↓</span>
 </section>;
}
