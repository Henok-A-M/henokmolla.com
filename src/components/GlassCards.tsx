
import styles from "./GlassCards.module.css";
import { CARD_BLUR } from "../config";
export default function GlassCards(){
  return <div className={styles.group} data-story-cards="true">
    <article className={styles.card+" "+styles.left}>
      <canvas data-blur={CARD_BLUR} className={styles.blur} aria-hidden="true"/>
      <div className={styles.content}><h3>Network Security</h3><p>Understanding traffic, protocols and architecture to build stronger, more secure networks.</p></div>
    </article>
    <article className={styles.card+" "+styles.right}>
      <canvas data-blur={CARD_BLUR} className={styles.blur} aria-hidden="true"/>
      <div className={styles.content}><h3>Hands-on Projects</h3><p>Wireshark analysis, VLAN labs, home infrastructure and continuous learning.</p></div>
    </article>
  </div>;
}
