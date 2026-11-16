/* Interactive portfolio demos: image lightbox and educational VLAN highlighting.
   No third-party scripts or live network operations are used. */
(() => {
  "use strict";
  const pickers = [...document.querySelectorAll("[data-vlan-filter]")];
  const topology = document.getElementById("vlan-topology");
  const status = document.getElementById("vlan-live-status");
  const vlanInfo = {
    all: "All six computers and both switches are shown. Select a VLAN to explore an example logical group.",
    "10": "VLAN 10 / Sales: example endpoints PC0 and PC3 are highlighted across two switches.",
    "20": "VLAN 20 / Engineering: example endpoints PC1 and PC4 are highlighted across two switches.",
    "30": "VLAN 30 / Guest: example endpoints PC2 and PC5 are highlighted across two switches."
  };
  pickers.forEach(btn => btn.addEventListener("click", () => {
    const chosen = btn.dataset.vlanFilter;
    if (!(chosen in vlanInfo) || !topology) return;
    topology.dataset.vlanView = chosen;
    pickers.forEach(b => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    if (status) status.textContent = vlanInfo[chosen];
  }));

  const dialog = document.getElementById("lab-lightbox");
  const display = document.getElementById("lab-lightbox-image");
  const caption = document.getElementById("lab-lightbox-caption");
  const counter = document.getElementById("lab-lightbox-counter");
  const zoom = document.getElementById("lab-lightbox-zoom");
  const close = document.getElementById("lab-lightbox-close");
  const prev = document.getElementById("lab-lightbox-prev");
  const next = document.getElementById("lab-lightbox-next");
  if (!dialog || !display || !caption || !counter || !zoom || !close || !prev || !next) return;
  let gallery = [];
  let current = 0;
  let trigger = null;

  function resetZoom() {
    display.classList.remove("is-zoomed");
    display.style.width = "";
    zoom.textContent = "Zoom in";
  }
  function showImage() {
    if (!gallery.length) return;
    const item = gallery[current];
    resetZoom();
    display.src = item.image.getAttribute("src");
    display.alt = item.image.alt;
    caption.textContent = item.caption.textContent.trim();
    counter.textContent = (current + 1) + " of " + gallery.length;
    prev.disabled = gallery.length < 2;
    next.disabled = gallery.length < 2;
  }
  function move(direction) {
    if (!gallery.length) return;
    current = (current + direction + gallery.length) % gallery.length;
    showImage();
  }
  document.querySelectorAll(".project-panel .lab-gallery").forEach(container => {
    const figures = [...container.querySelectorAll("figure")];
    const items = [];
    for (const figure of figures) {
      const img = figure.querySelector("img");
      const figcaption = figure.querySelector("figcaption");
      if (!img || !figcaption) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lab-zoom-trigger";
      button.setAttribute("aria-label", "Enlarge screenshot: " + img.alt);
      img.parentElement.insertBefore(button, img);
      button.appendChild(img);
      items.push({ button, image: img, caption: figcaption });
    }
    items.forEach((item, index) => item.button.addEventListener("click", () => {
      trigger = item.button;
      gallery = items;
      current = index;
      showImage();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      close.focus();
    }));
  });
  close.addEventListener("click", () => {
    if (typeof dialog.close === "function") dialog.close();
    else { dialog.removeAttribute("open"); if (trigger) trigger.focus(); }
  });
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  zoom.addEventListener("click", () => {
    const enlarged = !display.classList.contains("is-zoomed");
    display.classList.toggle("is-zoomed", enlarged);
    display.style.width = enlarged ? Math.max(1100, Math.round((display.naturalWidth || 900) * 1.5)) + "px" : "";
    zoom.textContent = enlarged ? "Fit to screen" : "Zoom in";
  });
  display.addEventListener("click", () => zoom.click());
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "Escape" && typeof dialog.close !== "function") {
      event.preventDefault();
      dialog.removeAttribute("open");
      if (trigger) trigger.focus();
    }
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  });
  dialog.addEventListener("close", () => { resetZoom(); if (trigger) trigger.focus(); });
})();
