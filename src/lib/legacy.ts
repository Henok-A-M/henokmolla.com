
import projects from "../legacy/projects.json";
import "../styles/explorers.css";
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

  // Keep the exploration controls alongside the original portfolio content.
  const additions: HTMLElement[] = [];
  function explorer(section: string, title: string) {
    const heading = root.querySelector("#" + section + " > h2");
    if (!heading) return null;
    const box = document.createElement("div");
    box.className = "section-explorer";
    const label = document.createElement("h3");
    label.textContent = title;
    const actions = document.createElement("div");
    actions.className = "explorer-actions";
    const output = document.createElement("p");
    output.setAttribute("aria-live", "polite");
    box.append(label, actions, output);
    heading.after(box);
    additions.push(box);
    return { box, actions, output };
  }
  function action(host: HTMLElement, text: string, run: () => void) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", run, { signal });
    host.append(button);
    return button;
  }
  type Chapter = [string, string, string?, number?];
  function chapters(section: string, title: string, entries: Chapter[]) {
    const ui = explorer(section, title);
    if (!ui) return;
    const links = document.createElement("div");
    links.className = "explorer-actions";
    ui.box.append(links);
    const show = (index: number) => {
      const [, story, destination, project] = entries[index];
      buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      ui.output.textContent = story;
      links.replaceChildren();
      if (destination) action(links, destination === "projects" ? "Explore the lab" : "Explore " + destination, () => {
        location.hash = destination;
        if (project !== undefined) root.querySelector<HTMLButtonElement>('[data-project="' + project + '"]')?.click();
      });
    };
    const buttons = entries.map(([name], i) => action(ui.actions, name, () => show(i)));
    show(0);
  }
  chapters("about", "Explore my story", [
    ["How I started", "Helping family troubleshoot phones and computers taught me to listen to the problem, test one change, and explain what worked."],
    ["What I practice", "In Packet Tracer, I work with switches and VLANs. In Wireshark, I follow packets to see what devices actually exchanged.", "projects", 1],
    ["Where I’m headed", "My goal is to become a network engineer or cybersecurity engineer. I’m building that foundation through coursework and hands-on labs.", "skills"],
  ]);
  chapters("skills", "See a skill in practice", [
    ["Segmentation", "Explore the two-switch topology and select a VLAN to highlight the example devices. The screenshots show which configuration steps I verified.", "projects", 0],
    ["Packet analysis", "Follow a TCP conversation in the Wireshark lab and open the capture screenshots for a closer look.", "projects", 1],
    ["Infrastructure", "My home lab gives me a place to practice network configuration and troubleshooting. Documentation is in progress.", "projects", 2],
  ]);
  chapters("experience", "Explore my journey", [
    ["Security operations", "In security operations I practice observing carefully, communicating clearly, and following procedures."],
    ["City University", "At City University of Seattle, my coursework connects communication and critical thinking with my technical studies.", "skills"],
    ["Year Up United", "On the Network Security track, I put networking concepts into practice through labs such as VLAN configuration.", "projects", 0],
  ]);
  const library = explorer("projects", "Find a project");
  if (library) {
    const search = document.createElement("input");
    search.type = "search";
    search.id = "portfolio-project-search";
    const label = document.createElement("label");
    label.htmlFor = search.id;
    label.textContent = "Search by project or tool";
    search.placeholder = "e.g. Wireshark";
    library.actions.before(label, search);
    const folders = all<HTMLButtonElement>("[data-project]");
    const plannedList = root.querySelector<HTMLDetailsElement>(".planned-projects");
    const labsTitle = root.querySelector<HTMLElement>(".lab-group-title");
    let group = "All";
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      let first: HTMLButtonElement | undefined;
      let selected = false;
      for (const button of folders) {
        const project = projects[Number(button.dataset.project)];
        if (!project) continue;
        const planned = project.tags.includes("Planned");
        const visible = (group === "All" || planned === (group === "Planned")) &&
          [project.title, project.folder, ...project.tags].join(" ").toLowerCase().includes(query);
        button.hidden = !visible;
        if (visible) {
          count++;
          first ??= button;
          selected ||= button.classList.contains("active");
        }
      }
      const matchingPlans = folders.filter(button => !button.hidden && button.closest(".planned-projects")).length;
      if (plannedList) {
        plannedList.hidden = matchingPlans === 0;
        plannedList.open = matchingPlans > 0 && (group === "Planned" || !!query);
      }
      if (labsTitle) labsTitle.hidden = count === matchingPlans;
      if (!count) panels.forEach(panel => panel.hidden = true);
      else if (!selected || panels.every(panel => panel.hidden)) first?.click();
      library.output.textContent = count ? count + (count === 1 ? " project" : " projects") : "No matching projects.";
      clearSearch.hidden = count > 0;
      filters.forEach(button => button.setAttribute("aria-pressed", String(button.textContent === group)));
    };
    const filters = ["All", "Hands-on", "Planned"].map(name => action(library.actions, name, () => { group = name; filter(); }));
    const clearSearch = action(library.actions, "Show all projects", () => {
      search.value = "";
      group = "All";
      filter();
      search.focus();
    });
    search.addEventListener("input", filter, { signal });
    folders.forEach(button => button.addEventListener("click", () => {
      if (button.hidden) { search.value = ""; group = "All"; filter(); }
    }, { signal }));
    filter();
  }
  const contact = explorer("contact", "Get in touch");
  const mail = root.querySelector<HTMLAnchorElement>("#contact a[href^='mailto:']");
  if (contact && mail) {
    const address = mail.href.slice(7);
    contact.output.textContent = address;
    action(contact.actions, "Copy email address", async () => {
      try {
        await navigator.clipboard.writeText(address);
        contact.output.textContent = "Copied " + address;
      } catch {
        contact.output.textContent = "Select and copy: " + address;
        const range = document.createRange();
        range.selectNodeContents(contact.output);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  }

  return ()=>{additions.forEach(el => el.remove());ctrl.abort();observer?.disconnect();root.classList.remove("motion-ready");};
}
