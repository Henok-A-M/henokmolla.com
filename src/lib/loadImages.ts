
export const BARE_URL="https://assets.uberdesigner.ai/easylog/log-bare.webp";
export const MOSS_URL="https://assets.uberdesigner.ai/easylog/log-moss.webp";
export type LogPair={bare:ImageBitmap;moss:ImageBitmap;dispose:()=>void};
type ProgressCallback=(progress:number)=>void;
async function getImage(url:string,signal:AbortSignal,onProgress:(bytes:number,total:number|null)=>void):Promise<ImageBitmap>{
 const response=await fetch(url,{mode:"cors",signal});if(!response.ok)throw Error(`Image request ${response.status}: ${url}`);
 const contentLength=Number(response.headers.get("content-length"))||null;
 const reader=response.body?.getReader();
 let blob:Blob;
 if(!reader){blob=await response.blob();onProgress(blob.size,contentLength);}
 else{
  const chunks:Uint8Array<ArrayBuffer>[]=[];let count=0;
  while(true){const {done,value}=await reader.read();if(done)break;if(!value)continue;
   const part=new Uint8Array(value);chunks.push(part);count+=part.byteLength;onProgress(count,contentLength);}
  blob=new Blob(chunks,{type:response.headers.get("content-type")||"image/webp"});
 }
 if(signal.aborted)throw new DOMException("Aborted","AbortError");
 const bitmap=await createImageBitmap(blob);
 if(signal.aborted){bitmap.close();throw new DOMException("Aborted","AbortError");}
 return bitmap;
}
export async function loadImages(signal:AbortSignal,notify:ProgressCallback):Promise<LogPair|null>{
 const received=[0,0],totals:(number|null)[]=[null,null],finished=[false,false];
 let progress=0;
 const update=()=>{
  const fractions=received.map((v,i)=>finished[i]?1:totals[i]?Math.min(v/totals[i]!, .99):0);
  progress=Math.max(progress,(fractions[0]+fractions[1])/2);
  notify(Math.max(0,Math.min(.99,progress)));
 };
 const tasks=[BARE_URL,MOSS_URL].map((url,i)=>getImage(url,signal,(bytes,total)=>{
  received[i]=bytes;totals[i]=total;update();
 }).then(bitmap=>{finished[i]=true;update();return bitmap;}));
 const results=await Promise.allSettled(tasks);
 if(results.some(x=>x.status==="rejected")||signal.aborted){
  for(const entry of results){if(entry.status==="fulfilled")entry.value.close();else if(!signal.aborted)console.warn("Easylog artwork unavailable",entry.reason);}
  notify(1);return null;
 }
 const bare=(results[0] as PromiseFulfilledResult<ImageBitmap>).value;
 const moss=(results[1] as PromiseFulfilledResult<ImageBitmap>).value;
 notify(1);
 return {bare,moss,dispose:()=>{bare.close();moss.close();}};
}
