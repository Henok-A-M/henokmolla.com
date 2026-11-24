
export function redrawGlass(stage:HTMLElement,cave:HTMLCanvasElement){
  const src=cave.getBoundingClientRect();
  if(src.width<1||src.height<1||cave.width<1)return;
  const scale=cave.width/src.width;
  stage.querySelectorAll<HTMLCanvasElement>("canvas[data-blur]").forEach(canvas=>{
    const host=canvas.parentElement;if(!host)return;
    const r=host.getBoundingClientRect();
    if(!r.width||!r.height||getComputedStyle(host).visibility==="hidden")return;
    const blur=Number(canvas.dataset.blur)||16,pad=blur*2;
    const cssW=r.width+pad*2,cssH=r.height+pad*2;
    const w=Math.max(1,Math.round(cssW*scale)),h=Math.max(1,Math.round(cssH*scale));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    Object.assign(canvas.style,{left:`${-pad}px`,top:`${-pad}px`,width:`${cssW}px`,height:`${cssH}px`});
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
    ctx.filter=`blur(${blur*scale}px)`;
    try{ctx.drawImage(cave,-(r.left-src.left-pad)*scale,-(r.top-src.top-pad)*scale);}catch{/** canvas may briefly be lost on device reset */}
    ctx.filter="none";
  });
}
