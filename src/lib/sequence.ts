
import { FRAME_COUNT, colorURL, depthURL } from "../config";
export interface CavePair{color:HTMLImageElement;depth:HTMLImageElement;index:number}
export class Sequence{
  private loaded:(CavePair|null)[]=Array(FRAME_COUNT).fill(null);
  private inFlight=new Map<number,Promise<CavePair|null>>();
  private failed=new Set<number>();
  private aborted=false;
  private waits=new Set<ReturnType<typeof setTimeout>>();
  private loadImage(url:string):Promise<HTMLImageElement>{
    return new Promise((resolve,reject)=>{
      const im=new Image();im.crossOrigin="anonymous";
      im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("Image unavailable: "+url));
      im.src=url;
    });
  }
  load(n:number):Promise<CavePair|null>{
    const i=Math.max(0,Math.min(FRAME_COUNT-1,Math.round(n)));
    if(this.aborted||this.failed.has(i))return Promise.resolve(null);
    if(this.loaded[i])return Promise.resolve(this.loaded[i]);
    const existing=this.inFlight.get(i);if(existing)return existing;
    const promise=Promise.all([this.loadImage(colorURL(i)),this.loadImage(depthURL(i))])
      .then(([color,depth])=>{
        if(this.aborted)return null;
        const pair={color,depth,index:i};this.loaded[i]=pair;return pair;
      })
      .catch(err=>{
        if(!this.failed.has(i))console.warn("Cave frame",i,err);
        this.failed.add(i);return null;
      }).finally(()=>this.inFlight.delete(i));
    this.inFlight.set(i,promise);return promise;
  }
  async start():Promise<CavePair|null>{
    const first=await this.load(0);
    if(this.aborted)return first;
    void this.prefetch();
    return first;
  }
  private delay(ms:number):Promise<void>{return new Promise(resolve=>{const id=setTimeout(()=>{this.waits.delete(id);resolve();},ms);this.waits.add(id);});}
  private async prefetch(){
    for(let start=1;start<FRAME_COUNT&&!this.aborted;){
      const count=start===1?8:4;
      const indices=Array.from({length:Math.min(count,FRAME_COUNT-start)},(_,j)=>start+j);
      await Promise.all(indices.map(i=>this.load(i)));
      start+=count;
      if(!this.aborted)await this.delay(20);
    }
  }
  nearest(n:number):CavePair|null{
    const target=Math.max(0,Math.min(FRAME_COUNT-1,Math.round(n)));
    if(this.loaded[target])return this.loaded[target];
    for(let i=1;i<FRAME_COUNT;i++){
      if(target-i>=0&&this.loaded[target-i])return this.loaded[target-i];
      if(target+i<FRAME_COUNT&&this.loaded[target+i])return this.loaded[target+i];
    }
    return null;
  }
  destroy(){this.aborted=true;for(const t of this.waits)clearTimeout(t);this.waits.clear();}
}
