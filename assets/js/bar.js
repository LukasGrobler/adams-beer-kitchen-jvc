/* Adam's Beer Kitchen JVC: "Pick your pour" on the homepage (9 Nov 2026).
   The house and premium drinks come from data.js > drinks. Tap one and a fresh glass slides
   along the bar and gets poured: foam on the beers, the Guinness settling from tan to black,
   ice and a garnish where the drink has them. Left alone, it pours one after another. */
(function () {
  "use strict";
  var root = document.querySelector("[data-pourbar]"), D = window.ABK_DATA;
  if (!root || !D || !D.drinks) return;
  var G = window.gsap;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* the glasses, drawn on a 240 x 340 bar. inner: where the drink goes. outline: the glass.
     rim / bottom: top and bottom of the inside. x: the inside's left and right. ice: cube spots [x, y, size, turn].
     g: where a garnish sits. sh: the shine on the glass. base: half the width of the foot (for the shadow). */
  var GLASS = {
    pint: { inner: "M66 64 L174 64 L162 318 Q161 322 156 322 L84 322 Q79 322 78 318 Z", outline: "M60 58 L180 58 L166 326 Q165 330 158 330 L82 330 Q75 330 74 326 Z",
      rim: 64, bottom: 322, x: [70, 170], ice: [[100, 116, 30, 12], [138, 126, 28, -10], [118, 154, 26, 20]], g: [174, 62], sh: "M73 84 L85 300", base: 46, level: .9 },
    highball: { inner: "M84 84 H156 V318 Q156 322 152 322 H88 Q84 322 84 318 Z", outline: "M78 80 H162 V326 Q162 330 158 330 H82 Q78 330 78 326 Z",
      rim: 84, bottom: 322, x: [88, 152], ice: [[104, 110, 30, 8], [138, 122, 28, -12], [118, 156, 30, 18], [102, 196, 28, -6], [138, 222, 26, 14]], g: [158, 84], sh: "M90 100 V302", base: 42, level: .86 },
    rocks: { inner: "M72 214 H168 L166 316 Q166 320 162 320 H78 Q74 320 74 316 Z", outline: "M66 210 H174 L172 326 Q172 330 168 330 H72 Q68 330 68 326 Z",
      rim: 214, bottom: 320, x: [78, 162], ice: [[104, 262, 34, 10], [140, 270, 30, -14], [122, 292, 30, 22]], g: [170, 212], sh: "M79 226 L81 304", base: 52, level: .62 },
    wine: { inner: "M80 94 C74 140 72 190 120 226 C168 190 166 140 160 94 Z", outline: "M76 90 C68 140 66 196 116 232 L116 322 C100 324 84 326 78 330 H162 C156 326 140 324 124 322 L124 232 C174 196 172 140 164 90 Z",
      rim: 94, bottom: 226, x: [82, 158], ice: [[104, 140, 26, 14], [136, 136, 24, -12], [120, 168, 24, 26]], g: [162, 92], sh: "M86 110 C84 150 90 180 104 200", base: 42, level: .5 },
    flute: { inner: "M101 74 C99 140 102 200 116 226 Q120 230 124 226 C138 200 141 140 139 74 Z", outline: "M97 70 C94 140 98 205 116 234 L116 322 C104 324 92 326 86 330 H154 C148 326 136 324 124 322 L124 234 C142 205 146 140 143 70 Z",
      rim: 74, bottom: 228, x: [104, 136], ice: [], g: [141, 72], sh: "M106 92 C105 140 107 180 113 206", base: 34, level: .82 },
    martini: { inner: "M58 114 H182 L122 206 Q120 209 118 206 Z", outline: "M50 110 H190 L124 212 L124 322 C140 324 152 326 158 330 H82 C88 326 100 324 116 322 L116 212 Z",
      rim: 114, bottom: 207, x: [64, 176], ice: [], g: [184, 112], sh: "M70 120 L104 168", base: 38, level: .82 },
    coupe: { inner: "M68 154 H172 C170 180 150 200 120 202 C90 200 70 180 68 154 Z", outline: "M62 150 H178 C176 184 152 206 124 208 L124 322 C140 324 152 326 158 330 H82 C88 326 100 324 116 322 L116 208 C88 206 64 184 62 150 Z",
      rim: 154, bottom: 202, x: [72, 168], ice: [], g: [174, 152], sh: "M78 160 C84 176 94 186 106 190", base: 38, level: .88 }
  };

  /* each drink: [glass, top colour, bottom colour, extras]. foam: head in px. fizz: bubbles. ice: cubes (1 = one big one).
     clear: see-through. garnish: lime, lemon, orange, mint, strawberry or berries. surge: settles from tan to black (Guinness). */
  var LAGER = ["pint", "#ffd862", "#d98c06", { foam: 16, fizz: 1 }];
  var DRINK = {
    "Singha": ["pint", "#ffd65a", "#d88a05", { foam: 16, fizz: 1 }],
    "Brooklyn": ["pint", "#f2a640", "#9c4c0e", { foam: 16, fizz: 1 }],
    "Tiger": LAGER,
    "Birra Moretti": ["pint", "#f8c24a", "#cf8206", { foam: 16, fizz: 1 }],
    "Heineken": LAGER,
    "Carlsberg": ["pint", "#ffe07a", "#dda216", { foam: 16, fizz: 1 }],
    "Budweiser": ["pint", "#f9d35c", "#d6900e", { foam: 14, fizz: 1 }],
    "Somersby": ["pint", "#f6dc86", "#d6a22a", { foam: 5, fizz: 1 }],
    "Vodka": ["rocks", "#f2f8ff", "#cfe0ec", { ice: 3, clear: 1 }],
    "White Rum": ["rocks", "#fbf6ea", "#e6dcc4", { ice: 3, clear: 1, garnish: "lime" }],
    "Gin": ["highball", "#f1f7f4", "#d2e4dc", { ice: 5, clear: 1, fizz: 1, garnish: "lime" }],
    "Pink Gin": ["highball", "#ffc2d6", "#f07aa0", { ice: 5, fizz: 1, garnish: "strawberry" }],
    "Whiskey": ["rocks", "#e3973a", "#8c4a10", { ice: 1, level: .5 }],
    "Cabernet Sauvignon": ["wine", "#9b1f33", "#4a0612", {}],
    "Merlot": ["wine", "#ad2c40", "#5e0c1a", {}],
    "Sauvignon Blanc": ["wine", "#f6eeb8", "#e3d27c", {}],
    "Rosé": ["wine", "#fbbcae", "#ec8c7c", {}],
    "Sparkling Wine": ["flute", "#f8eaae", "#e6cb6a", { fizz: 1 }],
    "Guinness": ["pint", "#2a160b", "#0c0604", { foam: 26, surge: 1 }],
    "Magners": ["pint", "#f6c75e", "#c98712", { foam: 4, fizz: 1, ice: 3 }],
    "Stella": ["pint", "#f7d25a", "#d9980f", { foam: 16, fizz: 1 }],
    "Amstel": ["pint", "#f8d35f", "#da9b12", { foam: 16, fizz: 1 }],
    "Peroni": ["pint", "#f9e27d", "#e2b22a", { foam: 14, fizz: 1 }],
    "Midway IPA": ["pint", "#f8b24c", "#c36a16", { foam: 18, fizz: 1 }],
    "Aperol Spritz": ["wine", "#ff9a3c", "#e2531a", { ice: 3, fizz: 1, garnish: "orange", level: .78 }],
    "Berry Martini": ["martini", "#d02a68", "#6e0f30", { garnish: "berries" }],
    "Mojito": ["highball", "#eef7d0", "#c3df86", { ice: 5, fizz: 1, clear: 1, garnish: "mint" }],
    "Cosmopolitan": ["martini", "#f6708a", "#c0263f", { garnish: "lime" }],
    "Strawberry Daiquiri": ["coupe", "#ff6a7d", "#cf2a44", { garnish: "strawberry" }],
    "Prosecco": ["flute", "#f9eeb6", "#ead47a", { fizz: 1 }]
  };
  /* anything added to data.js later still gets a sensible glass from its group */
  var BY_GROUP = {
    "Bottled beers": LAGER, "Draught beers": LAGER, "Premium draught": LAGER,
    "Spirits": ["rocks", "#f2f8ff", "#cfe0ec", { ice: 3, clear: 1 }], "Wines": ["wine", "#9b1f33", "#4a0612", {}],
    "Cocktails": ["martini", "#f6708a", "#c0263f", {}], "Bubbles": ["flute", "#f8eaae", "#e6cb6a", { fizz: 1 }]
  };
  function spec(name, group) { return DRINK[name] || BY_GROUP[group] || LAGER; }
  var PKG = { house: "House package", premium: "Premium package" };
  var NOTE = { house: "Everything in the House package. Tap a drink.", premium: "Premium gets all of this, plus everything in House." };
  var TAN = ["#b9824e", "#7c4b25"]; /* Guinness, just poured */

  /* ---------- the markup ---------- */
  function wavePath() { var d = "M-240 0"; for (var x = -240; x < 480; x += 60) d += " q15 -3.5 30 0 t30 0"; return d + " V440 H-240 Z"; }
  root.innerHTML =
    '<div class="pb-stage">' +
      '<div class="pb-bar" aria-hidden="true"></div>' +
      '<svg class="pb-svg" viewBox="0 0 240 340" aria-hidden="true"><defs>' +
        '<clipPath id="pbClip"><path class="pb-inner" d=""/></clipPath>' +
        '<linearGradient id="pbLiq" x1="0" y1="0" x2="0" y2="1"><stop class="pb-s1" offset="0"/><stop class="pb-s2" offset=".5"/></linearGradient>' +
        '<linearGradient id="pbFoam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ead2a0"/></linearGradient>' +
        '<linearGradient id="pbGlass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".2" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>' +
      '</defs>' +
      '<ellipse class="pb-shadow" cx="120" cy="331" rx="46" ry="6"/>' +
      '<g class="pb-glass">' +
        '<rect class="pb-stream" x="116" y="-400" width="8" height="0" rx="4"/>' +
        '<g clip-path="url(#pbClip)"><g class="pb-liq"><path class="pb-wave" fill="url(#pbLiq)" d="' + wavePath() + '"/><g class="pb-bubs"></g><g class="pb-foam"></g></g></g>' +
        '<g class="pb-ice"></g>' +
        '<path class="pb-outline" d="" fill="url(#pbGlass)"/>' +
        '<path class="pb-shine" d=""/>' +
        '<g class="pb-gar"></g>' +
      '</g></svg>' +
      '<div class="pb-label" aria-live="polite"><p class="pb-name"></p><p class="pb-meta"></p></div>' +
    '</div>' +
    '<div class="pb-panel">' +
      '<div class="pb-tabs" role="tablist" aria-label="Package"><button type="button" role="tab" aria-selected="true" data-pkg="house">House</button><button type="button" role="tab" aria-selected="false" data-pkg="premium">Premium</button></div>' +
      '<p class="pb-note"></p><div class="pb-groups"></div>' +
    '</div>';

  var glassG = $(".pb-glass"), liq = $(".pb-liq"), wave = $(".pb-wave"), foamG = $(".pb-foam"), bubG = $(".pb-bubs"),
    iceG = $(".pb-ice"), garG = $(".pb-gar"), stream = $(".pb-stream"), s1 = $(".pb-s1"), s2 = $(".pb-s2"), label = $(".pb-label");

  /* the glass always tips and slides around its foot. A fixed point, because GSAP nudges an element
     whose origin is a percentage of a box that changes size (every drink changes the glass's box) */
  if (G) G.set(glassG, { svgOrigin: "120 330", smoothOrigin: false });

  /* ---------- the pieces of a drink ---------- */
  function surfaceY(g, o) { return g.rim + (1 - (o.level || g.level)) * (g.bottom - g.rim); }
  function foamSvg(f, g) {
    var s = '<rect x="0" y="' + (-f) + '" width="240" height="' + (f + 4) + '" fill="url(#pbFoam)"/>';
    for (var x = g.x[0] - 6; x <= g.x[1] + 6; x += 9) s += '<circle cx="' + x + '" cy="' + (-f + 1) + '" r="' + (4 + (x * 7 % 5)) + '" fill="#fffaf0"/>';
    return s;
  }
  function bubblesSvg(g, depth) {
    var s = "";
    for (var i = 0; i < 18; i++) {
      var x = g.x[0] + 6 + Math.random() * (g.x[1] - g.x[0] - 12), y = 14 + Math.random() * Math.max(10, depth - 20);
      var rise = Math.min(y - 6, 40 + Math.random() * 90);
      s += '<circle class="pb-bub" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (1 + Math.random() * 1.8).toFixed(1) + '" style="--rise:' + rise.toFixed(0) + 'px;--d:' + (1.4 + Math.random() * 1.8).toFixed(2) + 's;--dl:-' + (Math.random() * 3).toFixed(2) + 's"/>';
    }
    return s;
  }
  function cube(x, y, z, r) {
    return '<g class="pb-cube"><g transform="translate(' + x + " " + y + ") rotate(" + r + ')"><rect x="' + (-z / 2) + '" y="' + (-z / 2) + '" width="' + z + '" height="' + z + '" rx="6"/><path d="M' + (-z / 2 + 6) + " " + (-z / 2 + 7) + " L" + (z / 2 - 9) + " " + (-z / 2 + 5) + '"/></g></g>';
  }
  function iceSvg(g, n) {
    if (n === 1) return cube(120, 288, 46, 8);
    return g.ice.slice(0, n).map(function (c) { return cube(c[0], c[1], c[2], c[3]); }).join("");
  }
  function wheel(rind, flesh) {
    var s = '<circle r="17" fill="' + rind + '"/><circle r="14" fill="' + flesh + '"/>';
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; s += '<line x2="' + (13 * Math.cos(a)).toFixed(1) + '" y2="' + (13 * Math.sin(a)).toFixed(1) + '" stroke="' + rind + '" stroke-opacity=".5" stroke-width="1.3"/>'; }
    return s + '<circle r="2.4" fill="#fffbe0"/>';
  }
  var GARNISH = {
    lime: function () { return wheel("#57a52a", "#d4ee86"); },
    lemon: function () { return wheel("#e8c11c", "#fff09a"); },
    orange: function () { return wheel("#ec7a10", "#ffc35a"); },
    strawberry: function () {
      var s = '<path d="M0 -12 C12 -15 19 -3 13 9 C9 17 3 21 0 23 C-3 21 -9 17 -13 9 C-19 -3 -12 -15 0 -12 Z" fill="#e5203c"/>';
      [[-6, -2], [5, -4], [-2, 7], [7, 7], [-8, 9], [1, 15]].forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1" ry="1.6" fill="#ffe08a"/>'; });
      return s + '<path d="M-9 -13 L0 -9 L9 -13 L5 -18 L0 -14 L-5 -18 Z" fill="#3f9b2f"/>';
    },
    berries: function () { return '<line x1="-44" y1="20" x2="24" y2="-24" stroke="#e9d4a0" stroke-width="2.4" stroke-linecap="round"/><circle cx="-20" cy="5" r="7.5" fill="#5b0f2e"/><circle cx="-7" cy="-4" r="7.5" fill="#7a1338"/><circle cx="6" cy="-13" r="7.5" fill="#4a0a25"/>'; },
    mint: function () { return '<path d="M0 30 L0 -6" stroke="#2f7a34" stroke-width="2"/><ellipse cx="-8" cy="-12" rx="7" ry="15" fill="#3aa24a" transform="rotate(-26 -8 -12)"/><ellipse cx="9" cy="-14" rx="7" ry="14" fill="#2e8b3e" transform="rotate(22 9 -14)"/><ellipse cx="0" cy="-24" rx="6" ry="12" fill="#4cbf5a"/>'; }
  };
  function garnishSvg(k, g) {
    var at = k === "mint" ? [108, g.rim - 4] : k === "berries" ? [120, g.rim - 6] : g.g, turn = k === "berries" ? 0 : -14;
    return '<g class="pb-garn"><g transform="translate(' + at[0] + " " + at[1] + ") rotate(" + turn + ')">' + GARNISH[k]() + "</g></g>";
  }

  /* lay out a glass for the drink, empty and ready to pour */
  function build(d) {
    var g = GLASS[d.s[0]], o = d.s[3];
    $(".pb-inner").setAttribute("d", g.inner);
    $(".pb-outline").setAttribute("d", g.outline);
    $(".pb-shine").setAttribute("d", g.sh);
    $(".pb-shadow").setAttribute("rx", g.base);
    var c = o.surge ? TAN : [d.s[1], d.s[2]];
    s1.setAttribute("stop-color", c[0]); s2.setAttribute("stop-color", c[1]);
    wave.setAttribute("fill-opacity", o.clear ? ".5" : "1");
    stream.setAttribute("fill", c[0]);
    stream.setAttribute("fill-opacity", o.clear ? ".6" : "1");
    foamG.innerHTML = o.foam ? foamSvg(o.foam, g) : "";
    bubG.innerHTML = o.fizz ? bubblesSvg(g, g.bottom - surfaceY(g, o)) : "";
    iceG.innerHTML = o.ice ? iceSvg(g, o.ice) : "";
    garG.innerHTML = o.garnish ? garnishSvg(o.garnish, g) : "";
  }
  function setLabel(d) {
    $(".pb-name", label).textContent = d.n;
    $(".pb-meta", label).textContent = d.group + " · " + PKG[d.pkg];
    if (G && !reduce) G.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, ease: "power3.out" });
  }
  function markChip(d) {
    Array.prototype.forEach.call(root.querySelectorAll(".pb-chip"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-n") === d.n && b.getAttribute("data-g") === d.group)); });
  }

  /* ---------- pouring ---------- */
  var tl = null, out = null, shown = false, timer = 0;
  function settle(d) { /* the finished drink, no animation */
    var g = GLASS[d.s[0]], o = d.s[3];
    build(d);
    if (o.surge) { s1.setAttribute("stop-color", d.s[1]); s2.setAttribute("stop-color", d.s[2]); }
    if (G) { G.set(liq, { y: surfaceY(g, o) }); G.set(glassG, { x: 0, rotation: 0, opacity: 1 }); }
    else liq.setAttribute("transform", "translate(0 " + surfaceY(g, o) + ")");
  }
  function pour(d) {
    clearTimeout(timer);
    if (tl) tl.kill();
    if (out) out.kill();
    markChip(d); setLabel(d);
    if (!G || reduce) { settle(d); shown = true; return; }
    if (shown) out = G.to(glassG, { x: -330, rotation: -7, opacity: 0, duration: .28, ease: "power2.in", onComplete: function () { pourIn(d); } });
    else pourIn(d);
    shown = true;
  }
  function pourIn(d) {
    var g = GLASS[d.s[0]], o = d.s[3], sy = surfaceY(g, o);
    build(d);
    G.set(liq, { y: g.bottom + 12 });
    G.set(stream, { attr: { y: -400, height: 0 } });
    if (o.foam) G.set(foamG, { scaleY: .15, transformOrigin: "50% 100%", smoothOrigin: false });
    tl = G.timeline({ onComplete: queue });
    tl.fromTo(glassG, { x: 330, rotation: 6, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: .5, ease: "power3.out" });
    var cubes = iceG.querySelectorAll(".pb-cube");
    if (cubes.length) tl.from(cubes, { y: -320, duration: .5, stagger: .07, ease: "bounce.out" }, "-=.12");
    var fill = Math.max(.75, Math.min(1.35, (g.bottom - sy) / 170));
    tl.to(stream, { attr: { height: 400 + g.bottom }, duration: .16, ease: "power1.in" })
      .to(liq, { y: sy, duration: fill, ease: "power1.inOut", onUpdate: function () { stream.setAttribute("height", Math.max(0, 400 + G.getProperty(liq, "y"))); } }, "-=.03");
    if (o.foam) tl.to(foamG, { scaleY: o.surge ? .45 : 1, duration: fill, ease: "power2.out" }, "<");
    tl.to(stream, { attr: { y: sy, height: 0 }, duration: .2, ease: "power2.in" });
    if (o.surge) {
      /* the Guinness surge: tan clears to black from the bottom up while the head settles */
      var p = { t: 0 }, a = G.utils.interpolate(TAN[0], d.s[1]), b = G.utils.interpolate(TAN[1], d.s[2]);
      tl.to(p, { t: 1, duration: 1.7, ease: "power1.inOut", onUpdate: function () { s1.setAttribute("stop-color", a(p.t)); s2.setAttribute("stop-color", b(p.t)); } }, "-=.05")
        .to(foamG, { scaleY: 1, duration: 1.4, ease: "power2.out" }, "<");
    }
    var gar = garG.querySelectorAll(".pb-garn");
    if (gar.length) tl.from(gar, { y: -150, rotation: -35, opacity: 0, duration: .55, ease: "back.out(2.2)", transformOrigin: "50% 50%", smoothOrigin: false }, o.surge ? "<" : "-=.05");
  }

  /* ---------- the drinks list ---------- */
  var pkg = "house", list = [], idx = -1, touched = false, live = false;
  function draw() {
    list = [];
    $(".pb-note").textContent = NOTE[pkg];
    $(".pb-groups").innerHTML = D.drinks[pkg].map(function (gr) {
      return '<div class="pb-group"><h3>' + esc(gr.group) + '</h3><div class="pb-chips">' + gr.items.map(function (n) {
        var s = spec(n, gr.group);
        list.push({ n: n, group: gr.group, pkg: pkg, s: s });
        var dot = s[3].surge ? "radial-gradient(circle at 50% 30%, #fff3dc 0 30%, #1a0d06 34%)" : "linear-gradient(" + s[1] + ", " + s[2] + ")";
        return '<button type="button" class="pb-chip" aria-pressed="false" data-n="' + esc(n) + '" data-g="' + esc(gr.group) + '"><i style="background:' + dot + '"></i>' + esc(n) + "</button>";
      }).join("") + "</div></div>";
    }).join("");
    Array.prototype.forEach.call(root.querySelectorAll(".pb-tab, [data-pkg]"), function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-pkg") === pkg)); });
  }
  function at(i) { idx = (i + list.length) % list.length; pour(list[idx]); }
  /* left alone and on screen, the bar keeps pouring */
  function queue() { clearTimeout(timer); if (!touched && live) timer = setTimeout(function () { at(idx + 1); }, 2300); }

  root.addEventListener("click", function (e) {
    var t = e.target.closest("[data-pkg]");
    if (t) { touched = true; if (t.getAttribute("data-pkg") !== pkg) { pkg = t.getAttribute("data-pkg"); draw(); at(0); } return; }
    var b = e.target.closest(".pb-chip");
    if (!b) return;
    touched = true;
    for (var i = 0; i < list.length; i++) if (list[i].n === b.getAttribute("data-n") && list[i].group === b.getAttribute("data-g")) { idx = i; pour(list[i]); break; }
  });

  draw();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      live = es[0].isIntersecting;
      root.classList.toggle("is-live", live);
      if (live && idx < 0) at(0);
      else if (live && !touched && !(tl && tl.isActive())) queue();
      else if (!live) clearTimeout(timer);
    }, { threshold: 0.45 }).observe($(".pb-stage"));
  } else { root.classList.add("is-live"); at(0); }
})();
