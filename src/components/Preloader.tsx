
import { forwardRef } from "react";
import styles from "./Preloader.module.css";
const Preloader=forwardRef<HTMLDivElement,{}>(function Preloader(_props,ref){
 return <div ref={ref} className={styles.loader} data-preloader="true">
  <div className={styles.wordmark} data-preloader-wordmark="true" aria-hidden="true">
   <img src="https://assets.uberdesigner.ai/portale/wordmark.svg" alt=""/>
   <span>HENOK MOLLA</span>
  </div>
  <p className={styles.counter} aria-label="Loading portfolio"><span data-counter="true">00</span>%</p>
 </div>;
});
export default Preloader;
