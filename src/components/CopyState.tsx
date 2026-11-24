
import type { CSSProperties, Ref } from "react";
import styles from "./CopyState.module.css";
type Props={title:[string,string];paragraph:string;kind:"hero"|"mid"|"final";intro?:boolean;href?:string;button?:string;sectionRef?:Ref<HTMLElement>};
function Words({value,from}:{value:string;from:number}){
  return <>{value.split(" ").map((word,i)=><span key={i} data-word="true" className={styles.word} style={{"--i":from+i} as CSSProperties}>{word}{i<value.split(" ").length-1?" ":""}</span>)}</>;
}
export default function CopyState({title,paragraph,kind,intro=false,href,button,sectionRef}:Props){
  const heading=<span className={styles.headline}><span className={styles.sans+" sans trim"} style={{"--lh":"calc(72 * var(--u))"} as CSSProperties}><Words value={title[0]} from={0}/></span><span className={styles.serif+" serif trim"} style={{"--lh":"calc(72 * var(--u))"} as CSSProperties}><Words value={title[1]} from={title[0].split(" ").length}/></span></span>;
  return <section ref={sectionRef} className={styles.copy+" "+styles[kind]} data-kind={kind} data-intro={intro}>
    {kind==="hero"?<h1 className={styles.heading}>{heading}</h1>:<h2 className={styles.heading}>{heading}</h2>}
    <div className={styles.detail} data-detail="true"><p>{paragraph}</p>{href&&button&&<a className={styles.button} href={href} data-cursor-label="Enter">{button}<span aria-hidden="true">↗</span></a>}</div>
  </section>;
}
