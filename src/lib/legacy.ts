
import projects from "../legacy/projects.json";
export function initLegacy(root:HTMLElement):()=>void{
  const ctrl=new AbortController(),signal=ctrl.signal;
  const all=<T extends Element>(selector:string)=>Array.from(root.querySelectorAll<T>(selector));
  const panels=all<HTMLElement>(".project-panel");
  all<HTMLButtonElement>("[data-project]").forEach(btn=>btn.addEventListener("click",()=>{
    const i=Number(btn.dataset.project),p=projects[i];if(!p)return;
    all<HTMLButtonElement>("[data-project]").forEach(b=>{const selected=b===btn;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected));});
    const name=(p.folder==="vlan-segmentation"||p.folder==="wireshark-analysis")?p.folder:"other";
    panels.forEach(panel=>{
      const selected=panel.dataset.panel===name;panel.hidden=!selected;
      if(selected){panel.classList.remove("panel-arrive");void panel.offsetWidth;panel.classList.add("panel-arrive");}
    });
    if(name==="other"){
      const set=(id:string,text:string)=>{const el=root.querySelector<HTMLElement>("#"+id);if(el)el.textContent=text;};
      set("file-title",p.folder+"/README.md");set("command","cat "+p.folder+"/README.md");
      set("project-title",p.title);set("project-desc",p.desc);
      const tags=root.querySelector("#project-tags");
      if(tags)tags.replaceChildren(...p.tags.map(tag=>{const span=document.createElement("span");span.className="filetag";span.textContent=tag;return span;}));
    }
    const details=root.querySelector<HTMLDetailsElement>("#panel-"+name+" details");
    if(details)details.open=true;
  },{signal}));
  const vlanInfo:Record<string,string>={
    all:"All six computers and both switches are shown. Select a VLAN to explore an example logical group.",
    "10":"VLAN 10 / Sales: example endpoints PC0 and PC3 are highlighted across two switches.",
    "20":"VLAN 20 / Engineering: example endpoints PC1 and PC4 are highlighted across two switches.",
    "30":"VLAN 30 / Guest: example endpoints PC2 and PC5 are highlighted across two switches."
  };
  all<HTMLButtonElement>("[data-vlan-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    const selected=btn.dataset.vlanFilter||"all",topology=root.querySelector<HTMLElement>("#vlan-topology");
    if(!topology||!vlanInfo[selected])return;
    topology.dataset.vlanView=selected;
    all<HTMLButtonElement>("[data-vlan-filter]").forEach(b=>{
      const active=btn===b;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));
    });
    const el=root.querySelector<HTMLElement>("#vlan-live-status");if(el)el.textContent=vlanInfo[selected];
  },{signal}));
  const dialog=root.querySelector<HTMLDialogElement>("#lab-lightbox");
  const image=root.querySelector<HTMLImageElement>("#lab-lightbox-image");
  const caption=root.querySelector<HTMLElement>("#lab-lightbox-caption");
  const counter=root.querySelector<HTMLElement>("#lab-lightbox-counter");
  const close=root.querySelector<HTMLButtonElement>("#lab-lightbox-close");
  const prev=root.querySelector<HTMLButtonElement>("#lab-lightbox-prev");
  const next=root.querySelector<HTMLButtonElement>("#lab-lightbox-next");
  const zoom=root.querySelector<HTMLButtonElement>("#lab-lightbox-zoom");
  type Item={button:HTMLButtonElement;image:HTMLImageElement;caption:HTMLElement};
  let gallery:Item[]=[],current=0,trigger:HTMLButtonElement|null=null;
  function resetZoom(){if(!image||!zoom)return;image.classList.remove("is-zoomed");image.style.width="";zoom.textContent="Zoom in";}
  function showImage(){
    if(!gallery.length||!image||!caption||!counter||!prev||!next)return;
    const item=gallery[current];resetZoom();
    image.src=item.image.src;image.alt=item.image.alt;caption.textContent=item.caption.textContent?.trim()||"";
    counter.textContent=(current+1)+" of "+gallery.length;prev.disabled=next.disabled=gallery.length<2;
  }
  const move=(dir:number)=>{if(!gallery.length)return;current=(current+dir+gallery.length)%gallery.length;showImage();};
  if(dialog&&image&&caption&&counter&&close&&prev&&next&&zoom){
    all<HTMLElement>(".project-panel .lab-gallery").forEach(container=>{
      const items:Item[]=[];
      Array.from(container.querySelectorAll<HTMLElement>("figure")).forEach(figure=>{
        const img=figure.querySelector<HTMLImageElement>("img");
        const figcaption=figure.querySelector<HTMLElement>("figcaption");
        if(!img||!figcaption)return;
        let button=img.closest<HTMLButtonElement>(".lab-zoom-trigger");
        if(!button){
          button=document.createElement("button");button.type="button";button.className="lab-zoom-trigger";
          button.setAttribute("aria-label","Enlarge screenshot: "+img.alt);
          img.parentElement?.insertBefore(button,img);button.appendChild(img);
        }
        items.push({button,image:img,caption:figcaption});
      });
      items.forEach((item,i)=>item.button.addEventListener("click",()=>{
        trigger=item.button;gallery=items;current=i;showImage();
        if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
        close.focus();
      },{signal}));
    });
    close.addEventListener("click",()=>{if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");trigger?.focus();},{signal});
    prev.addEventListener("click",()=>move(-1),{signal});
    next.addEventListener("click",()=>move(1),{signal});
    zoom.addEventListener("click",()=>{
      const enlarged=!image.classList.contains("is-zoomed");image.classList.toggle("is-zoomed",enlarged);
      image.style.width=enlarged?Math.max(1100,Math.round((image.naturalWidth||900)*1.5))+"px":"";
      zoom.textContent=enlarged?"Fit to screen":"Zoom in";
    },{signal});
    image.addEventListener("click",()=>zoom.click(),{signal});
    dialog.addEventListener("keydown",e=>{
      if(e.key==="ArrowRight"){e.preventDefault();move(1);}
      if(e.key==="ArrowLeft"){e.preventDefault();move(-1);}
      if(e.key==="Escape"&&typeof dialog.close!=="function"){e.preventDefault();dialog.removeAttribute("open");trigger?.focus();}
    },{signal});
    dialog.addEventListener("click",e=>{if(e.target===dialog){if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");}},{signal});
    dialog.addEventListener("close",()=>{resetZoom();trigger?.focus();},{signal});
  }
  const revealTargets=all<HTMLElement>(".section .kicker,.section h2,.aboutgrid>*,.skillsgrid>.skillcard,.foldergrid>.folder");
  let observer:IntersectionObserver|null=null;
  if("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    revealTargets.forEach(el=>el.setAttribute("data-reveal",""));
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("is-visible");observer?.unobserve(entry.target);}
    }),{threshold:.08,rootMargin:"0px 0px -24px 0px"});
    root.classList.add("motion-ready");
    revealTargets.forEach(el=>observer?.observe(el));
  }
  return ()=>{ctrl.abort();observer?.disconnect();root.classList.remove("motion-ready");};
}
