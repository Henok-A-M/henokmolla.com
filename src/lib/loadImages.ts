export const DESERT="https://assets.uberdesigner.ai/portale/desert.webp";
export const CARD="https://assets.uberdesigner.ai/portale/bank-card.webp";
export type LoadedImage={url:string;revoke:()=>void};
export type LoadedPhotos={desert:LoadedImage|null;card:LoadedImage|null};
async function fetchPhoto(url:string,signal:AbortSignal,onBytes:(loaded:number,total:number|null)=>void):Promise<LoadedImage>{
  const response=await fetch(url,{signal,mode:"cors"});if(!response.ok)throw new Error(`Image ${response.status}: ${url}`);
  const size=Number(response.headers.get("content-length"))||null;
  const reader=response.body?.getReader();let doneBytes=0;let blob:Blob;
  if(reader){const chunks:Uint8Array<ArrayBuffer>[]=[];for(;;){const {done,value}=await reader.read();if(done)break;if(!value)continue;const c=new Uint8Array(value);chunks.push(c);doneBytes+=c.length;onBytes(doneBytes,size);}blob=new Blob(chunks,{type:response.headers.get("content-type")||"image/webp"});}
  else{blob=await response.blob();doneBytes=blob.size;onBytes(doneBytes,size);}
  const objectUrl=URL.createObjectURL(blob);try{const image=new Image();image.src=objectUrl;await image.decode();return {url:objectUrl,revoke:()=>URL.revokeObjectURL(objectUrl)};}catch(e){URL.revokeObjectURL(objectUrl);throw e;}
}
export async function loadPhotos(signal:AbortSignal,onProgress:(value:number)=>void):Promise<LoadedPhotos>{
 const fractions=[0,0];const finished=[false,false];let known=[false,false];const update=()=>{
  const value=fractions.map((v,i)=>finished[i]?1:known[i]?v:0).reduce((a,b)=>a+b,0)/2;
  onProgress(Math.max(0,Math.min(1,value)));
 };
 const urls=[DESERT,CARD];const results=await Promise.allSettled(urls.map((url,i)=>fetchPhoto(url,signal,(loaded,total)=>{
  if(total&&total>0){known[i]=true;fractions[i]=Math.max(fractions[i],Math.min(.99,loaded/total));update();}
 }).then(x=>{finished[i]=true;update();return x;}).catch(e=>{finished[i]=true;update();if(!signal.aborted)console.warn("Photo fallback",url,e);return null;})));
 onProgress(1);return {desert:results[0].status==="fulfilled"?results[0].value:null,card:results[1].status==="fulfilled"?results[1].value:null};
}
