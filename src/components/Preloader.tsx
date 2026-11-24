
import type { CSSProperties, Ref } from "react";
import styles from "./Preloader.module.css";
type Props={phase:"loading"|"burning"|"ready"|"done";hostRef:Ref<HTMLDivElement>;numberRef:Ref<HTMLSpanElement>;barRef:Ref<HTMLDivElement>};
export default function Preloader({phase,hostRef,numberRef,barRef}:Props){
  return <div className={styles.root} data-phase={phase} aria-busy={phase==="loading"}><div className={styles.burnHost} ref={hostRef}/><div className={styles.ui}>
    <p className={styles.counter+" serif trim"} style={{"--lh":"calc(.8 * var(--counter-size))"} as CSSProperties} role="status" aria-label="Loading"><span ref={numberRef}>0</span>%</p>
    <div className={styles.track}><div className={styles.progress} ref={barRef}/></div>
  </div></div>;
}
