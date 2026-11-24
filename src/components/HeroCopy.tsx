
import Words from "./Words";
import styles from "./HeroCopy.module.css";
export default function HeroCopy(){
 return <section className={styles.hero} data-hero="true" aria-label="Henok Molla portfolio introduction">
  <div className={styles.top}>
   <div className={styles.badge} data-intro="badge"><span className={styles.square}/>NETWORK SECURITY · YEAR UP UNITED</div>
   <h1 className={styles.headline} aria-label="Building Secure Systems One Challenge at a Time" data-intro="headline">
    <span aria-hidden="true"><Words text="Building Secure Systems" className={styles.word}/></span>
    <span aria-hidden="true"><Words text="One Challenge at a Time" className={styles.word}/></span>
   </h1>
  </div>
  <div className={styles.buttons} data-intro="buttons">
    <a href="#projects" className={styles.primary}>Explore Projects <span aria-hidden="true">↗</span></a>
    <a href="#contact" className={styles.secondary}>Get in Touch</a>
  </div>
  <p className={styles.lead} data-intro="lead">I'm Henok Molla, building my future in network security and cybersecurity through real projects, technical coursework, and a passion for solving problems.</p>
 </section>;
}
