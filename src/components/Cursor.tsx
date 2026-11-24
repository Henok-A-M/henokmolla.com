
import type { Ref } from "react";
import styles from "./Cursor.module.css";
export default function Cursor({cursorRef}:{cursorRef:Ref<HTMLDivElement>}){return <div className={styles.cursor} ref={cursorRef} aria-hidden="true" data-intro="false"><div className={styles.ring}/><div className={styles.dot}/><div className={styles.label} data-cursor-text="true"/></div>;}
