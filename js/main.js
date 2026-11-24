/* NAOPAKI — site behaviour. No libraries, no build step. */
/* All content is loaded from content/projects.json and content/site.json,
   which are edited with Pages CMS (see README). */
(async function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const path = v => String(v || "").trim().replace(/^\/+/, "");   // CMS may write "/assets/…"; the site lives in a sub-folder
  const lines = v => esc(v).replace(/\n/g, "<br>");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- load content ---------- */
  async function getJSON(url) {
    try {
      const r = await fetch(url, { cache: "no-cache" });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }   // e.g. index.html opened straight from disk
  }
  const [rawProjects, site, lookFile] = await Promise.all([
    getJSON("content/projects.json"), getJSON("content/site.json"), getJSON("content/look.json")
  ]);

  /* ---------- look & effects (content/look.json, "Look & effects" in Pages CMS) ---------- */
  const look = Object.assign({
    slideshow_transition: "flash", slideshow_contrast: "crushed", grain: "strong", scanlines: true,
    logo_glitch: true, hover_glitch: true, intro: "first-visit", cursor: "crosshair",
    gothic_headings: true, photo_tone: "crushed"
  }, lookFile || {});
  const html = document.documentElement;
  html.classList.add(
    "fx-grain-" + (look.grain || "subtle"),
    "tone-" + (look.photo_tone || "bw")
  );
  html.classList.toggle("fx-scanlines", look.scanlines !== false);
  html.classList.toggle("fx-hover-glitch", look.hover_glitch !== false);
  html.classList.toggle("fx-gothic-heads", look.gothic_headings !== false);
  html.classList.toggle("fx-cursor", look.cursor === "crosshair" && window.matchMedia("(pointer: fine)").matches);

  /* black-screen intro: the seal flickers on like a faulty light */
  (function intro() {
    const el = $("#intro");
    let seen = false;
    try { seen = localStorage.getItem("naopaki-intro") === "seen"; } catch (e) { /* storage blocked */ }
    const show = look.intro === "every-visit" || (look.intro === "first-visit" && !seen);
    if (!show || reduceMotion || location.hash.startsWith("#work/")) return;
    try { localStorage.setItem("naopaki-intro", "seen"); } catch (e) { /* ignore */ }
    el.hidden = false;
    setTimeout(() => el.classList.add("is-out"), 1700);
    setTimeout(() => { el.hidden = true; }, 2400);
    el.addEventListener("click", () => el.classList.add("is-out"));
  })();

  /* a YouTube or Vimeo link (or bare ID) → { type, id } */
  function parseVideoLink(link) {
    const s = String(link || "").trim();
    if (!s) return null;
    let m = s.match(/vimeo\.com\/(?:.*\/)?(\d+)/) || s.match(/^(\d{6,})$/);
    if (m) return { type: "vimeo", id: m[1] };
    m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
    if (m) return { type: "youtube", id: m[1] };
    return null;
  }

  /* colour treatments for project photos (brand-safe: greys only, no tints) */
  const TONES = { natural: "grayscale(0)", bw: "grayscale(1) contrast(1.15)", crushed: "grayscale(1) contrast(1.8) brightness(.85)" };
  const slugify = t => String(t || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  const used = {};
  const projects = (Array.isArray(rawProjects) ? rawProjects : []).filter(p => p && p.title).map(p => {
    let slug = slugify(p.title);
    if (used[slug]) slug += "-" + (++used[slug]); else used[slug] = 1;
    const media = (p.media || []).map(m => {
      if (!m) return null;
      if (m.image) return { type: "image", src: path(m.image), alt: p.title };
      const v = parseVideoLink(m.video_link);
      if (v) return v;
      if (m.video_file) return { type: "video", src: path(m.video_file) };
      return null;
    }).filter(Boolean);
    const firstImage = media.find(m => m.type === "image");
    const ownTone = ["natural", "bw", "crushed"].includes(p.colours) ? p.colours : "";
    return {
      slug, title: p.title, type: String(p.type || "PHOTO").toUpperCase(), year: p.year || "", line: p.line || "",
      cover: path(p.cover) || (firstImage ? firstImage.src : ""), media,
      coverTone: TONES[ownTone || look.photo_tone] || TONES.natural,   // cover in list / grid / hover
      photoTone: TONES[ownTone || "natural"]                            // photos inside the project
    };
  });

  /* ---------- site texts (About, contact) ---------- */
  if (site) {
    const a = site.about || {};
    if (a.statement) $("#about-statement").innerHTML = esc(a.statement).replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>");
    if (a.we_make) $("#about-we-make").innerHTML = lines(a.we_make);
    if (a.status) $("#about-status").innerHTML = lines(a.status);
    if (a.approach) $("#about-approach").innerHTML = lines(a.approach);
    const c = site.contact || {};
    if (c.email) { const mail = $("#contact-mail"); mail.href = "mailto:" + c.email.trim(); mail.textContent = c.email.trim().toUpperCase(); }
    const socials = [["Instagram", c.instagram], ["TikTok", c.tiktok], ["YouTube", c.youtube]].filter(([, v]) => v && v.link);
    if (c.instagram || c.tiktok || c.youtube) {
      $("#contact-social").innerHTML = socials.map(([name, v]) =>
        `<li><a href="${esc(v.link)}" target="_blank" rel="noopener">${name} <span>${esc(v.handle || "")}</span></a></li>`).join("");
    }
  }

  /* ---------- top bar look ---------- */
  if (site && site.top_bar) {
    const tb = site.top_bar, root = document.documentElement.style;
    const n = Number(tb.darkness);
    if (tb.darkness !== "" && tb.darkness != null && !isNaN(n)) root.setProperty("--bar-alpha", Math.min(100, Math.max(0, n)) / 100);
    if (tb.blur === false) root.setProperty("--bar-blur", "0px");
  }

  /* ---------- editable small texts (labels, marquee, footer) ---------- */
  const withSeps = t => esc(t).replace(/(\/|†|✝|✕|⛧|·)/g, '<span class="sep">$1</span>');
  const tx = (site && site.texts) || {};
  const setText = (sel, val) => { if (val != null && String(val).trim() !== "") $(sel).innerHTML = withSeps(val); };
  setText("#txt-bar", tx.top_bar_middle);
  setText("#txt-tagline", tx.hero_tagline);
  setText("#txt-corner-r", tx.hero_corner_right);
  setText("#txt-footer", tx.footer_line);
  if (tx.hero_corner_left != null && String(tx.hero_corner_left).trim() !== "") {
    $("#txt-corner-l").innerHTML = withSeps(tx.hero_corner_left).replace("{count}", '<span id="count-hero"></span>');
    if (!$("#count-hero")) $("#txt-corner-l").insertAdjacentHTML("beforeend", '<span id="count-hero" hidden></span>');
  }
  if (tx.marquee && String(tx.marquee).trim()) {
    const t = String(tx.marquee).trim() + " ";
    const tr = $(".marquee__track");
    tr.dataset.text = t;
    tr.innerHTML = `<span>${esc(t.repeat(4))}</span><span>${esc(t.repeat(4))}</span>`;
  }

  /* giant cropped word behind About (never the brand name: the logo is only ever the SVG) */
  (function bigWord() {
    const el = $("#about-bigword");
    const a = (site && site.about) || {};
    const word = String(a.background_word == null ? "" : a.background_word).trim();
    if (!word || /naopaki/i.test(word)) return;
    el.textContent = word;
    el.classList.add(a.background_word_style === "sans" ? "is-sans" : "is-gothic");
  })();

  /* optional ambient sound, muted until the visitor turns it on */
  (function sound() {
    const s = (site && site.sound) || {};
    const file = path(s.file);
    if (!file || s.enabled === false) return;
    const btn = $("#sound-toggle");
    const audio = new Audio(file);
    audio.loop = true; audio.preload = "none";
    audio.volume = Math.min(1, Math.max(0, (Number(s.volume) || 60) / 100));
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      btn.querySelector("span").textContent = on ? "[On]" : "[Off]";
      if (on) audio.play().catch(() => {}); else audio.pause();
    });
  })();

  /* logo glitch: a split-second monochrome tear every few seconds */
  if (look.logo_glitch !== false && !reduceMotion) {
    const logo = $(".hero__logo");
    const tick = () => {
      if (!document.hidden) {
        logo.classList.add("is-glitching");
        setTimeout(() => logo.classList.remove("is-glitching"), 260);
      }
      setTimeout(tick, 3500 + Math.random() * 4000);
    };
    setTimeout(tick, 2500);
  }

  /* ---------- hero slideshow ---------- */
  (function slideshow() {
    const box = $("#hero-slides");
    const cfg = (site && site.slideshow) || {};
    const imgs = (cfg.images || []).map(path).filter(Boolean);
    box.classList.toggle("is-bw", cfg.black_and_white !== false);
    box.classList.toggle("is-crushed", look.slideshow_contrast === "crushed");
    const mode = reduceMotion ? "fade" : (look.slideshow_transition || "fade");
    box.dataset.transition = mode;
    const flash = $("#hero-flash");
    if (!imgs.length) return;
    box.innerHTML = imgs.map((src, i) => `<div class="hero__slide${i === 0 ? " is-on" : ""}" style="background-image:url('${esc(src)}')"></div>`).join("");
    if (imgs.length < 2 || reduceMotion) return;
    const slides = $$(".hero__slide", box);
    const ms = Math.max(2, Number(cfg.seconds) || 5) * 1000;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      slides[i].classList.remove("is-on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-on");
      if (mode === "flash") { flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on"); }
    }, ms);
  })();

  /* ---------- counts & year ---------- */
  $("#count-hero").textContent = pad(projects.length, 3);
  $("#count-work").textContent = "[" + pad(projects.length) + "]";
  $("#year").textContent = new Date().getFullYear();

  /* ---------- endless marquee ----------
     One "half" is filled with the phrase until it is wider than the screen,
     then the half is duplicated; the track slides exactly one half and loops. */
  const track = $(".marquee__track");
  function buildMarquee() {
    const text = track.dataset.text;
    if (!text) return;
    track.innerHTML = "";
    const half = document.createElement("div");
    half.style.display = "flex";
    track.appendChild(half);
    do {
      const s = document.createElement("span");
      s.textContent = text;
      half.appendChild(s);
    } while (half.scrollWidth < window.innerWidth + 200 && half.children.length < 50);
    track.appendChild(half.cloneNode(true));
    track.style.setProperty("--marquee-time", (half.scrollWidth / 60) + "s"); // ~60px per second at any width
  }
  try { buildMarquee(); } catch (e) { /* keep the text already in the page */ }
  let mqTimer;
  window.addEventListener("resize", () => { clearTimeout(mqTimer); mqTimer = setTimeout(buildMarquee, 200); });

  /* ---------- build work list ---------- */
  const list = $("#work-list");
  list.innerHTML = projects.map((p, i) => `
    <li class="work__item" data-type="${esc(p.type)}" style="--tone:${p.coverTone}">
      <a href="#work/${p.slug}" data-index="${i}">
        <img class="work__thumb" src="${esc(p.cover)}" alt="" loading="lazy">
        <span class="work__num">${pad(i + 1)}</span>
        <span class="work__title">${esc(p.title)}</span>
        <span class="work__type">${esc(p.type)}</span>
        <span class="work__year">${esc(p.year)}</span>
        <span class="work__arrow">→</span>
      </a>
    </li>`).join("");

  /* ---------- filter & view toggles ---------- */
  $$("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    $$("[data-filter]").forEach(b => b.classList.toggle("is-on", b === btn));
    const f = btn.dataset.filter;
    $$(".work__item", list).forEach(li => li.classList.toggle("is-hidden", f !== "ALL" && li.dataset.type !== f));
  }));
  const setView = v => {
    list.dataset.view = v;
    $$("[data-view]").forEach(b => b.classList.toggle("is-on", b.dataset.view === v));
  };
  $$("[data-view]").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));

  /* ---------- cursor-following preview (list view, mouse only) ---------- */
  const preview = $("#hover-preview");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    let x = 0, y = 0, tx = 0, ty = 0, raf = null;
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      preview.style.left = x + "px"; preview.style.top = y + "px";
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    list.addEventListener("mousemove", e => {
      tx = e.clientX + 120; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    $$(".work__item a", list).forEach(a => {
      a.addEventListener("mouseenter", () => {
        if (list.dataset.view !== "list") return;
        preview.src = projects[a.dataset.index].cover;
        preview.style.setProperty("--tone", projects[a.dataset.index].coverTone);
        preview.classList.add("is-on");
      });
      a.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
    });
  }

  /* ---------- project view ---------- */
  const view = $("#project");
  const scroller = $("#project-scroll");
  let current = -1;
  let lastFocus = null;

  function mediaHTML(m) {
    if (m.type === "image") {
      return `<figure style="margin:0"><img src="${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy"></figure>`;
    }
    if (m.type === "youtube") {
      return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${m.id}?rel=0&modestbranding=1&color=white"
        title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    }
    if (m.type === "vimeo") {
      return `<div class="embed"><iframe src="https://player.vimeo.com/video/${m.id}?color=EEEDE7&title=0&byline=0&portrait=0&dnt=1"
        title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    if (m.type === "video") {
      return `<div class="embed"><video src="${esc(m.src)}" controls playsinline preload="metadata"></video></div>`;
    }
    return "";
  }

  function render(i) {
    const p = projects[i];
    current = i;
    document.title = p.title.toUpperCase() + " — NAOPAKI";
    $("#project-index").textContent = pad(i + 1) + " / " + pad(projects.length);
    $("#project-title").textContent = p.title;
    $("#project-meta").innerHTML = `<span>${esc(p.type)}</span><span>${esc(p.year)}</span>${p.line ? `<span>${esc(p.line)}</span>` : ""}`;
    const media = $("#project-media");
    media.innerHTML = p.media.map(mediaHTML).join("");
    media.style.setProperty("--tone", p.photoTone);
    // tall photos sit side by side in pairs; a tall photo without a partner is centred
    const imgs = $$("img", media);
    Promise.all(imgs.map(img => img.complete && img.naturalWidth ? Promise.resolve()
      : new Promise(r => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); })))
      .then(() => {
        if (current !== i) return;
        let run = [];
        const flush = () => { if (run.length % 2) run[run.length - 1].classList.replace("is-portrait", "is-solo"); run = []; };
        [...media.children].forEach(el => {
          const img = el.querySelector("img");
          if (img) img.classList.add("is-loaded");
          if (img && img.naturalHeight > img.naturalWidth) { el.classList.add("is-portrait"); run.push(el); }
          else flush();
        });
        flush();
      });
    const next = projects[(i + 1) % projects.length];
    $("#project-next").href = "#work/" + next.slug;
    $("#project-next-title").textContent = next.title;
    scroller.scrollTop = 0;
  }

  function open(i) {
    if (!view.classList.contains("is-open")) lastFocus = document.activeElement;
    render(i);
    view.hidden = false;
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add("is-open")));
    view.focus({ preventScroll: true });
  }

  function close() {
    if (view.hidden) return;
    view.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    $$("video, iframe", view).forEach(el => el.tagName === "VIDEO" ? el.pause() : (el.src = "about:blank"));
    document.title = "NAOPAKI — Visual Works";
    current = -1;
    setTimeout(() => { if (current === -1) view.hidden = true; }, 600);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  /* hash routing: #work/slug opens a project, so links are shareable */
  function route() {
    const m = location.hash.match(/^#work\/(.+)$/);
    if (m) {
      const i = projects.findIndex(p => p.slug === m[1]);
      if (i > -1) return open(i);
    }
    close();
  }
  window.addEventListener("hashchange", route);
  route();

  const goto = i => { location.hash = "work/" + projects[(i + projects.length) % projects.length].slug; };
  $("[data-close]", view).addEventListener("click", () => {
    history.pushState("", document.title, location.pathname + location.search + "#work");
    close();
  });
  $$("[data-step]", view).forEach(b => b.addEventListener("click", () => goto(current + Number(b.dataset.step))));

  document.addEventListener("keydown", e => {
    if (current === -1) return;
    if (e.key === "Escape") $("[data-close]", view).click();
    if (e.key === "ArrowRight") goto(current + 1);
    if (e.key === "ArrowLeft") goto(current - 1);
  });
})();
