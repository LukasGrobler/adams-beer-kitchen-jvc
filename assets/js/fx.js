/* Adam's Beer Kitchen JVC: the finishing touches (9 Nov 2026).
   Hero video and fizz, the scroll line and the pint, light that follows the
   mouse, magnetic buttons, reveals, the footer name and the page curtain.
   All of it is decoration: if this file fails, the site still works. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(pointer: fine)").matches;
  var shot = /[?&]shot=/.test(location.search), novid = shot || /[?&]novid\b/.test(location.search); /* screenshot tools stall on video */
  var save = navigator.connection && navigator.connection.saveData;
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- the hero: the bar on video, tall clip on phones, wide on screens ---------- */
  var vid = $(".hero__vid");
  function whenSettled(fn) {
    function go() { if (document.getElementById("pour")) return setTimeout(go, 300); setTimeout(fn, 150); }
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  }
  if (vid && !reduce && !save && !novid) whenSettled(function () {
    var tall = innerWidth / innerHeight < 0.9;
    vid.poster = vid.getAttribute(tall ? "data-tall-poster" : "data-wide-poster");
    vid.src = vid.getAttribute(tall ? "data-tall" : "data-wide");
    vid.muted = true;
    vid.addEventListener("playing", function () { vid.classList.add("is-on"); }, { once: true });
    var p = vid.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: the still photo stays */ });
    /* pause it while it's off screen */
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var q = vid.play(); if (q && q.catch) q.catch(function () {}); } else vid.pause(); });
    }).observe(vid);
  });

  /* fizz: beer bubbles rising through the hero */
  var fz = $(".hero__fizz");
  if (fz && !reduce) (function () {
    var ctx = fz.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, bs = [], on = true;
    function size() { W = fz.width = fz.offsetWidth * dpr; H = fz.height = fz.offsetHeight * dpr; }
    function bub(any) {
      var r = (Math.random() * 2.6 + .6) * dpr;
      return { x: Math.random() * W, y: any ? Math.random() * H : H + r * 4, r: r, v: (Math.random() * .6 + .25) * dpr * (1 + r / (4 * dpr)), w: Math.random() * 6.28, a: Math.random() * .35 + .12 };
    }
    size();
    var n = innerWidth < 700 ? 20 : 38;
    for (var i = 0; i < n; i++) bs.push(bub(true));
    function tick() {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < bs.length; i++) {
        var b = bs[i];
        b.y -= b.v; b.w += .03; b.x += Math.sin(b.w) * .25 * dpr;
        if (b.y < -10) bs[i] = b = bub(false);
        ctx.globalAlpha = b.a * Math.min(1, b.y / (H * .5));
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283);
        ctx.strokeStyle = "rgba(255,226,160,.9)"; ctx.lineWidth = Math.max(1, b.r * .35); ctx.stroke();
        ctx.fillStyle = "rgba(255,236,190,.18)"; ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    addEventListener("resize", size);
    var seen = true;
    function wake() { var was = on; on = seen && !document.hidden; if (on && !was) requestAnimationFrame(tick); }
    document.addEventListener("visibilitychange", wake);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; wake(); }).observe(fz);
    requestAnimationFrame(tick);
  })();

  /* ---------- the scroll line under the header, and the pint that fills as you go ---------- */
  var bar = document.createElement("div");
  bar.className = "fx-bar"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var pint = document.createElement("button");
  pint.type = "button"; pint.className = "fx-pint"; pint.setAttribute("aria-label", "Back to the top");
  pint.innerHTML = '<span class="fx-pint__glass"><span class="fx-pint__beer"></span></span><span class="fx-pint__arrow"></span>';
  document.body.appendChild(pint);
  pint.addEventListener("click", function () {
    if (window.__lenis) window.__lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight, y = window.scrollY || 0;
      var sp = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      root.style.setProperty("--sp", sp.toFixed(4));
      pint.classList.toggle("is-on", y > 600);
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- the footer: the name, filling with gold ---------- */
  var ftr = $(".ftr");
  if (ftr && !$(".fx-mega", ftr)) {
    var mega = document.createElement("div");
    mega.className = "fx-mega"; mega.setAttribute("aria-hidden", "true");
    mega.textContent = root.lang === "ru" || root.lang === "ar" ? "Adam's Beer Kitchen" : "Adam's Beer Kitchen";
    ftr.appendChild(mega);
  }

  /* ---------- reveals: things rise in as they come into view ---------- */
  var RV = [
    ".sec-head", ".grid > *", ".season__card", ".menu-panel", ".icon-list li", ".frame",
    ".band", ".wall > *", ".special", ".panel", ".fx-mega", ".ftr__grid > *", ".prose > *", ".gallery button", ".vcard"
  ].join(",");
  if ("IntersectionObserver" in window && !reduce) {
    var els = $$(RV).filter(function (el) { return !el.closest(".hero, .week, .modal, .bt, .mnav, .lightbox, [hidden]"); });
    els = els.filter(function (el) { return !els.some(function (o) { return o !== el && o.contains(el); }); }); /* only the outermost of nested ones */
    if (shot) els.forEach(function (el) { if (el.classList.contains("fx-mega")) el.classList.add("in"); });
    else {
      els.forEach(function (el) { if (!el.classList.contains("fx-mega")) el.classList.add("rv"); });
      root.classList.add("fx-rv");
      var io = new IntersectionObserver(function (es) {
        var batch = es.filter(function (e) { return e.isIntersecting; });
        batch.forEach(function (e, i) {
          var el = e.target;
          io.unobserve(el);
          el.style.setProperty("--rvd", Math.min(i, 5) * 0.05 + "s");
          el.classList.add("in");
          /* once it's in, hand the element back to its own hover transitions */
          setTimeout(function () { el.classList.remove("rv", "in"); el.style.removeProperty("--rvd"); }, 800 + Math.min(i, 5) * 50);
        });
      }, { rootMargin: "0px 0px -4% 0px", threshold: 0.04 });
      els.forEach(function (el) { io.observe(el); });
      var mg = $(".fx-mega");
      if (mg) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { mg.classList.add("in"); o.disconnect(); } }, { threshold: 0.3 }).observe(mg);
    }
  }

  /* ---------- gold headings: one shine as each comes into view ---------- */
  if (!reduce && root.lang === "en" && "IntersectionObserver" in window) {
    var gold = $$(".phero__title, .d-xl, .sec-head .d-l, .menu-panel__title").filter(function (el) { return !el.closest(".band, .hero"); });
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { gio.unobserve(e.target); setTimeout(function () { e.target.classList.add("glint"); }, 350); } });
    }, { threshold: 0.6 });
    gold.forEach(function (el) { gio.observe(el); });
    whenSettled(function () { setTimeout(function () { $$(".hero__title .ln > span").forEach(function (el) { el.classList.add("glint"); }); }, 700); });
  }

  /* ---------- mouse only: the light, the card spotlight, magnetic buttons, the board's tilt ---------- */
  if (fine && !reduce) {
    var light = document.createElement("div");
    light.className = "fx-light"; light.setAttribute("aria-hidden", "true");
    document.body.appendChild(light);
    var mx = innerWidth / 2, my = innerHeight / 3, lx = mx, ly = my, running = false;
    function follow() {
      lx += (mx - lx) * .12; ly += (my - ly) * .12;
      light.style.transform = "translate3d(" + lx.toFixed(1) + "px," + ly.toFixed(1) + "px,0)";
      if (Math.abs(mx - lx) > .5 || Math.abs(my - ly) > .5) requestAnimationFrame(follow); else running = false;
    }
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      light.classList.add("is-on");
      if (!running) { running = true; requestAnimationFrame(follow); }
      var card = e.target.closest && e.target.closest(".panel--link, .season__card, .special, .vcard");
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { light.classList.remove("is-on"); });

    /* buttons lean towards the pointer */
    $$(".btn").forEach(function (b) {
      if (b.closest(".hdr, .mnav, .modal, .bt")) return;
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.translate = (dx * 10).toFixed(1) + "px " + (dy * 8).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });

    /* the chalkboard tilts a little with the mouse, like it's hanging on the wall */
    var side = $(".hero__side"), hero = $(".hero");
    if (side && hero) {
      side.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
      hero.addEventListener("pointermove", function (e) {
        var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        side.style.transform = "perspective(1000px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translate3d(" + (x * 10).toFixed(1) + "px," + (y * 8).toFixed(1) + "px,0)";
      });
      hero.addEventListener("pointerleave", function () { side.style.transform = ""; });
    }
  }

  /* ---------- page changes: the curtain comes up, then the next page lifts it ---------- */
  var cur = $(".fx-pt--out");
  if (cur) cur.addEventListener("animationend", function () { cur.remove(); });
  if (!reduce && !shot) document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("download") || a.hasAttribute("data-menu-open")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|sms|javascript):/i.test(href)) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    var c = document.createElement("div");
    c.className = "fx-pt fx-pt--in"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<img src="assets/img/logo.png" alt="" width="120" height="120">';
    document.body.appendChild(c);
    ss("abk_pt", "1");
    setTimeout(function () { location.href = url.href; }, 230);
  });
  /* coming back with the back button: drop any curtain left from leaving */
  addEventListener("pageshow", function (e) { if (e.persisted) $$(".fx-pt").forEach(function (c) { c.remove(); }); });
})();
