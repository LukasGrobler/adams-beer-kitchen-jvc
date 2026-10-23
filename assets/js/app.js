/* Adam's Beer Kitchen JVC: site behaviour.
   Everything time-based runs on Dubai time (UTC+4) and treats 12AM–3AM as
   part of the previous night, because that's how a bar's night works. */
(function () {
  "use strict";
  var D = window.ABK_DATA, V = D.venue, L = window.ABK_LAYOUT, I = L.icons;
  var LANG = L.lang || "en", TX = L.tx || null; /* Arabic / Russian page: words come from i18n.js */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); gsap.ticker.lagSmoothing(0); }

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAYS3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEK = [1, 2, 3, 4, 5, 6, 0];

  L.mountFooter();

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) {
    var m = typeof t === "number" ? t : toMin(t);
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (mm ? ":" + pad(mm) : "") + ap;
  }
  function span(s) { var a = toMin(s.start), b = toMin(s.end); if (b <= a) b += 1440; return [a, b]; }
  function dubai() {
    var d = new Date(Date.now() + 4 * 36e5);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay(), mins: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function addDays(y, m, d, n) { var x = new Date(Date.UTC(y, m, d) + n * 864e5); return { y: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate(), dow: x.getUTCDay() }; }
  function biz() {
    var t = dubai(), o = { dow: t.dow, mins: t.mins };
    if (t.mins < 180) { var p = addDays(t.y, t.m, t.d, -1); o.bdow = p.dow; o.bmins = t.mins + 1440; o.by = p.y; o.bm = p.m; o.bd = p.d; }
    else { o.bdow = t.dow; o.bmins = t.mins; o.by = t.y; o.bm = t.m; o.bd = t.d; }
    return o;
  }
  function today() { var b = biz(); return { y: b.by, m: b.bm, d: b.bd, dow: b.bdow }; }
  function iso(o) { return o.y + "-" + pad(o.m + 1) + "-" + pad(o.d); }
  function fromIso(s) { var p = s.split("-"); return addDays(+p[0], +p[1] - 1, +p[2], 0); }
  function longDate(o) { return DAYS[o.dow] + " " + o.d + " " + MONTHS[o.m]; }
  function shortDate(o) { return DAYS3[o.dow] + " " + o.d + " " + MON3[o.m]; }
  function nextOn(dow, endMin) {
    var b = biz(), add = (dow - b.bdow + 7) % 7;
    if (add === 0 && endMin != null && b.bmins >= endMin) add = 7;
    var o = addDays(b.by, b.bm, b.bd, add); o.add = add; return o;
  }
  function isOpen(b) { return b.bmins >= toMin(V.opens) && b.bmins < toMin(V.closes) + 1440; }
  function dur(m) { var h = Math.floor(m / 60), mm = m % 60; return (h ? h + "h " : "") + mm + "m"; }
  function img(name) { return "assets/img/ig/" + name + ".jpg"; }
  function waTo(text) { return "https://wa.me/" + V.whatsapp + "?text=" + encodeURIComponent(text); }
  function waShare(text) { return "https://wa.me/?text=" + encodeURIComponent(text); }
  function aed(n) { return typeof n === "number" ? "AED " + n : n; }
  function stars() { var s = ""; for (var i = 0; i < 5; i++) s += I.star; return '<span class="stars" aria-label="5 out of 5 stars">' + s + "</span>"; }
  function toast(msg) {
    var t = $(".toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }
  function allEntities() { return D.events.concat(D.offers, D.specials); }
  function find(slug) { return allEntities().filter(function (e) { return e.slug === slug; })[0]; }
  function eventSpan(e) {
    if (!e.slots) return null;
    var a = 1e9, b = 0;
    e.slots.forEach(function (s) { var x = span(s); a = Math.min(a, x[0]); b = Math.max(b, x[1]); });
    return [a, b];
  }
  function timeRange(e) { var x = eventSpan(e); return x ? fmt(x[0]) + " – " + fmt(x[1]) : ""; }
  function specialState(s) {
    var t = iso(today());
    if (t > s.to) return "past";
    return t >= s.from ? "on" : "soon";
  }

  /* ---------------- live status ---------------- */
  function liveStatus() {
    var b = biz(), open = isOpen(b), hh = V.happyHour[b.bdow], h0 = toMin(hh[0]), h1 = toMin(hh[1]);
    var s = { open: open, b: b, h0: h0, h1: h1 };
    if (TX) {
      s.openText = open ? TX.live.open : TX.live.opens;
      if (open && b.bmins >= h0 && b.bmins < h1) { s.hh = true; s.hhText = TX.live.hhOn.replace("{t}", fmtL(h1)); }
      else s.hhText = b.bmins < h0 ? TX.live.hhLater : TX.live.hhTomorrow;
      return s;
    }
    s.openText = open ? "Open now, till 3AM" : "Opens today at 12PM";
    if (open && b.bmins >= h0 && b.bmins < h1) { s.hh = true; s.hhText = "Happy hour on, ends in " + dur(h1 - b.bmins); }
    else if (b.bmins < h0) s.hhText = "Happy hour from 12PM today";
    else s.hhText = "Happy hour's back tomorrow at 12PM";
    return s;
  }
  /* a time in the page's language: "9 مساءً" in Arabic, "21:00" in Russian */
  function fmtL(m) {
    var h = Math.floor(m / 60) % 24, mm = m % 60;
    if (LANG === "ru") return pad(h) + ":" + pad(mm);
    if (LANG === "ar") {
      var h12 = h % 12 || 12, w = h === 0 ? "منتصف الليل" : h < 5 ? "فجرًا" : h < 12 ? "صباحًا" : h === 12 ? "ظهرًا" : "مساءً";
      return h12 + (mm ? ":" + pad(mm) : "") + " " + w;
    }
    return fmt(m);
  }
  function paintLive() {
    var s = liveStatus();
    $$("[data-open-pill]").forEach(function (p) { p.classList.toggle("is-open", s.open); var t = $("[data-open-text]", p); if (t) t.textContent = s.openText; });
    $$("[data-hh-pill]").forEach(function (p) { p.classList.toggle("is-hh", !!s.hh); var t = $("[data-hh-text]", p); if (t) t.textContent = s.hhText; });
    $$("[data-board-next]").forEach(paintNext);
    $$("[data-livecard]").forEach(renderLiveCard);
    paintTakeover();
  }

  /* ---------------- next-up countdown + live tonight ---------------- */
  function parseRange(t) {
    var re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi, m, out = [];
    while ((m = re.exec(t)) && out.length < 2) out.push((+m[1] % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + (+m[2] || 0));
    if (out.length === 2 && out[1] <= out[0]) out[1] += 1440;
    return out;
  }
  function paintNext(el) {
    var b = biz(), items = slotsFor(b.bdow), html = "";
    if (b.bmins < toMin(V.opens)) {
      var first = items[0];
      html = '<span class="board__next-row">' + (first ? "First up today: " + esc(first.s.label) + " at " + fmt(first.a) : "Doors open at 12PM") + "</span>";
    } else {
      var on = items.filter(function (it) { return b.bmins >= it.a && b.bmins < it.b; }).pop();
      var next = items.filter(function (it) { return it.a > b.bmins; })[0];
      if (on) html += '<span class="board__next-row is-on"><i aria-hidden="true"></i>On now: ' + esc(on.s.label) + ", till " + fmt(on.b) + "</span>";
      if (next) html += '<span class="board__next-row">Next up in <b>' + dur(next.a - b.bmins) + "</b>: " + esc(next.s.label) + "</span>";
      if (!on && !next) {
        var tm = slotsFor((b.bdow + 1) % 7)[0];
        html = '<span class="board__next-row">' + (tm ? "Tomorrow: " + esc(tm.s.label) + " from " + fmt(tm.a) : "Happy hour from 12PM tomorrow") + "</span>";
      }
    }
    el.innerHTML = html;
  }
  function renderLiveCard(el) {
    var b = biz(), rows = [];
    D.events.forEach(function (e) {
      if (e.days.indexOf(b.bdow) === -1 || !e.lineup) return;
      e.lineup.forEach(function (l) { var r = parseRange(l.time); rows.push({ a: D.artists[l.who], time: l.time, from: r[0], to: r[1] }); });
    });
    rows.sort(function (x, y) { return x.from - y.from; });
    rows = rows.filter(function (r) { return b.bmins < r.to; });
    if (!rows.length) { el.hidden = true; return; }
    el.hidden = false;
    var live = rows.some(function (r) { return b.bmins >= r.from && b.bmins < r.to; });
    var music = rows.some(function (r) { return /music|duo/i.test(r.a.role); });
    el.innerHTML = '<a class="livecard' + (live ? " is-live" : "") + '" href="live-music.html">' +
      '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<span class="livecard__txt"><b>' + (live ? "Live now" : music ? "Live tonight" : "Tonight") + "</b>" +
      rows.map(function (r) { return esc(r.a.name) + " <span>" + esc(r.time) + "</span>"; }).join(", then ") + "</span></a>";
  }

  /* ---------------- chalkboard ---------------- */
  function slotsFor(dow) {
    var out = [];
    D.events.forEach(function (e) {
      if (e.days.indexOf(dow) > -1 && e.slots) e.slots.forEach(function (s) { var x = span(s); out.push({ e: e, s: s, a: x[0], b: x[1] }); });
    });
    return out.sort(function (x, y) { return x.a - y.a || x.b - y.b; });
  }
  function renderBoard(el) {
    var st = liveStatus(), b = st.b, day = today();
    var title = b.bmins < 17 * 60 ? "Today" : "Tonight";
    var items = slotsFor(b.bdow);
    var rows = '<li class="board__item' + (st.open && b.bmins >= st.h1 ? " is-done" : "") + '"><span class="board__time">' + fmt(st.h0) + '</span><span class="board__what"><a href="happy-hour.html">Happy hour</a><small>till ' + fmt(st.h1) + "</small></span></li>";
    items.forEach(function (it) {
      var done = st.open && b.bmins >= it.b;
      rows += '<li class="board__item' + (done ? " is-done" : "") + '"><span class="board__time">' + fmt(it.a) + '</span><span class="board__what"><a href="' + it.e.slug + '.html">' + esc(it.s.label) + "</a>" + (it.s.price ? "<small>" + esc(it.s.price) + "</small>" : "<small>" + fmt(it.a) + " – " + fmt(it.b) + "</small>") + "</span></li>";
    });
    /* data-snaps="photo|caption,photo|caption": small polaroids pinned beside the title (first one gets the pushpin) */
    var snaps = (el.getAttribute("data-snaps") || "").split(",").filter(Boolean).map(function (s, i) {
      var p = s.split("|");
      return '<figure class="snap snap--' + (i ? "tape" : "pin") + '"><img src="' + img(p[0]) + '" alt=""><figcaption>' + esc(p[1] || "") + "</figcaption></figure>";
    }).join("");
    el.innerHTML =
      '<div class="board__slate">' +
      '<div class="board__head"><div class="board__headtxt">' +
      '<p class="board__title chalk">' + title + "</p>" +
      '<p class="board__date">' + longDate(day) + " at Adam's Beer Kitchen</p>" +
      '<p class="board__next chalk" data-board-next aria-live="polite"></p>' +
      "</div>" + (snaps ? '<div class="snaps" aria-hidden="true">' + snaps + "</div>" : "") + "</div>" +
      '<div class="board__rule"></div>' +
      '<ul class="board__list chalk' + (items.length > 4 ? " is-busy" : "") + '">' + rows + "</ul>" +
      '<div class="board__foot"><span class="board__hh chalk">' + (st.open ? "Doors open till 3AM" : "Doors open at 12PM") + '</span><a class="board__book" href="book.html?date=' + iso(day) + '">Book for ' + title.toLowerCase() + "</a></div>" +
      '<span class="board__chalkstick" aria-hidden="true"></span></div>';
  }

  /* ---------------- marquee ---------------- */
  var MARQUEE = ["Good food. Cold beer. Great vibes.", "Quiz night Tuesday", "Ladies night Wednesday", "Steak night Thursday", "Karaoke Friday", "Smoking Saturdays", "Sunday roast from AED 99", "Happy hour every day", "Live music five nights a week"];
  function renderMarquee(el, list) {
    var items = list || MARQUEE;
    var one = items.map(function (t) { return '<span class="marquee__item">' + I.hop + esc(t) + "</span>"; }).join("");
    el.innerHTML = '<div class="marquee__track" aria-hidden="true">' + one + one + "</div><p class=\"sr-only\">" + items.join(", ") + "</p>";
  }

  /* ---------------- the week scroller ---------------- */
  function nightData(dow) {
    if (dow === 5) {
      var f = D.fridayWeek;
      return { dow: 5, title: f.title, sub: "Brunches, karaoke and live music", img: f.img, link: "whats-on.html#day-5", book: "book.html?date=" + iso(nextOn(5, 26 * 60)), lines: f.lines };
    }
    var e = D.events.filter(function (x) { return x.days[0] === dow && x.week; })[0];
    return { dow: dow, title: e.week.title, sub: e.with, img: e.weekImg || e.img, link: e.slug + ".html", book: "book.html?event=" + e.slug, lines: e.week.lines };
  }
  function renderWeek(sec) {
    var track = $(".week__track", sec), dots = $(".week__dots", sec), pin = $(".week__pin", sec);
    var tdow = biz().bdow;
    track.innerHTML = WEEK.map(function (dow) {
      var n = nightData(dow);
      return '<article class="night' + (dow === tdow ? " is-today" : "") + '" data-dow="' + dow + '">' +
        (dow === tdow ? '<span class="stamp">Tonight</span>' : "") +
        '<div class="night__img"><img src="' + img(n.img) + '" alt="" loading="lazy"></div>' +
        '<div class="night__body"><h3 class="night__day">' + DAYS[dow] + "</h3>" +
        '<p class="night__name">' + esc(n.title) + '<span class="night__with">' + esc(n.sub || "") + "</span></p>" +
        '<ul class="night__facts">' + n.lines.map(function (l) { return "<li><b>" + esc(l[0]) + "</b>" + esc(l[1]) + "</li>"; }).join("") + "</ul>" +
        '<div class="night__cta"><a class="btn btn--sm" href="' + n.book + '">Book ' + DAYS[dow] + '</a><a class="btn btn--sm btn--ghost" href="' + n.link + '">See the night</a></div></div></article>';
    }).join("");
    /* a carousel with a left and a right arrow: the page itself always scrolls normally */
    var chev = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (d < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") + '"/></svg>'; };
    if (dots) dots.remove();
    var stage = document.createElement("div");
    stage.className = "week__stage";
    pin.parentNode.insertBefore(stage, pin);
    stage.appendChild(pin);
    stage.insertAdjacentHTML("beforeend", '<button class="week__side week__side--prev" type="button" data-dir="-1" aria-label="Previous day">' + chev(-1) + '</button><button class="week__side week__side--next" type="button" data-dir="1" aria-label="Next day">' + chev(1) + "</button>");

    var cards = $$(".night", track), arrows = $$("[data-dir]", sec), active = WEEK.indexOf(tdow);
    function setActive(i) { active = i; }
    function goTo(i, instant) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      var c = cards[i];
      pin.scrollTo({ left: c.offsetLeft - (pin.clientWidth - c.offsetWidth) / 2, behavior: instant || reduce ? "auto" : "smooth" });
      setActive(i);
    }
    function sync() {
      var mid = pin.scrollLeft + pin.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, k) { var dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
      setActive(best);
      var atStart = pin.scrollLeft <= 2, atEnd = pin.scrollLeft >= pin.scrollWidth - pin.clientWidth - 2;
      arrows.forEach(function (a) { a.disabled = +a.getAttribute("data-dir") < 0 ? atStart : atEnd; });
    }
    pin.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    sec.addEventListener("click", function (ev) {
      var a = ev.target.closest("[data-dir]");
      if (a) goTo(active + +a.getAttribute("data-dir"));
    });
    requestAnimationFrame(function () { goTo(WEEK.indexOf(tdow), true); sync(); });
  }

  /* ---------------- shared cards ---------------- */
  function evCard(e, opts) {
    opts = opts || {};
    var time = opts.time || timeRange(e) || e.facts && e.facts[0][1] || "";
    return '<a class="evcard" href="' + e.slug + '.html" data-cats="' + (e.cats || []).join(" ") + '">' +
      '<span class="evcard__img">' + (e.img ? '<img src="' + img(e.img) + '" alt="" loading="lazy">' : "") + "</span>" +
      '<span class="evcard__body"><span class="evcard__time">' + esc(time) + '</span><span class="evcard__name">' + esc(e.name) + '</span><span class="evcard__note">' + esc(e.short) + "</span></span></a>";
  }
  /* a special without a photo gets a type poster: data.js > type, or its name */
  function typeLines(e) { return e.type || [e.name, "at Adam's Beer Kitchen"]; }
  function specialCard(s) {
    var stt = specialState(s);
    if (stt === "past") return "";
    var T = (TX && s[LANG]) || s, SX = TX && TX.specials; /* Arabic and Russian words from data.js and i18n.js */
    return '<a class="special" href="' + s.slug + '.html">' +
      '<span class="special__img">' + (s.img ? '<img src="' + img(s.img) + '" alt="" loading="lazy">' : '<span class="ev-poster--type" style="display:grid;place-items:center;height:100%;text-align:center;padding:8px;background:radial-gradient(circle at 50% 30%,#3b2412,#1a110b 70%)"><span class="d-m c-yellow">' + esc(typeLines(s)[0]) + "</span></span>") + "</span>" +
      '<span style="display:grid;gap:8px"><span class="special__badge' + (stt === "soon" ? " special__badge--soon" : "") + '">' + (stt === "on" ? (SX ? SX.on : "On now") : (SX ? SX.soon : "Coming up")) + '</span><span class="d-m c-yellow">' + esc(T.name) + '</span><span class="kicker">' + esc(T.when) + '</span><span class="small">' + esc(T.short) + "</span></span>" +
      '<span class="btn btn--sm btn--brass">' + (SX ? SX.details : "See the details") + "</span></a>";
  }

  /* ---------------- what's on ---------------- */
  function renderWhatsOn(root) {
    var filters = [["all", "Everything"], ["drinks", "Brunch & drunch"], ["music", "Live music"], ["quiz", "Quiz & karaoke"], ["food", "Food deals"], ["deals", "Offers"]];
    var b = biz();
    var html = '<div class="filters" role="group" aria-label="Filter events">' + filters.map(function (f, i) {
      return '<button class="chip" type="button" data-f="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + "</button>";
    }).join("") + "</div>";
    html += '<div class="days">';
    html += '<div class="dayrow" id="every-day"><div class="dayrow__head"><h3 class="dayrow__day">Offers</h3><span class="dayrow__date">Open 12PM – 3AM</span></div><div class="dayrow__items">' +
      D.offers.map(function (o) { return evCard(o, { time: o.facts[0][1] + (o.slug === "happy-hour" ? " Sun – Thu" : "") }); }).join("") + "</div></div>";
    for (var i = 0; i < 7; i++) {
      var dt = addDays(b.by, b.bm, b.bd, i), dow = dt.dow;
      var evs = D.events.filter(function (e) { return e.days.indexOf(dow) > -1; });
      evs.sort(function (x, y) { return eventSpan(x)[0] - eventSpan(y)[0]; });
      html += '<div class="dayrow' + (i === 0 ? " is-today" : "") + '" id="day-' + dow + '"><div class="dayrow__head"><h3 class="dayrow__day">' + DAYS[dow] + '</h3><span class="dayrow__date">' + dt.d + " " + MONTHS[dt.m] + "</span>" +
        (i === 0 ? '<span class="dayrow__tag">' + (b.bmins < 17 * 60 ? "Today" : "Tonight") + "</span>" : "") +
        '</div><div class="dayrow__items">' + evs.map(function (e) { return evCard(e); }).join("") + "</div></div>";
    }
    html += "</div>";
    root.innerHTML = html;
    var chips = $$(".chip", root);
    root.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      $$(".evcard", root).forEach(function (card) { card.hidden = f !== "all" && card.getAttribute("data-cats").split(" ").indexOf(f) === -1; });
      $$(".dayrow", root).forEach(function (row) { row.hidden = !$$(".evcard", row).some(function (c2) { return !c2.hidden; }); });
    });
  }
  /* Grand Prix season (data.js > f1) sits with the specials until the last race */
  function f1Card() {
    var F = D.f1;
    if (!F) return [];
    var a = fromIso(F.from), b = fromIso(F.to);
    return [{ slug: "grand-prix", name: "Grand Prix season", from: F.from, to: F.to, img: F.img, ar: F.ar, ru: F.ru,
      when: (a.m === b.m ? a.d : a.d + " " + MONTHS[a.m]) + " – " + b.d + " " + MONTHS[b.m],
      short: "Every F1 race on the big screens, and F1 prizes to win with Heineken and Jack Daniel's." }];
  }
  function renderSpecials(el) {
    /* what's on now first, then the rest by start date */
    var key = function (s) { return (specialState(s) === "on" ? "0" : "1") + s.from; };
    var html = D.specials.concat(f1Card()).sort(function (a, b) { return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0; }).map(specialCard).join("");
    el.innerHTML = html || '<p class="empty">' + (TX && TX.specials ? TX.specials.none : "No specials on right now. Check back soon, or follow " + V.handle + " on Instagram.") + "</p>";
  }

  /* ---------------- event pages ---------------- */
  function priceTiles(p) {
    return '<span class="price"><span>House</span><b>' + p.house + '</b></span><span class="price price--hot"><span>Premium</span><b>' + p.premium + "</b></span>";
  }
  function icsStamp(dateObj, min) {
    var dt = new Date(Date.UTC(dateObj.y, dateObj.m, dateObj.d, 0, 0) + (min - 240) * 60000);
    return dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + "T" + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + "00Z";
  }
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function calendarFor(e) {
    var title = e.name + " at Adam's Beer Kitchen JVC", details = e.short + " Book: " + V.phoneDisplay + " (WhatsApp).", start, end, allDay = false, dateObj;
    if (e.slots) {
      var x = eventSpan(e); dateObj = nextOn(e.days[0], x[1]);
      start = icsStamp(dateObj, x[0]); end = icsStamp(dateObj, x[1]);
    } else if (e.from) {
      allDay = true;
      var f = fromIso(e.from), t2 = fromIso(e.to), endPlus = addDays(t2.y, t2.m, t2.d, 1), td = today();
      if (iso(td) > e.from && iso(td) <= e.to) f = td;
      start = iso(f).replace(/-/g, ""); end = iso(endPlus).replace(/-/g, "");
    } else return null;
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Adam's Beer Kitchen JVC//Website//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + e.slug + "-" + start + "@adamsbeerkitchen-jvc",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
      (allDay ? "DTSTART;VALUE=DATE:" : "DTSTART:") + start,
      (allDay ? "DTEND;VALUE=DATE:" : "DTEND:") + end,
      "SUMMARY:" + icsEsc(title), "LOCATION:" + icsEsc(V.addressLine), "DESCRIPTION:" + icsEsc(details),
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var g = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) + "&dates=" + start + "/" + end + "&details=" + encodeURIComponent(details) + "&location=" + encodeURIComponent(V.addressLine);
    return { ics: ics, google: g, file: e.slug + ".ics" };
  }
  function goodToKnow() {
    return '<ul class="icon-list">' +
      "<li>" + I.pin + '<div><h3>Floor 1, HE Hotel Apartments</h3><p>Take the lift to the first floor. First time? <a class="link" href="find-us.html" style="font-size:1rem">Read the 30-second guide</a></p></div></li>' +
      "<li>" + I.car + "<div><h3>Valet parking</h3><p>Pull up at the entrance and hand over the keys.</p></div></li>" +
      "<li>" + I.wa + "<div><h3>Book on WhatsApp</h3><p>Tables go quickly on event nights. Booking takes about 20 seconds.</p></div></li>" +
      "<li>" + I.clock + "<div><h3>Open daily 12PM – 3AM</h3><p>Happy hour every day from 12PM.</p></div></li></ul>";
  }
  function renderEvent(root) {
    var slug = root.getAttribute("data-event"), e = find(slug);
    if (!e) { root.innerHTML = '<section class="phero"><div class="wrap"><h1 class="d-xl phero__title">Not found</h1><p class="lede">This event isn\'t on the board any more. <a class="link" href="whats-on.html">See what\'s on</a></p></div></section>'; return; }
    var isEvent = !!e.slots, isSpecial = !!e.from, stt = isSpecial ? specialState(e) : null;
    var next = isEvent ? nextOn(e.days[0], eventSpan(e)[1]) : null;
    var bookHref = "book.html?event=" + e.slug;
    var bookLabel = isEvent ? (next.add === 0 ? "Book for tonight" : "Book for " + shortDate(next)) : "Book a table";
    var cal = calendarFor(e);
    var shareText = e.name + " at Adam's Beer Kitchen JVC. " + (e.dayLabel ? e.dayLabel + ", " : (e.when ? e.when + ". " : "")) + (isEvent ? timeRange(e) + ". " : "") + e.short + " Floor 1, HE Hotel Apartments, JVC. Instagram " + V.handle;
    var when = e.dayLabel || e.when || "";
    if (isSpecial) when = (stt === "on" ? "On now, " : stt === "past" ? "Finished, " : "Coming up, ") + e.when;

    var poster = e.img
      ? '<div class="frame frame--tilt ev-poster"><img src="' + img(e.img) + '" alt="' + esc(e.name) + ' at Adam\'s Beer Kitchen JVC"></div>'
      : '<div class="frame frame--tilt ev-poster ev-poster--type"><div><p class="d-xl c-yellow" style="line-height:.8">' + esc(typeLines(e)[0]) + '</p><p class="voice" style="margin-top:12px">' + esc(typeLines(e)[1]) + "</p></div></div>";

    var html =
      '<section class="ev-hero"><div class="wrap ev-hero__in"><div class="ev-hero__copy">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="whats-on.html">What\'s on</a> / ' + esc(e.name) + "</nav>" +
      '<p class="ev-when">' + esc(when) + "</p>" +
      '<h1 class="d-xl ev-title">' + esc(e.name) + "</h1>" +
      '<p class="ev-with">' + esc(e.with) + "</p>" +
      '<p class="lede">' + esc(e.intro) + "</p>" +
      (e.facts ? '<div class="ev-facts">' + e.facts.map(function (f) { return '<div class="ev-fact"><span>' + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>"; }).join("") + "</div>" : "") +
      '<div class="btn-row" style="margin-top:6px"><a class="btn" href="' + bookHref + '">' + bookLabel + "</a>" +
      (cal ? '<div class="cal-menu"><button class="btn btn--ghost" type="button" aria-expanded="false">' + I.cal + ' Add to calendar</button><div class="cal-menu__drop"><button type="button" data-ics>Apple or Outlook calendar</button><a href="' + cal.google + '" target="_blank" rel="noopener">Google Calendar</a></div></div>' : "") +
      '<a class="btn btn--ghost" href="' + waShare(shareText) + '" target="_blank" rel="noopener">' + I.share + " Send to a friend</a></div>" +
      "</div>" + poster + "</div></section>";

    /* the deal */
    var deal = "";
    if (e.deal) deal += '<div class="deal"><div><p class="deal__name">' + esc(e.name) + '</p><p class="deal__time">' + esc(e.deal.title) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>AED</span><b>' + e.deal.price + "</b></span></div></div>";
    if (e.deals) e.deals.forEach(function (d) { deal += '<div class="deal"><div><p class="deal__name">' + esc(d[0]) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>AED</span><b>' + d[1] + "</b></span></div></div>"; });
    if (e.packages) e.packages.forEach(function (p) { deal += '<div class="deal"><div><p class="deal__name">' + esc(p.name) + '</p><p class="deal__time">' + esc(p.time) + '</p></div><div class="deal__prices">' + priceTiles(p) + "</div></div>"; });
    if (e.vouchers) e.vouchers.forEach(function (v) { deal += '<div class="deal"><div><p class="deal__name">' + esc(v[0]) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>AED</span><b>' + esc(v[1]) + "</b></span></div></div>"; });
    if (!deal && e.facts) e.facts.forEach(function (f) { deal += '<div class="deal"><div><p class="deal__name">' + esc(f[0]) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>&nbsp;</span><b>' + esc(f[1]) + "</b></span></div></div>"; });
    html += '<section class="sec sec--tight"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">The deal</h2>' +
      (e.packages ? '<p class="lede">Packages come in two levels, House and Premium. The team will happily talk you through what\'s in each.</p>' : "") +
      (e.fine ? '<p class="small">' + esc(e.fine) + "</p>" : "") +
      '</div><div class="deals">' + deal + "</div></div></section>";

    /* a menu for the night, e.g. the BBQ brunch (data.js > menu) */
    if (e.menu) {
      html += '<section class="sec sec--tight" style="padding-top:0"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">' + esc(e.menuTitle || "On the menu") + '</h2></div><div class="menu-groups">' +
        e.menu.map(function (g) { return '<div class="menu-group"><h3 class="d-s">' + esc(g.name) + "</h3><ul>" + g.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" + (g.note ? '<p class="small">' + esc(g.note) + "</p>" : "") + "</div>"; }).join("") +
        "</div></div></section>";
    }

    /* who's on */
    if (e.lineup) {
      html += '<section class="sec sec--tight"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">Who\'s on</h2></div><ul class="lineup">' +
        e.lineup.map(function (l) { var a = D.artists[l.who]; return '<li><span class="lineup__who"><a href="live-music.html">' + esc(a.name) + '</a><span class="lineup__role">' + esc(a.role) + '</span></span><span class="lineup__time">' + esc(l.time) + "</span></li>"; }).join("") +
        "</ul></div></section>";
    }
    if (e.hallOfFame) html += '<section class="sec sec--tight"><div class="wrap wrap--narrow" data-hof></div></section>';
    if (e.hallOfFame) html += '<section class="sec sec--tight" style="padding-top:0"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">The league table</h2><p class="lede">Every Tuesday earns points. Here\x27s the top three.</p></div><div data-league-mini></div></div></section>';

    html += '<section class="sec sec--tight sec--wood"><div class="wrap split"><div><div class="sec-head"><h2 class="d-l">Good to know</h2></div>' + goodToKnow() + "</div>" +
      (e.img2 ? '<div class="frame frame--tall" style="max-width:420px;justify-self:center"><img src="' + img(e.img2) + '" alt="" loading="lazy"></div>' : '<div class="frame frame--tall" style="max-width:420px;justify-self:center"><img src="' + img("post-1") + '" alt="Inside Adam\'s Beer Kitchen JVC" loading="lazy"></div>') +
      "</div></section>";

    var others = D.events.filter(function (x) { return x.slug !== e.slug; }).slice(0);
    var startIdx = isEvent ? WEEK.indexOf(e.days[0]) : 0;
    others.sort(function (a, b) { return ((WEEK.indexOf(a.days[0]) - startIdx + 7) % 7) - ((WEEK.indexOf(b.days[0]) - startIdx + 7) % 7); });
    html += '<section class="sec"><div class="wrap"><div class="sec-head sec-head--row"><h2 class="d-l">More this week</h2><a class="link" href="whats-on.html">Full week</a></div><div class="grid grid--3">' +
      others.slice(0, 3).map(function (o) { return evCard(o); }).join("") + "</div></div></section>";
    html += '<section class="sec sec--flush"><div class="wrap"><div class="band"><div><h2 class="d-l">Save your seat</h2><p>' + (isEvent ? "Tables go fast on " + DAYS[e.days[0]] + "s. Send us a WhatsApp and the team will confirm." : "Send us a WhatsApp and the team will confirm your table.") + '</p></div><div class="btn-row"><a class="btn" href="' + bookHref + '">' + bookLabel + '</a><a class="btn btn--ghost" href="tel:' + V.phone + '">Call ' + V.phoneDisplay + "</a></div></div></div></section>";
    root.innerHTML = html;

    var cm = $(".cal-menu", root);
    if (cm) {
      var cb = $("button", cm);
      cb.addEventListener("click", function () { var o = cm.classList.toggle("is-open"); cb.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", function (ev) { if (!cm.contains(ev.target)) { cm.classList.remove("is-open"); cb.setAttribute("aria-expanded", "false"); } });
      $("[data-ics]", cm).addEventListener("click", function () {
        var blob = new Blob([cal.ics], { type: "text/calendar" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = cal.file; document.body.appendChild(a); a.click(); a.remove();
        cm.classList.remove("is-open"); toast("Calendar file saved. Open it to add the night.");
      });
    }

    /* structured data so Google can show the event */
    var ld = { "@context": "https://schema.org", "@type": "Event", name: e.name + " at Adam's Beer Kitchen JVC", description: e.intro,
      eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "BarOrPub", name: "Adam's Beer Kitchen JVC", telephone: V.phone, address: { "@type": "PostalAddress", streetAddress: V.address[0], addressLocality: "Jumeirah Village Circle, Dubai", addressCountry: "AE" } },
      organizer: { "@type": "Organization", name: "Adam's Beer Kitchen JVC" } };
    if (e.img) ld.image = img(e.img);
    if (isEvent) { var x = eventSpan(e); ld.startDate = iso(next) + "T" + pad(Math.floor(x[0] / 60) % 24) + ":" + pad(x[0] % 60) + "+04:00"; }
    else if (isSpecial) { ld.startDate = e.from; ld.endDate = e.to; }
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }

  /* ---------------- honours board ---------------- */
  function renderHof(el) {
    el.innerHTML = '<div class="honours"><p class="sample-note" style="margin-bottom:16px">Sample names, real winners added every Tuesday</p>' +
      '<h2 class="honours__title gold">Quiz Hall of Fame</h2><p class="honours__sub">Glory, bragging rights and prizes up to AED 2,000</p>' +
      '<ol class="honours__list">' + D.hallOfFame.map(function (h) { return '<li><span class="honours__date">' + esc(h[0]) + '</span><span class="honours__team gold">' + esc(h[1]) + "</span></li>"; }).join("") + "</ol>" +
      '<figure class="polaroid honours__photo" style="--r:2deg"><img src="' + img("post-8") + '" alt="Quiz night winners at Adam\'s Beer Kitchen JVC" loading="lazy"><figcaption>Real winners, real prize</figcaption></figure></div>';
  }

  /* ---------------- brunch finder ---------------- */
  function parseStart(t) { var m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(t); if (!m) return 0; var h = +m[1] % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0); return h * 60 + (+m[2] || 0); }
  function brunches() {
    var out = [];
    D.events.forEach(function (e) {
      (e.packages || []).forEach(function (p) {
        if (/brunch|drunch/i.test(p.name)) out.push({ e: e, p: p, dow: e.days[0], start: parseStart(p.time) });
      });
    });
    return out.sort(function (a, b) { return WEEK.indexOf(a.dow) - WEEK.indexOf(b.dow) || a.start - b.start; });
  }
  function renderFinder(root) {
    var list = brunches(), state = { day: "any", time: "any", max: 279 };
    var dayOpts = [["any", "Any day"]].concat([2, 4, 5, 6, 0].map(function (d) { return [String(d), DAYS[d]]; }));
    var timeOpts = [["any", "Any time"], ["day", "Afternoon"], ["eve", "Evening"], ["late", "Late night"]];
    function chips(name, opts) { return '<div class="finder__chips" data-group="' + name + '">' + opts.map(function (o, i) { return '<button class="chip" type="button" data-v="' + o[0] + '" aria-pressed="' + (i === 0) + '">' + o[1] + "</button>"; }).join("") + "</div>"; }
    root.innerHTML =
      '<div class="finder"><div class="finder__controls">' +
      '<div class="finder__group"><span class="finder__label">Which day?</span>' + chips("day", dayOpts) + "</div>" +
      '<div class="finder__group"><span class="finder__label">What time?</span>' + chips("time", timeOpts) + "</div>" +
      '<div class="finder__group"><label class="finder__label" for="budget">Budget per person</label><input class="range" id="budget" type="range" min="149" max="279" step="10" value="279"><div class="finder__budget"><span>AED 149</span><b data-budget>Up to AED 279</b></div></div>' +
      '<p class="small" style="margin:0">Budget uses the House price. Premium is the upgraded package.</p>' +
      '</div><div><p class="finder__count" aria-live="polite" data-count></p><div class="finder__results" data-results></div></div></div>';
    function draw() {
      var res = list.filter(function (x) {
        if (state.day !== "any" && String(x.dow) !== state.day) return false;
        if (state.time === "day" && x.start >= 17 * 60) return false;
        if (state.time === "eve" && (x.start < 17 * 60 || x.start >= 20 * 60)) return false;
        if (state.time === "late" && x.start < 20 * 60) return false;
        return x.p.house <= state.max;
      });
      $("[data-count]", root).textContent = res.length ? res.length + (res.length === 1 ? " brunch fits" : " brunches fit") : "Nothing fits yet";
      $("[data-results]", root).innerHTML = res.length ? res.map(function (x) {
        return '<article class="bcard"><span class="bcard__day">' + DAYS[x.dow] + ", " + esc(x.p.time) + '</span><h3 class="bcard__name">' + esc(x.p.name) + '</h3><p class="bcard__note">Part of ' + esc(x.e.name) + (/^(with|and) /.test(x.e.with) ? " " : ". ") + esc(x.e.with) + '.</p><div class="bcard__prices">' + priceTiles(x.p) + '</div><div class="bcard__cta"><a class="btn btn--sm" href="book.html?event=' + x.e.slug + "&pkg=" + encodeURIComponent(x.p.name) + '">Book this</a><a class="btn btn--sm btn--ghost" href="' + x.e.slug + '.html">Details</a></div></article>';
      }).join("") : '<p class="empty">Nothing matches those picks. Try another day, or nudge the budget up. Sunday roast starts at AED 99 if you\'re after a bargain.</p>';
    }
    root.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      var g = c.parentNode; state[g.getAttribute("data-group")] = c.getAttribute("data-v");
      $$(".chip", g).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      draw();
    });
    $("#budget", root).addEventListener("input", function (ev) { state.max = +ev.target.value; $("[data-budget]", root).textContent = "Up to AED " + state.max; draw(); });
    draw();
  }

  /* ---------------- artists ---------------- */
  function artistSlots() {
    var map = {};
    WEEK.forEach(function (dow) {
      D.events.forEach(function (e) {
        if (e.days[0] !== dow || !e.lineup) return;
        e.lineup.forEach(function (l) { (map[l.who] = map[l.who] || []).push({ dow: dow, time: l.time, e: e }); });
      });
    });
    return map;
  }
  function renderArtists(el) {
    var map = artistSlots();
    el.innerHTML = Object.keys(D.artists).map(function (k) {
      var a = D.artists[k], sl = map[k] || [];
      return '<article class="artist"><span class="artist__initials" aria-hidden="true">' + esc(a.initials) + '</span><span class="artist__role">' + esc(a.role) + '</span><h3 class="artist__name">' + esc(a.name) + '</h3><ul class="artist__slots">' +
        sl.map(function (s) { return '<li><a href="' + s.e.slug + '.html"><span>' + DAYS[s.dow] + ", " + esc(s.e.name) + "</span><span>" + esc(s.time) + "</span></a></li>"; }).join("") + "</ul></article>";
    }).join("");
  }
  function renderLineupWeek(el) {
    var rows = [];
    WEEK.forEach(function (dow) {
      D.events.forEach(function (e) {
        if (e.days[0] !== dow || !e.lineup) return;
        e.lineup.forEach(function (l) { var a = D.artists[l.who]; rows.push('<li><span class="lineup__who"><a href="' + e.slug + '.html">' + esc(a.name) + '</a><span class="lineup__role">' + DAYS[dow] + ", " + esc(e.name) + '</span></span><span class="lineup__time">' + esc(l.time) + "</span></li>"); });
      });
    });
    el.innerHTML = '<ul class="lineup">' + rows.join("") + "</ul>";
  }

  /* ---------------- reviews ---------------- */
  function quote(r, big) {
    return '<figure class="quote' + (big ? " quote--big" : "") + '" style="margin:0">' + stars() + '<blockquote class="quote__text">' + esc(r.text) + '</blockquote><figcaption class="quote__who"><span class="quote__name">' + esc(r.name) + '</span><span class="quote__src">' + esc(r.meta) + ", Google review</span></figcaption></figure>";
  }
  function renderReviews(el) {
    var f = D.reviews.filter(function (r) { return r.featured; })[0], rest = D.reviews.filter(function (r) { return !r.featured; });
    el.innerHTML = quote(f, true) + '<div class="reviews-cols" style="margin-top:28px">' + rest.map(function (r) { return quote(r); }).join("") + "</div>";
  }
  function renderReviewsMini(el) {
    var f = D.reviews.filter(function (r) { return r.featured; })[0];
    var two = D.reviews.filter(function (r) { return !r.featured; }).slice(0, 2);
    el.innerHTML = quote(f, true) + '<div class="grid grid--2" style="margin-top:22px">' + two.map(function (r) { return quote(r); }).join("") + "</div>";
  }

  /* ---------------- gallery, wall, lightbox ---------------- */
  var lb, lbItems = [], lbIdx = 0;
  function openLb(items, i) {
    lbItems = items; lbIdx = i;
    if (!lb) {
      document.body.insertAdjacentHTML("beforeend", '<div class="lightbox" role="dialog" aria-modal="true" aria-label="Photo"><button class="lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox__next" type="button" aria-label="Next photo">&#8250;</button><button class="lightbox__close" type="button" aria-label="Close">&times;</button></div>');
      lb = $(".lightbox");
      $(".lightbox__prev", lb).addEventListener("click", function () { showLb(lbIdx - 1); });
      $(".lightbox__next", lb).addEventListener("click", function () { showLb(lbIdx + 1); });
      $(".lightbox__close", lb).addEventListener("click", closeLb);
      lb.addEventListener("click", function (ev) { if (ev.target === lb) closeLb(); });
      document.addEventListener("keydown", function (ev) {
        if (!lb.classList.contains("is-open")) return;
        if (ev.key === "Escape") closeLb(); if (ev.key === "ArrowLeft") showLb(lbIdx - 1); if (ev.key === "ArrowRight") showLb(lbIdx + 1);
      });
    }
    showLb(i); lb.classList.add("is-open"); $(".lightbox__close", lb).focus();
  }
  function showLb(i) { lbIdx = (i + lbItems.length) % lbItems.length; var it = lbItems[lbIdx]; $("img", lb).src = img(it.img); $("img", lb).alt = it.cap; $("figcaption", lb).textContent = it.cap; }
  function closeLb() { lb.classList.remove("is-open"); }
  function renderGallery(el) {
    el.innerHTML = D.gallery.map(function (g, i) { return '<button type="button" data-i="' + i + '"><img src="' + img(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"><span class="gallery__cap">' + esc(g.cap) + "</span></button>"; }).join("");
    el.addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (b) openLb(D.gallery, +b.getAttribute("data-i")); });
  }
  function renderWall(el) {
    var n = +(el.getAttribute("data-wall") || 8), rot = [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 2];
    var picks = D.gallery.filter(function (g) { return ["post-2", "post-4", "post-11"].indexOf(g.img) === -1; }).slice(0, n);
    el.innerHTML = picks.map(function (g, i) { return '<button type="button" class="polaroid" style="--r:' + rot[i % rot.length] + 'deg" data-i="' + i + '"><img src="' + img(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"><span class="polaroid__cap">' + esc(g.cap) + "</span></button>"; }).join("") +
      '<p class="wall__cta">Tag <a href="' + V.instagram + '" target="_blank" rel="noopener">' + V.handle + "</a> on Instagram and you might end up pinned here.</p>";
    el.addEventListener("click", function (ev) { var b = ev.target.closest(".polaroid"); if (b) openLb(picks, +b.getAttribute("data-i")); });
  }

  /* ---------------- crew ---------------- */
  function renderCrew(el) {
    el.innerHTML = D.crew.map(function (c) { return '<article class="crew"><span class="crew__badge" aria-hidden="true">' + esc(c.initials) + '</span><h3 class="crew__name">' + esc(c.name) + '</h3><span class="crew__role">' + esc(c.role) + "</span><p>" + esc(c.line) + "</p></article>"; }).join("");
  }

  /* ---------------- booking ---------------- */
  function renderBook(form) {
    var q = new URLSearchParams(location.search);
    var name = $("#bk-name", form), date = $("#bk-date", form), time = $("#bk-time", form), guests = $("#bk-guests", form), seat = $("#bk-seat", form), notes = $("#bk-notes", form);
    var choices = $("[data-choices]", form), preview = $("[data-wa-preview]"), msg = $("[data-book-msg]", form);
    var visit = $("[data-visit]", form), visitNote = $("[data-visit-note]", form);
    var chosen = null, extra = "", been = "";
    var t0 = today();
    date.min = iso(t0); date.value = iso(t0);
    var times = [];
    for (var m = 12 * 60; m <= 26 * 60; m += 30) times.push(m);
    time.innerHTML = times.map(function (m2) { return '<option value="' + m2 + '">' + fmt(m2) + "</option>"; }).join("");
    time.value = String(19 * 60);

    function drawChoices() {
      var d = fromIso(date.value || iso(t0));
      var evs = D.events.filter(function (e) { return e.days.indexOf(d.dow) > -1; });
      var html = '<button class="chip" type="button" data-slug="" aria-pressed="' + (!chosen) + '">Just a table</button>' +
        evs.map(function (e) { return '<button class="chip" type="button" data-slug="' + e.slug + '" aria-pressed="' + (chosen === e.slug) + '">' + esc(e.name) + " at " + fmt(eventSpan(e)[0]) + "</button>"; }).join("");
      choices.innerHTML = html;
      if (chosen && !evs.some(function (e) { return e.slug === chosen; })) { chosen = null; drawChoices(); }
    }
    function message() {
      var d = fromIso(date.value || iso(t0)), e = chosen ? find(chosen) : null;
      var lines = ["Hi Adam's Beer Kitchen! I'd like to book a table.", "",
        "Name: " + (name.value.trim() || "…"),
        "Date: " + longDate(d),
        "Time: " + fmt(+time.value),
        "Guests: " + guests.value];
      if (been) lines.push("Visit: " + been);
      if (e) lines.push("For: " + e.name);
      if (extra) lines.push(extra);
      if (seat.value !== "No preference") lines.push("Seating: " + seat.value);
      if (notes.value.trim()) lines.push("Notes: " + notes.value.trim());
      lines.push("", "Sent from the Adam's Beer Kitchen website");
      return lines.join("\n");
    }
    function update() { preview.textContent = message(); }

    var ev0 = q.get("event") && find(q.get("event"));
    if (ev0) {
      if (ev0.slots) {
        var nx = nextOn(ev0.days[0], eventSpan(ev0)[1]); date.value = iso(nx); chosen = ev0.slug;
        var st = eventSpan(ev0)[0]; if (st >= 12 * 60) time.value = String(Math.round(st / 30) * 30);
      } else extra = "Interested in: " + ev0.name;
    }
    if (q.get("date")) { var qd = q.get("date"); if (/^\d{4}-\d{2}-\d{2}$/.test(qd) && qd >= iso(t0)) date.value = qd; }
    if (q.get("pkg")) extra = "Package: " + q.get("pkg");

    drawChoices(); update();
    choices.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      chosen = c.getAttribute("data-slug") || null;
      if (chosen) { var e = find(chosen), st2 = eventSpan(e)[0]; if (st2 >= 12 * 60) time.value = String(Math.round(st2 / 30) * 30); }
      drawChoices(); update();
    });
    date.addEventListener("change", function () { drawChoices(); update(); });
    /* first time or been before: optional; tap the chosen one again to clear it */
    if (visit) visit.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      been = been === c.getAttribute("data-v") ? "" : c.getAttribute("data-v");
      $$(".chip", visit).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === been)); });
      if (visitNote) visitNote.hidden = been !== "First time here";
      update();
    });
    [name, time, seat, notes].forEach(function (x) { x.addEventListener("input", update); x.addEventListener("change", update); });
    $$("[data-step]", form).forEach(function (b) {
      b.addEventListener("click", function () { var v = Math.min(60, Math.max(1, (+guests.value || 1) + +b.getAttribute("data-step"))); guests.value = v; update(); });
    });
    guests.addEventListener("input", update);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!name.value.trim()) { msg.textContent = "Add your name so the team knows who's coming."; name.focus(); return; }
      if (!date.value || date.value < iso(t0)) { msg.textContent = "Pick today or a date in the future."; date.focus(); return; }
      msg.textContent = "Opening WhatsApp with your booking. Hit send and the team will confirm.";
      window.open(waTo(message()), "_blank", "noopener");
    });
  }

  function renderMatchday(form) {
    var t0 = today(), dt = $("#md-date", form);
    dt.min = iso(t0); dt.value = iso(t0);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var match = $("#md-match", form).value.trim() || "the big match", n = $("#md-guests", form).value || "2";
      var text = "Hi Adam's Beer Kitchen! I'd like a table to watch " + match + " on " + longDate(fromIso(dt.value)) + " for " + n + " people. Somewhere with a good view of the screens, please.";
      window.open(waTo(text), "_blank", "noopener");
    });
  }

  /* ---------------- menus (PDFs arrive after launch) ---------------- */
  function menuModal() {
    var copy = {
      food: ["Food menu", "The full food menu lands here as soon as the kitchen sends the latest version. Want it right now? Ask on WhatsApp and we'll send it over."],
      drinks: ["Drinks menu", "Beers on tap, towers, cocktails and the rest. The full drinks list is on its way to this page. Ask on WhatsApp and we'll send it straight away."],
      room: ["Room service menu", "Staying at HE Hotel Apartments? Our kitchen delivers to your room. Ask on WhatsApp for the room service menu."]
    };
    $$("[data-menu-open]").forEach(function (b) {
      b.addEventListener("click", function (ev) {
        var k = b.getAttribute("data-menu-open"), url = D.menus[k === "room" ? "roomService" : k];
        if (url) { if (b.tagName !== "A") window.open(url, "_blank", "noopener"); return; }
        ev.preventDefault();
        var m = $(".modal");
        if (!m) {
          document.body.insertAdjacentHTML("beforeend", '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><div class="modal__card"><button class="modal__close" type="button" aria-label="Close">&times;</button><h2 class="modal__title" id="modal-t"></h2><p class="lede" data-modal-p></p><div class="btn-row"><a class="btn btn--wa" target="_blank" rel="noopener" data-modal-wa>' + I.wa + ' Ask on WhatsApp</a></div><p class="small" style="margin:0">Demo: the real PDF opens here once the venue sends it.</p></div></div>');
          m = $(".modal");
          $(".modal__close", m).addEventListener("click", function () { m.classList.remove("is-open"); });
          m.addEventListener("click", function (e2) { if (e2.target === m) m.classList.remove("is-open"); });
          document.addEventListener("keydown", function (e2) { if (e2.key === "Escape") m.classList.remove("is-open"); });
        }
        $("#modal-t", m).textContent = copy[k][0];
        $("[data-modal-p]", m).textContent = copy[k][1];
        $("[data-modal-wa]", m).href = waTo("Hi Adam's Beer Kitchen! Could you send me the " + copy[k][0].toLowerCase() + "?");
        m.classList.add("is-open"); $(".modal__close", m).focus();
      });
    });
    Object.keys(D.menus).forEach(function (k) {
      if (!D.menus[k]) return;
      $$('[data-menu-open="' + (k === "roomService" ? "room" : k) + '"]').forEach(function (a) { a.href = D.menus[k]; a.target = "_blank"; });
    });
  }

  /* ---------------- find us ---------------- */
  function renderHours(el) {
    var td = today().dow;
    el.innerHTML = "<tbody>" + WEEK.map(function (d) {
      var hh = V.happyHour[d];
      return '<tr' + (d === td ? ' class="is-today"' : "") + '><th scope="row">' + DAYS[d] + (d === td ? " (today)" : "") + "</th><td>12PM – 3AM</td><td>Happy hour till " + fmt(hh[1]) + "</td></tr>";
    }).join("") + "</tbody>";
  }
  /* our own map, drawn from street data in map.js, with the route to the door; it works offline and tapping opens Google Maps.
     Without map.js it falls back to the saved Google Maps view. */
  var mapAnim = !reduce && "IntersectionObserver" in window && !/[?&]shot=/.test(location.search);
  function mapHtml() {
    var M = window.ABK_MAP;
    if (!M) return '<a class="map" href="' + V.maps + '" target="_blank" rel="noopener" aria-label="Open Adam\'s Beer Kitchen JVC in Google Maps">' +
      '<img src="assets/img/map-jvc.jpg" alt="Google Maps showing Adam\'s Beer Kitchen JVC on Lazuward, off Assel Boulevard in Jumeirah Village Circle" loading="lazy">' +
      '<span class="map__cta">' + I.pin + " Open in Google Maps</span></a>";
    var v = M.view;
    function at(p) { return "left:" + ((p[0] - v[0]) / v[2] * 100).toFixed(2) + "%;top:" + ((p[1] - v[1]) / v[3] * 100).toFixed(2) + "%"; }
    return '<a class="map map--drawn' + (mapAnim ? " is-pre" : "") + '" href="' + V.maps + '" target="_blank" rel="noopener" aria-label="Map to Adam\'s Beer Kitchen JVC: along Lazuward N E, turn off onto the slip road just before HE Hotel Apartments. Opens Google Maps.">' +
      '<svg class="map__svg" viewBox="' + v.join(" ") + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + M.svg + "</svg>" +
      '<span class="map__road" style="' + at(M.road.at) + ";--a:" + M.road.angle + 'deg">' + esc(M.road.name) + "</span>" +
      '<span class="map__from" style="' + at(M.from) + '">From Hessa St</span>' +
      '<span class="map__tag" style="' + at(M.door) + '">Valet parking</span>' +
      '<span class="map__note" style="' + at(M.turn) + '"><b>Turn off here</b>Keep right for HE Hotel</span>' +
      '<span class="map__flag" style="' + at(M.hotel) + '"><span class="map__badge"><img src="assets/img/logo.png" alt=""></span><span class="map__name"><b>Adam\'s Beer Kitchen</b>HE Hotel Apartments, Floor 1</span></span>' +
      '<span class="map__cta">' + I.pin + " Open in Google Maps</span>" +
      '<span class="map__credit">© OpenStreetMap</span></a>';
  }
  function renderMap(el) { el.outerHTML = mapHtml(); }
  /* the route draws itself the first time the map scrolls into view */
  function mapIn() {
    $$(".map--drawn.is-pre").forEach(function (m) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        m.classList.remove("is-pre"); io.disconnect();
      }, { threshold: 0.35 });
      io.observe(m);
    });
  }
  function renderFindUs(el) {
    var st = liveStatus();
    el.innerHTML = '<div class="wrap split findus">' + mapHtml() +
      '<div><div class="sec-head"><h2 class="d-l">Where to find us</h2><p class="lede">Floor 1 of HE Hotel Apartments on Assel Boulevard, JVC, ' + esc(V.landmarks) + ".</p></div>" +
      '<ul class="icon-list">' +
      "<li>" + I.pin + "<div><h3>" + esc(V.address[0]) + "</h3><p>" + esc(V.address[1]) + ", " + esc(V.address[2]) + "</p></div></li>" +
      "<li>" + I.lift + "<div><h3>Take the lift to Floor 1</h3><p>Valet parking at the hotel entrance.</p></div></li>" +
      "<li>" + I.clock + "<div><h3>" + (st.open ? "Open now, till 3AM" : "Open daily 12PM – 3AM") + "</h3><p>Happy hour every day from 12PM.</p></div></li>" +
      "</ul>" +
      '<div class="btn-row" style="margin-top:26px"><a class="btn" href="' + V.maps + '" target="_blank" rel="noopener">Get directions</a><a class="btn btn--ghost" href="find-us.html">First time? Read the guide</a></div></div></div>';
  }
  function renderRating(el) {
    el.innerHTML = '<span class="rating">' + stars() + "<b>" + V.google.rating + "</b> on Google from " + V.google.count + " reviews</span>";
  }
  function renderDishes(el) {
    el.innerHTML = '<ul class="dishes">' + D.dishes.map(function (d) {
      return '<li><span class="dishes__row"><span class="dishes__name">' + esc(d[0]) + '</span><span class="dishes__dots" aria-hidden="true"></span><span class="dishes__price">AED ' + d[2] + "</span></span>" + (d[1] ? '<span class="dishes__desc">' + esc(d[1]) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  /* ---------------- header behaviour ---------------- */
  function headerUi() {
    var hdr = $("#hdr"), more = $(".nav__more"), mnav = $("#mnav"), burger = $(".hdr__burger");
    function onScroll() { hdr.classList.toggle("is-solid", window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (more) {
      var mb = $("button", more);
      mb.addEventListener("click", function (e) { e.stopPropagation(); var o = more.classList.toggle("is-open"); mb.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", function (e) { if (!more.contains(e.target)) { more.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); } });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { more.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); } });
    }
    function setNav(o) {
      mnav.classList.toggle("is-open", o); burger.setAttribute("aria-expanded", String(o));
      document.documentElement.classList.toggle("is-locked", o);
      if (window.__lenis) (o ? window.__lenis.stop() : window.__lenis.start());
      if (o) $(".mnav__close", mnav).focus(); else burger.focus();
    }
    burger.addEventListener("click", function () { setNav(true); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]'), id = a && a.getAttribute("href");
      if (!a || id.length < 2 || id === "#main") return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      if (mnav.classList.contains("is-open")) { mnav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("is-locked"); if (window.__lenis) window.__lenis.start(); }
      if (window.__lenis) { e.preventDefault(); window.__lenis.scrollTo(target, { offset: -90 }); history.replaceState(null, "", id); }
    });
    $(".mnav__close", mnav).addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("is-open")) setNav(false); });
  }

  /* ---------------- smooth scroll (desktop mouse only) ---------------- */
  function smooth() {
    if (reduce || !window.Lenis || !hasGsap || /[?&]shot=/.test(location.search) || !matchMedia("(pointer: fine)").matches) return;
    var lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (document.documentElement.classList.contains("is-locked")) lenis.stop();
  }

  /* ---------------- the pour + hero entrance ---------------- */
  function unlock() {
    document.documentElement.classList.remove("is-locked");
    if (window.__lenis) window.__lenis.start();
    if (hasGsap) ScrollTrigger.refresh();
  }
  /* hero entrance: hidden while the pour plays, revealed as the curtain lifts.
     [selector, hidden state, reveal tween, position] */
  var HERO = [
    [".hero__title .ln > span", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.09, ease: "power4.out" }, 0],
    [".hero__kicker, .hero__hook, .hero__live, .hero__copy .btn-row, .hero__copy [data-livecard]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.35],
    [".board", { y: 40, rotation: 2, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.3],
    [".snaps .snap", { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)" }, 0.75]
  ];
  function heroClear() { HERO.forEach(function (h) { gsap.set(h[0], { clearProps: "transform,opacity" }); }); }
  function heroIn() {
    if (!hasGsap || reduce || !$(".hero")) return null;
    HERO.forEach(function (h) { gsap.set(h[0], h[1]); });
    var shown = false;
    return {
      play: function () {
        if (shown) return; shown = true;
        var tl = gsap.timeline({ onComplete: heroClear });
        HERO.forEach(function (h) { tl.to(h[0], h[2], h[3]); });
        setTimeout(heroClear, 2600); /* safety net: the page is always visible */
      }
    };
  }
  /* the pour: beer starts flowing straight away, fills in a second, logo pops, foam wipes up (about 2.2s) */
  function playPour() {
    var p = $("#pour");
    if (!p) { unlock(); return; }
    if (!hasGsap) { p.remove(); unlock(); return; }
    L.ss("abk_pour", "1");
    var glassEl = $(".pour__glass", p), liquid = $(".pour__liquid", p), foam = $(".pour__foam", p), stream = $(".pour__stream", p), logo = $(".pour__logo", p), slogan = $$(".pour__slogan span", p);
    gsap.set(liquid, { y: 335 });
    gsap.set(foam, { scaleY: 0.35, transformOrigin: "50% 100%" });
    gsap.set(logo, { opacity: 0, y: 12, scale: 0.9 });
    gsap.set(slogan, { opacity: 0, y: 14 });
    gsap.set(glassEl, { opacity: 0, scale: 0.92, y: 14 });
    var hero = heroIn();
    var tl = gsap.timeline({ onComplete: function () { p.remove(); unlock(); } });
    tl.to(glassEl, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(stream, { attr: { height: 580 }, duration: 0.2, ease: "power1.in" }, 0.04)
      .to(liquid, { y: 70, duration: 1, ease: "power2.out" }, 0.16)
      .to(foam, { scaleY: 1, duration: 1, ease: "power2.out" }, 0.16)
      .to(stream, { attr: { y: 330, height: 0 }, duration: 0.22, ease: "power2.in" }, 0.98)
      .to(glassEl, { rotation: -5, transformOrigin: "50% 100%", duration: 0.13, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.1)
      .to(logo, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.02)
      .to(slogan, { opacity: 1, y: 0, duration: 0.32, stagger: 0.16, ease: "power2.out" }, 1.25)
      .to(p, { yPercent: -100, duration: 0.65, ease: "power3.inOut" }, 2.35)
      .add(function () { if (hero) hero.play(); }, 2.47);
    function skip() { tl.progress(1); if (hero) hero.play(); }
    setTimeout(function () { if (document.body.contains(p)) skip(); }, 4500); /* safety net */
    $(".pour__skip", p).addEventListener("click", skip);
    p.addEventListener("click", function (e) { if (!e.target.closest(".pour__skip")) skip(); });
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { skip(); document.removeEventListener("keydown", k); } });
  }
  function start() {
    if ($("#pour")) playPour(); else unlock();
  }

  /* ---------------- tonight takeover: the hero becomes today's main event ---------------- */
  function takeoverInfo() {
    var b = biz(), t = D.takeover && D.takeover[b.bdow];
    if (!t) return null;
    var e = find(t.slug), x = eventSpan(e);
    var a = t.start ? toMin(t.start) : x[0], z = t.end ? toMin(t.end) : x[1];
    if (z <= a) z += 1440;
    if (b.bmins >= z) return null;
    return { t: t, e: e, a: a, z: z, on: b.bmins >= a, b: b };
  }
  function renderTakeover() {
    if (TX) return;
    var hero = $(".hero"), info = takeoverInfo();
    if (!hero || !info) return;
    var label = info.a >= 17 * 60 ? "Tonight" : "Today";
    var title = $(".hero__title"), hook = $(".hero__hook"), row = $(".hero__copy .btn-row");
    hero.classList.add("is-takeover");
    title.innerHTML = info.t.lines.map(function (l) { return '<span class="ln"><span>' + esc(l) + "</span></span>"; }).join("");
    title.insertAdjacentHTML("beforebegin", '<p class="hero__kicker">' + label + " at Adam's Beer Kitchen</p>");
    hook.textContent = info.t.sub;
    row.innerHTML = '<a class="btn" href="book.html?event=' + info.e.slug + '">Book for ' + label.toLowerCase() + '</a><a class="btn btn--ghost" href="' + (info.t.link || info.e.slug + ".html") + '">See the night</a>';
    $(".hero__live").insertAdjacentHTML("afterbegin", '<span class="pill pill--count" data-takeover-pill><span class="pill__dot"></span><span data-takeover-text></span></span>');
    paintTakeover();
  }
  function paintTakeover() {
    if (TX) return;
    var p = $("[data-takeover-pill]");
    if (!p) return;
    var info = takeoverInfo();
    if (!info) { p.hidden = true; return; }
    var left = info.a - info.b.bmins;
    $("[data-takeover-text]", p).textContent = info.on ? "On now, till " + fmt(info.z) : left <= 12 * 60 ? "Starts in " + dur(left) : "Starts at " + fmt(info.a);
    p.classList.toggle("is-on", info.on);
  }

  /* ---------------- Ask Adam: instant answers from the live schedule.
     Floats on every page, and the conversation follows visitors from page to page. ---------------- */
  var BT_MAIN = [["tonight", "What's on tonight?"], ["hh", "Is it happy hour?"], ["brunch", "Brunch this weekend?"], ["find", "How do I find you?"], ["book", "Book a table"], ["more", "More questions"]];
  var BT_MORE = [["live", "Who's playing live?"], ["deals", "Any deals today?"], ["menu", "Show me the menu"], ["sport", "Do you show football?"], ["groups", "Big group or party?"], ["hours", "Opening hours"], ["human", "Talk to the team"]];
  var bt = null, bk = null;
  function btList(items) {
    return '<ul class="bt-list">' + items.map(function (it) { return "<li><b>" + it[0] + "</b><div>" + it[1] + (it[2] ? "<span>" + it[2] + "</span>" : "") + "</div></li>"; }).join("") + "</ul>";
  }
  function btBtns(btns) {
    return '<div class="bt-actions">' + btns.map(function (x) {
      var ext = /^(https?:|tel:)/.test(x[1]) || /\.pdf$/.test(x[1]);
      return '<a class="btn ' + (x[2] || "") + '" href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + x[0] + "</a>";
    }).join("") + "</div>";
  }
  function slotRows(items) {
    return items.map(function (it) { return [fmt(it.a), '<a href="' + it.e.slug + '.html">' + esc(it.s.label) + "</a>", it.s.price ? esc(it.s.price) : fmt(it.a) + " – " + fmt(it.b)]; });
  }
  function aTonight() {
    var st = liveStatus(), b = st.b, word = b.bmins < 17 * 60 ? "today" : "tonight";
    var left = slotsFor(b.bdow).filter(function (it) { return b.bmins < it.b; });
    if (b.bmins >= toMin(V.opens) && !left.length) {
      var nd = (b.bdow + 1) % 7;
      return { html: "That's a wrap on " + word + "'s events, but the bar's open till 3AM. Here's tomorrow, " + DAYS[nd] + ":" + btList(slotRows(slotsFor(nd).slice(0, 4))), chips: [["book", "Book a table"], ["hh", "Is it happy hour?"], ["more", "More questions"]] };
    }
    var hh = st.hh ? "<p>Happy hour is on right now, till " + fmt(st.h1) + ".</p>" : b.bmins < st.h0 ? "<p>Happy hour runs " + fmt(st.h0) + " – " + fmt(st.h1) + ".</p>" : "";
    return { html: "Here's " + word + ", " + DAYS[b.bdow] + ":" + btList(slotRows(left)) + hh + btBtns([["Book for " + word, "book.html?date=" + iso(today())]]), chips: [["book", "Book a table"], ["live", "Who's playing live?"], ["find", "How do I find you?"], ["more", "More questions"]] };
  }
  function aHH() {
    var st = liveStatus(), b = st.b, html;
    if (st.hh) html = "Yes! Happy hour is on right now and runs till <b>" + fmt(st.h1) + "</b>. That's " + dur(st.h1 - b.bmins) + " to go.";
    else if (b.bmins < st.h0) html = "Not yet. Happy hour starts at <b>" + fmt(st.h0) + "</b> today and runs till " + fmt(st.h1) + ".";
    else html = "Happy hour's finished for today. It's back tomorrow from 12PM.";
    html += "<p>Every day from 12PM: till 9PM Sunday to Thursday, and till 7PM on Friday and Saturday.</p>";
    return { html: html, chips: [["tonight", "What's on tonight?"], ["deals", "Any deals today?"], ["book", "Book a table"]] };
  }
  function aHours() {
    var st = liveStatus();
    return { html: "We're open every day from <b>12PM till 3AM</b>. " + (st.open ? "We're open right now." : "We open at 12PM today.") + " Valet parking is available at HE Hotel Apartments.", chips: [["find", "How do I find you?"], ["tonight", "What's on tonight?"], ["book", "Book a table"]] };
  }
  function aBrunch() {
    var rows = brunches().filter(function (x) { return [5, 6, 0].indexOf(x.dow) > -1; }).map(function (x) {
      return [DAYS3[x.dow], '<a href="' + x.e.slug + '.html">' + esc(x.p.name) + "</a>", esc(x.p.time) + ", AED " + x.p.house + " / " + x.p.premium];
    });
    return { html: "This weekend's brunches and drunches:" + btList(rows) + "<p>House is the standard package and Premium is the upgrade.</p>" + btBtns([["Find my brunch", "brunches.html"]]), chips: [["book", "Book a table"], ["deals", "Any deals today?"], ["more", "More questions"]] };
  }
  function aLive() {
    var b = biz(), rows = [];
    WEEK.forEach(function (dow) {
      D.events.forEach(function (e) {
        if (e.days[0] !== dow || !e.lineup) return;
        e.lineup.forEach(function (l) { rows.push([DAYS3[dow], esc(D.artists[l.who].name), esc(l.time) + (dow === b.bdow ? ", tonight" : "")]); });
      });
    });
    return { html: "Live music five nights a week, plus quiz and karaoke hosts:" + btList(rows) + btBtns([["See the line-up", "live-music.html", "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["book", "Book a table"]] };
  }
  function aFind() {
    return { html: "We're on <b>Floor 1 of HE Hotel Apartments</b>, Assel Boulevard, JVC, " + esc(V.landmarks) + ". Valet parking at the entrance, then take the lift to Floor 1 and follow the music." + btBtns([["Open in Google Maps", V.maps], ["First-time guide", "find-us.html", "btn--ghost"]]), chips: [["hours", "Opening hours"], ["book", "Book a table"]] };
  }
  function aDeals() {
    var b = biz(), st = liveStatus(), rows = [];
    rows.push(["Daily", '<a href="happy-hour.html">Happy hour</a>', st.hh ? "On now, till " + fmt(st.h1) : "From 12PM, till " + fmt(st.h1)]);
    var e = find({ 1: "monday-20-off", 2: "quiz-night", 3: "ladies-night", 4: "steak-night", 5: "fuel-up-friday", 6: "smoking-saturdays", 0: "sunday-social" }[b.bdow]);
    if (e) rows.push([DAYS3[b.bdow], '<a href="' + e.slug + '.html">' + esc(e.name) + "</a>", esc(e.short)]);
    if (b.bdow >= 1 && b.bdow <= 4) rows.push(["Mon – Thu", '<a href="tower-up.html">Tower up your day</a>', "2.5L beer tower and a bites platter, AED 179"]);
    D.specials.forEach(function (s) { if (specialState(s) === "on") rows.push(["On now", '<a href="' + s.slug + '.html">' + esc(s.name) + "</a>", esc(s.short)]); });
    return { html: "Today's best deals:" + btList(rows) + btBtns([["All offers", "offers.html", "btn--ghost"]]), chips: [["book", "Book a table"], ["brunch", "Brunch this weekend?"]] };
  }
  function aMenu() {
    var rows = D.dishes.slice(0, 5).map(function (d) { return ["AED " + d[2], esc(d[0]), esc(d[1])]; });
    return { html: "A few favourites from the kitchen:" + btList(rows) + btBtns([["Full food menu (PDF)", D.menus.food || "menu.html"], ["Menu page", "menu.html", "btn--ghost"]]), chips: [["deals", "Any deals today?"], ["book", "Book a table"]] };
  }
  function aSport() {
    return { html: "Premier League weekends and the big games are on the <b>big screens</b>, and there's darts and pool for half-time. Want a table with a view of the screens?" + btBtns([["Book a match-day table", "sports.html"]]), chips: [["book", "Book a table"], ["deals", "Any deals today?"]] };
  }
  function aGroups() {
    return { html: "Birthdays, leaving dos, office parties: we've got a <b>private area</b> for groups. Tell me the date and how many of you, and I'll pass it to the team.", chips: [["book8", "Start a group booking"], ["human", "Talk to the team"]] };
  }
  function aHuman(q) {
    return { html: "No problem. The team's on WhatsApp, or give us a ring." + btBtns([["WhatsApp us", waTo("Hi Adam's Beer Kitchen! " + (q || ""))], ["Call " + V.phoneDisplay, "tel:" + V.phone, "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function aEvent(slug) {
    var e = find(slug);
    if (!e) return aTonight();
    var when = e.dayLabel || e.when || "";
    if (e.from && specialState(e) === "past") return { html: "<b>" + esc(e.name) + "</b> has finished (" + esc(when) + "). Here's what's on at the moment:", chips: [["deals", "Any deals today?"], ["tonight", "What's on tonight?"]] };
    var html = "<b>" + esc(e.name) + "</b>, " + esc(when.charAt(0).toLowerCase() + when.slice(1)) + (e.slots ? ", " + timeRange(e) : "") + ". " + esc(e.short);
    if (e.packages) html += btList(e.packages.map(function (p) { return ["AED", esc(p.name), esc(p.time) + ": House " + p.house + ", Premium " + p.premium]; }));
    if (e.slots) { var nx = nextOn(e.days[0], eventSpan(e)[1]); html += "<p>Next one: <b>" + (nx.add === 0 ? "today" : shortDate(nx)) + "</b>.</p>"; }
    return { html: html + btBtns([["Book it", "book.html?event=" + e.slug], ["See the night", e.slug + ".html", "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function aDay(dow) {
    var nx = nextOn(dow, 26 * 60);
    return { html: DAYS[dow] + " (" + (nx.add === 0 ? "today" : shortDate(nx)) + "):" + btList(slotRows(slotsFor(dow))) + btBtns([["Book " + DAYS[dow], "book.html?date=" + iso(nx)]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function bookStep(choice) {
    var b = biz(), t0 = today();
    if (!bk) bk = {};
    if (choice) Object.keys(choice).forEach(function (k) { if (choice[k] !== undefined && choice[k] !== null) bk[k] = choice[k]; });
    if (!bk.date) {
      var opts = [["bkdate", b.bmins < 17 * 60 ? "Today" : "Tonight", iso(t0)], ["bkdate", "Tomorrow", iso(addDays(t0.y, t0.m, t0.d, 1))]];
      [5, 6, 0].forEach(function (d) { var o = nextOn(d, 26 * 60); if (o.add > 1) opts.push(["bkdate", DAYS[d] + " " + o.d + " " + MON3[o.m], iso(o)]); });
      opts.push(["bkform", "Another date"]);
      return { html: "Lovely. When are you coming in?", chips: opts };
    }
    if (!bk.guests) return { html: "How many of you?", chips: [["bkguests", "2", 2], ["bkguests", "4", 4], ["bkguests", "6", 6], ["bkguests", "8 or more", 8]] };
    var d = fromIso(bk.date);
    var evs = D.events.filter(function (e) { return e.days.indexOf(d.dow) > -1; });
    if (bk.time === undefined) {
      var starts = [];
      evs.forEach(function (e) { var a = eventSpan(e)[0]; if (starts.indexOf(a) === -1) starts.push(a); });
      [19 * 60, 20 * 60, 21 * 60].forEach(function (m) { if (starts.indexOf(m) === -1) starts.push(m); });
      starts.sort(function (x, y) { return x - y; });
      return { html: "What time suits you?", chips: starts.slice(0, 5).map(function (m) { return ["bktime", fmt(m), m]; }).concat([["bktime", "Not sure yet", -1]]) };
    }
    if (bk.slug === undefined) {
      return { html: "Anything special on " + DAYS[d.dow] + "?", chips: evs.map(function (e) { return ["bkevent", e.name, e.slug]; }).concat([["bkevent", "Just a table", ""]]) };
    }
    var e = bk.slug ? find(bk.slug) : null, many = bk.plus ? "8 or more" : String(bk.guests);
    var time = bk.time >= 0 ? fmt(bk.time) : "";
    var msg = "Hi Adam's Beer Kitchen! I'd like to book a table.\n\nDate: " + longDate(d) + (time ? "\nTime: " + time : "") + "\nGuests: " + many + (e ? "\nFor: " + e.name : "") + (bk.seat ? "\nSeating: " + bk.seat : "") + "\n\nSent from Adam on your website";
    var rows = [["Date", longDate(d)]];
    if (time) rows.push(["Time", time]);
    rows.push(["Guests", many], ["For", e ? esc(e.name) : "Just a table"]);
    if (bk.seat) rows.push(["Seat", esc(bk.seat)]);
    var html = "Here's your booking:" + btList(rows) +
      "<p>Tap below and it goes straight to the team on WhatsApp. They'll confirm your table.</p>" +
      btBtns([["Send on WhatsApp", waTo(msg)], ["Full booking form", "book.html?date=" + bk.date + (e ? "&event=" + e.slug : ""), "btn--ghost"]]);
    if (e) ctx.slug = e.slug;
    bk = null;
    return { html: html, chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }

  /* ---------------- Adam's brain: fixes typos and text-speak, understands full sentences,
     answers two things at once and remembers what you were talking about ---------------- */
  var ctx = { slug: null };
  var ABBR = {
    u: "you", r: "are", ur: "your", ya: "you", pls: "please", plz: "please", thx: "thanks", ty: "thanks", tnx: "thanks", thnx: "thanks",
    tmrw: "tomorrow", tmr: "tomorrow", tmrrw: "tomorrow", tomoz: "tomorrow", "2moro": "tomorrow", "2morrow": "tomorrow", "2mrw": "tomorrow", tomo: "tomorrow",
    tonite: "tonight", "2nite": "tonight", "2night": "tonight", nite: "night", "2day": "today", tdy: "today", tday: "today",
    wknd: "weekend", wkend: "weekend", wat: "what", wot: "what", wht: "what", wen: "when", wer: "where", wher: "where", whr: "where",
    bday: "birthday", b4: "before", resv: "reservation", rez: "reservation", veggie: "vegetarian", veg: "vegetarian", hh: "happy hour",
    ppl: "people", pax: "people", hw: "how", abt: "about", rn: "now", xmas: "christmas", nye: "new year", info: "information",
    fri: "friday", sat: "saturday", sun: "sunday", mon: "monday", tue: "tuesday", tues: "tuesday", wed: "wednesday", thu: "thursday", thur: "thursday", thurs: "thursday",
    footy: "football", prem: "premier", epl: "premier", dhs: "aed", dh: "aed", bbq: "bbq", wifi: "wifi", "wi-fi": "wifi"
  };
  var VOCAB = ("happy hour brunch drunch quiz trivia ladies steak ribeye karaoke roast sunday monday tuesday wednesday thursday friday saturday " +
    "tonight today tomorrow weekend music live band singer singing artist guitar fergal bracken dylan kusch parking valet location address where directions " +
    "open opening close closing hours menu food drinks drink beer beers guinness cocktail cocktails wine whisky price prices cost deal deals offer offers discount " +
    "book booking reserve reservation table group party birthday private office celebration football soccer match premier league sports screens darts pool " +
    "terrace outdoor outside kids children family vegetarian vegan gluten halal dress smoking shisha pets dogs wifi payment delivery room service hotel " +
    "teachers teacher cabin crew hotelier hoteliers tower towers halloween vouchers burger pizza pasta salmon lamb chicken salad dessert desserts sliders sandwich " +
    "stew crumble brownie cheesecake wings nachos calamari platter prawns mussels hotdog burrito fries truffle wheelchair accessible access capacity hiring joke funny thanks hello weather christmas restaurant people guests tickets " +
    "heineken formula prix race races jack daniel scratch amstel festive jumper bucket bottles").split(" ");
  var STOP = ("the and for with you your are can could would should will does did have has had this that what when where which who whom whose how why " +
    "there here they them their then than from about into onto over under just also very much many some more most any anything something nothing " +
    "please thanks thank good great nice best fine okay hello help need want like love know tell show give make take come coming going gone get got " +
    "time week night day days hour hours open late early soon now near next last first second one two three four five six seven eight nine ten twelve " +
    "table people person guests friends with without other others again maybe sure yeah yes nope dine dining place places sit seat seats see look looking " +
    "today tonight tomorrow weekend book booking food drink drinks menu price prices cost deal deals offer offers live music where when what does doing done " +
    "booked event events night nights lunch dinner breakfast evening afternoon morning kitchen table tables staff friend going were we're cheers " +
    "salam salaam marhaba hiya heya howdy habibi yalla wallah inshallah mashallah shukran mate mates guys bro").split(" ");
  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }
  function normalize(q) {
    var raw = q.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9'%:\/\-\s&]/g, " ").replace(/\s+/g, " ").trim();
    var words = raw.split(" "), out = [], fixes = [];
    words.forEach(function (w, i) {
      var base = w.replace(/'s$/, "").replace(/^'+|'+$/g, "");
      if (ABBR[base]) { out.push(ABBR[base]); return; }
      if (base === "our" && out[out.length - 1] === "happy") { out.push("hour"); fixes.push([w, "hour"]); return; }
      if (base.length < 4 || /\d/.test(base) || STOP.indexOf(base) > -1 || VOCAB.indexOf(base) > -1) { out.push(base); return; }
      var best = null, bd = 9;
      VOCAB.forEach(function (v) {
        if (Math.abs(v.length - base.length) > 2) return;
        var dd = dist(base, v);
        var ok = dd <= (base.length >= 6 ? 2 : 1) && (dd === 1 || v.charAt(0) === base.charAt(0));
        if (ok && (dd < bd || (dd === bd && v.charAt(0) === base.charAt(0)))) { bd = dd; best = v; }
      });
      if (best) {
        out.push(best);
        /* plurals and word endings ("tables", "closed") are fixed quietly; real typos get a note */
        if (base.indexOf(best) !== 0 && best.indexOf(base) !== 0) fixes.push([w, best]);
      } else out.push(base);
    });
    return { text: out.join(" "), fixes: fixes };
  }
  var EVENT_WORDS = [
    [/\b(quiz|trivia)\b/, "quiz-night"], [/\bladies\b/, "ladies-night"], [/\b(steak night|thirsty thursday)/, "steak-night"],
    [/\b(karaoke|singing|sing)\b/, "karaoke-night"], [/\b(roast|sunday social)\b/, "sunday-social"], [/\b(bbq|smoking saturday)/, "smoking-saturdays"],
    [/\bteachers?\b/, "teachers-brunch"], [/\bfuel up\b/, "fuel-up-friday"], [/(\b[25]0 ?%|\b[25]0 off|half price|half off|cabin crew|hoteliers?\b)/, "monday-20-off"],
    [/\b(beer )?towers?\b/, "tower-up"], [/\b(beer )?buckets?\b/, "beer-bucket"], [/\b(festive|jumpers?)\b/, "festive-with-amstel"], [/\b(mid ?term|mayhem|vouchers?)\b/, "mid-term-mayhem"], [/\bhalloween\b/, "halloween-week"]
  ];
  function eventIn(s) { for (var i = 0; i < EVENT_WORDS.length; i++) if (EVENT_WORDS[i][0].test(s)) return EVENT_WORDS[i][1]; return null; }
  function dishesIn(s) {
    var hits = [];
    D.menuItems.forEach(function (m) {
      var words = m[3].split(" ");
      if (words.some(function (w) { return w.length > 3 && new RegExp("\\b" + w + "s?\\b").test(s); })) hits.push(m);
    });
    return hits;
  }
  function parseWhen(s) {
    var t0 = today();
    if (/\b(today|tonight)\b/.test(s)) return iso(t0);
    if (/\btomorrow\b/.test(s)) return iso(addDays(t0.y, t0.m, t0.d, 1));
    var mon = /\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/.exec(s);
    var num = /\b(\d{1,2})[\/.](\d{1,2})\b/.exec(s);
    var m = null, dd = null;
    if (mon) { dd = +mon[1]; m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(mon[2]); }
    else if (num) { dd = +num[1]; m = +num[2] - 1; }
    if (m !== null && m >= 0 && m < 12 && dd >= 1 && dd <= 31) {
      var y = t0.y, cand = addDays(y, m, dd, 0);
      if (iso(cand) < iso(t0)) cand = addDays(y + 1, m, dd, 0);
      return iso(cand);
    }
    for (var i = 0; i < 7; i++) if (new RegExp("\\b" + DAYS[i].toLowerCase() + "\\b").test(s)) return iso(nextOn(i, 26 * 60));
    return null;
  }
  function parseTime(s) {
    var tm = /\b(?:at|around|by|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/.exec(s) || /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/.exec(s);
    if (!tm) return undefined;
    var h = +tm[1], mm = +(tm[2] || 0), ap = tm[3];
    if (h > 23 || mm > 59) return undefined;
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (!ap && h >= 1 && h <= 11) h += 12;
    var mins = h * 60 + mm;
    if (mins >= 3 * 60 && mins < 12 * 60) return undefined; /* we're closed then */
    return mins;
  }
  function parseGuests(s) {
    var g = /\b(?:table for|party of|group of|for|we are|we're|there will be|there are)\s+(\d{1,2})(?!\s*(?::|am\b|pm\b|o'?clock))\b/.exec(s) ||
      /\b(\d{1,2})\s*(?:people|guests|persons|of us|adults|pax|friends)\b/.exec(s);
    return g ? Math.max(1, Math.min(60, +g[1])) : undefined;
  }
  var JOKES = [
    "Why did the quiz team bring a ladder? They heard the questions were on another level. Prove them wrong on Tuesday at 7PM.",
    "I asked the chef for a steak joke. He said it was too rare. Thursday's rib-eye is done properly though: AED 199 with two house drinks.",
    "What do you call a beer that works out? A strong ale. Happy hour starts at 12PM, no gym membership needed.",
    "Our karaoke host says everyone's a great singer. She's very kind. Find out for yourself on Friday from 8PM."
  ];
  function aKids() {
    var mid = D.specials.filter(function (s) { return s.slug === "mid-term-mayhem" && specialState(s) === "on"; })[0];
    return { html: "Families are welcome for food, and guests on Google rate us kid-friendly." + (mid ? " During <b>Mid-Term Mayhem</b> (until 18 October) <b>kids under 12 eat free</b>." : "") + " For bringing little ones to a late event night, check with the team first.", chips: [["menu", "Show me the menu"], ["book", "Book a table"], ["human", "Talk to the team"]] };
  }
  function aVeg() {
    return { html: "Yes. From the current menu:" + btList([["AED 65", "Vegetarian pizza", "Peppers, onion, mushroom and olives"], ["AED 65", "Pasta", "Tomato and basil, arrabbiata or pesto"], ["AED 50", "Greek salad", "With feta"], ["AED 40 – 55", "Veggie bites", "Nachos, spring rolls, onion rings, edamame"]]) + "<p>For vegan or allergy questions, the team will check with the kitchen.</p>", chips: [["menu", "Show me the menu"], ["human", "Ask the team"]] };
  }
  function aAccess() {
    return { html: "Guests report the venue is <b>wheelchair accessible</b>, and there's a lift up to Floor 1 at HE Hotel Apartments. If you need anything set up, just let the team know.", chips: [["find", "How do I find you?"], ["human", "Talk to the team"]] };
  }
  function aTerrace() {
    return { html: "Yes, there's an <b>outdoor terrace</b>, perfect now the evenings are cooling down. Want me to book you a terrace table?", chips: [["bkterrace", "Book a terrace table"], ["tonight", "What's on tonight?"]] };
  }
  function aGames() {
    return { html: "There's <b>darts and pool</b>, plus big screens for the football. Loser buys the next round, obviously.", chips: [["sport", "Do you show football?"], ["book", "Book a table"]] };
  }
  function aRoom() {
    return { html: "Staying at HE Hotel Apartments? Our kitchen does <b>room service</b>, and the bar is one lift ride away." + btBtns([["Room service menu (PDF)", D.menus.roomService || "menu.html"]]), chips: [["tonight", "What's on tonight?"], ["hh", "Is it happy hour?"]] };
  }
  function aDrinks() {
    var bucket = find("beer-bucket"), bucketOn = bucket && specialState(bucket) === "on";
    return { html: "Guinness on tap, cocktails and a large selection of beers. The <b>beer tower</b> (2.5 litres with a bites platter) is AED 179 Monday to Thursday" + (bucketOn ? ", the <b>Heineken bucket</b> is AED 129" : "") + ", and happy hour runs every day from 12PM. The full drinks list is on its way to the site; the team can send it on WhatsApp now." + btBtns([["Ask for the drinks list", waTo("Hi Adam's Beer Kitchen! Could you send me the drinks menu?")]]), chips: [["hh", "Is it happy hour?"], ["deals", "Any deals today?"]] };
  }
  function aAge() {
    return { html: "You need to be <b>21 or over</b> to drink in Dubai, and the team may ask for ID.", chips: BT_MAIN };
  }
  function aWho() {
    return { html: "I'm Adam, your host at Adam's Beer Kitchen JVC. I know the schedule, the deals, the menu and how to find us. Anything I can't answer goes straight to the team on WhatsApp.", chips: BT_MAIN };
  }
  function aJoke() {
    return { html: JOKES[Math.floor(Math.random() * JOKES.length)], chips: [["joke", "Another one"], ["tonight", "What's on tonight?"]] };
  }
  function aWeekend() {
    var rows = [];
    [5, 6, 0].forEach(function (d) {
      var nx = nextOn(d, 26 * 60), t = D.takeover[d];
      rows.push([DAYS3[d] + " " + nx.d, '<a href="' + (t.link || t.slug + ".html") + '">' + esc(t.lines.join(" ")) + "</a>", esc(t.sub)]);
    });
    return { html: "This weekend at Adam's Beer Kitchen:" + btList(rows), chips: [["brunch", "Brunch this weekend?"], ["book", "Book a table"]] };
  }
  function aDish(list) {
    var rows = list.slice(0, 5).map(function (m) { return ["AED " + m[2], esc(m[0]), esc(m[1])]; });
    var steak = list.some(function (m) { return /steak|ribeye/.test(m[3]); });
    return { html: "From our current menu:" + btList(rows) + (steak ? '<p>Tip: on Thursdays it\'s <a href="steak-night.html">steak night</a>, a 250g rib-eye with fries and two house drinks for AED 199.</p>' : "") + btBtns([["Full food menu (PDF)", D.menus.food || "menu.html", "btn--ghost"]]), chips: [["menu", "Show me the menu"], ["book", "Book a table"]] };
  }
  function aPrice() {
    return { html: "A quick guide to prices:" + btList([["AED 99", "Sunday roast buffet", ""], ["AED 149+", "Brunches and drunches", "Up to AED 279 for Premium"], ["AED 199", "Thursday steak night", "Rib-eye, fries and 2 house drinks"], ["AED 179", "Beer tower + bites platter", "Monday to Thursday"], ["AED 30 – 250", "Food menu", "Fries to the seafood platter"]]), chips: [["brunch", "Brunch this weekend?"], ["deals", "Any deals today?"], ["menu", "Show me the menu"]] };
  }
  function aHandoff(label, q) {
    return { html: "Good question about " + label + ". I'd rather not guess, so the team will answer that one on WhatsApp." + btBtns([["Ask the team", waTo("Hi Adam's Beer Kitchen! " + (q || ""))]]), chips: BT_MAIN };
  }
  function aFestive(q) {
    return { html: "Christmas and New Year plans are coming soon. Follow @abk_jvc on Instagram, or ask the team to hold a table for your group." + btBtns([["Ask the team", waTo("Hi Adam's Beer Kitchen! " + (q || ""))]]), chips: [["groups", "Big group or party?"], ["tonight", "What's on tonight?"]] };
  }
  function aF1() {
    var F = D.f1, t = iso(today()), next = F.races.filter(function (r) { return r.date >= t; })[0];
    return { html: "<b>Grand Prix season</b>: every F1 race on the big screens" + (next ? ", and next up is the <b>" + esc(next.name) + "</b> on " + longDate(fromIso(next.date)) : "") + "." +
      btList([["Heineken", "Fans' Grid", "Order 2+ Heineken pints, scan the QR and climb for F1 prizes, up to the VIP lounge at the Abu Dhabi Grand Prix"], ["Jack Daniel's", "Scratch and win", "Order from the F1 menu for a chance at a cap or a T-shirt"]]) +
      btBtns([["Grand Prix season", "grand-prix.html"], ["Book a race night", "book.html" + (next ? "?date=" + next.date : ""), "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function aOffTopic() {
    return { html: "I'm better with food, drinks and what's on than that one, I'm afraid. Here's what I can help with:", chips: BT_MAIN };
  }
  var HANDOFF = [
    [/\b(dress code|dress|wear|outfit)\b/, "the dress code"], [/\b(pay|payment|card|cash|apple pay|visa|amex)\b/, "payment"], [/\bwifi\b/, "Wi-Fi"],
    [/\b(pets?|dogs?|cats?)\b/, "pets"], [/\b(shisha|smok\w*|vape|vaping)\b/, "smoking and shisha"], [/\b(halal|pork)\b/, "halal food"],
    [/\b(gluten|allerg\w*|nuts?|dairy)\b/, "allergies"], [/\b(delivery|deliver|talabat|deliveroo|careem|noon food)\b/, "delivery"],
    [/\b(jobs?|hiring|vacanc\w*|work for you|cv)\b/, "jobs"], [/\b(capacity|how many people fit|seats? how many)\b/, "capacity"]
  ];
  function detect(s, q) {
    var hits = [], add = function (k, a) { if (!hits.some(function (h) { return h[0] === k && h[1] === a; })) hits.push([k, a]); };
    if (/\b(book|booking|reserve|reservation|table for)\b/.test(s) || (/\btable\b/.test(s) && /\d/.test(s))) return [["bookparse"]];
    if (/\b(weather|news|politics|bitcoin|stocks?|crypto)\b/.test(s)) return [["offtopic"]];
    if (/\b(christmas|new year)\b/.test(s)) return [["festive"]];
    if (/\b(joke|funny|make me laugh)\b/.test(s)) add("joke");
    if (/\b(who are you|are you (a )?(bot|robot|human|real|ai)|your name)\b/.test(s)) add("who");
    if (D.f1 && /\b(f1|formula (1|one)|grand prix|race nights?|races?|heineken|jack daniel|jack|fans grid|scratch cards?)\b/.test(s)) add("f1");
    if (/\bhappy hour\b/.test(s)) add("hh");
    var ev = eventIn(s), dishes = dishesIn(s), priceQ = /\b(how much|price|prices|cost|costs|aed|expensive|cheap)\b/.test(s);
    var vegQ = /\b(vegetarian|vegan|plant based|meat free)\b/.test(s);
    if (dishes.length && !vegQ && (priceQ || !ev)) add("dish", dishes);
    else if (ev) add("event", ev);
    if (/\b(brunch|drunch)\b/.test(s) && !ev) add("brunch");
    if (/\bweekend\b/.test(s)) add("weekend");
    var dayIdx = -1;
    DAYS.forEach(function (d, i) { if (new RegExp("\\b" + d.toLowerCase() + "\\b").test(s)) dayIdx = i; });
    var liveQ = /\b(live|music|band|singer|artist|guitar|playing|performing|on stage|dj|fergal|lee wall|bracken|joe and david|dylan)\b/.test(s) && !ev;
    var whatsOnQ = /\b(what is on|whats on|what's on|what on|going on|happening|on now|on tonight)\b/.test(s);
    var todayQ = /\b(tonight|today|right now)\b/.test(s);
    if (dayIdx > -1 && !ev) add("day", dayIdx);
    else if (/\btomorrow\b/.test(s) && !ev) add("day", (biz().bdow + 1) % 7);
    else if (whatsOnQ && !ev && !liveQ) add("tonight");
    if (liveQ) add("live");
    if (/\b(where|address|location|find you|directions|map|how do i get|get there)\b/.test(s)) add("find");
    if (/\b(parking|park|valet)\b/.test(s) && !hits.some(function (h) { return h[0] === "find"; })) add("find");
    if (/\b(football|soccer|match|premier|league|sports?|rugby|screens?|watch the game)\b/.test(s)) add("sport");
    if (/\b(darts|pool table|pool|games)\b/.test(s)) add("games");
    if (/\b(terrace|outdoor|outside|sit outside)\b/.test(s)) add("terrace");
    if (/\b(kids|children|child|family|families|baby|toddler)\b/.test(s)) add("kids");
    if (/\b(vegetarian|vegan|plant based|meat free)\b/.test(s)) add("veg");
    if (/\b(wheelchair|accessible|disabled|accessibility|stairs)\b/.test(s)) add("access");
    if (/\b(room service|my room|hotel guest|staying at|staying in)\b/.test(s)) add("room");
    if (/\b(beer|beers|guinness|cocktails?|wine|whisky|whiskey|on tap|draft|draught|drinks menu)\b/.test(s) && !ev) add("drinks");
    if (/\b(deals?|offers?|discount|promo|specials?)\b/.test(s)) add("deals");
    if (/\b(menu|food|eat|hungry|dish)\b/.test(s) && !dishes.length && !hits.some(function (h) { return h[0] === "veg"; })) add("menu");
    if (/\b(group|party|birthday|private|office|celebrat\w*|leaving)\b/.test(s)) add("groups");
    if (/\b(open|opening|close|closing|hours|until when|how late)\b/.test(s)) add("hours");
    if (/\b(age|21|under 21|id|minimum age|old enough)\b/.test(s)) add("age");
    if (/\b(christmas|new year)\b/.test(s)) add("festive");
    HANDOFF.forEach(function (h) { if (h[0].test(s)) add("handoff", h[1]); });
    if (/\b(weather|news|politics|bitcoin|stock)\b/.test(s)) add("offtopic");
    if (priceQ && !hits.length) add("price");
    /* "tonight" on its own ("anything tonight?") means what's on; next to another topic it just narrows that topic */
    if (todayQ && !hits.length && !ev) add("tonight");
    if (!hits.length && /^\s*(hi|hey|hello|hiya|heya|salam|salaam|marhaba|yo|good (morning|afternoon|evening))\b/.test(s)) add("hello");
    if (!hits.length && /\b(thanks|thank you|cheers|perfect|great stuff|nice one|legend|amazing)\b/.test(s)) add("thanks");
    if (!hits.length && /\b(human|person|staff|call|phone|whatsapp|manager|someone)\b/.test(s)) add("human");
    return hits.slice(0, 2);
  }
  function followUp(s) {
    if (!ctx.slug) return null;
    if (/\b(book|reserve|book it|that one|lets go|let's go|count me in)\b/.test(s)) return ["bookparse"];
    if (/\b(how much|price|cost|when|what time|time|start|until|who|playing|host|tell me more|more)\b/.test(s)) return ["event", ctx.slug];
    return null;
  }
  function adamAnswer(q) {
    var n = normalize(q), s = " " + n.text + " ", list = [];
    var note = n.fixes.length ? '<p class="bt-fix">Reading “' + esc(n.fixes.map(function (f) { return f[0]; }).join(" ")) + "” as “" + esc(n.fixes.map(function (f) { return f[1]; }).join(" ")) + "”.</p>" : "";
    if (bk && bk.date && !bk.guests && /\d/.test(s)) list.push(bookStep({ guests: parseGuests(s) || Math.max(1, Math.min(60, +/\d{1,2}/.exec(s)[0])) }));
    else if (bk && bk.date && bk.guests && bk.time === undefined && parseTime(s) !== undefined) list.push(bookStep({ time: parseTime(s) }));
    else {
      var hits = detect(s, q), f = followUp(s);
      /* "how much?" or "what time?" right after talking about a night means that night */
      if (f && (!hits.length || (hits.length === 1 && ["price", "hours"].indexOf(hits[0][0]) > -1))) hits = [f];
      if (!hits.length) hits = [["unknown"]];
      hits.forEach(function (h) {
        if (h[0] === "bookparse") {
          bk = {};
          var slug = eventIn(s) || (/\b(book it|that one|book that)\b/.test(s) ? ctx.slug : null);
          var when = parseWhen(s), moved = "";
          var ev = slug ? find(slug) : null;
          if (ev && ev.days) {
            var evDate = nextOn(ev.days[0], eventSpan(ev)[1]);
            /* asked for a night when that event isn't on: book the next one and say so */
            if (when && fromIso(when).dow !== ev.days[0]) moved = "<p>" + esc(ev.name) + " is on " + DAYS[ev.days[0]] + "s, so I've picked " + shortDate(evDate) + ".</p>";
            if (!when || moved) when = iso(evDate);
          }
          var guests = parseGuests(s), time = parseTime(s);
          if (time === undefined && ev && ev.slots) time = eventSpan(ev)[0]; /* a set night starts at its own time */
          var step = bookStep({ date: when, guests: guests, plus: guests >= 8 ? false : undefined, time: time, slug: slug || undefined, seat: /\b(terrace|outside|outdoor)\b/.test(s) ? "Outdoor terrace" : /\bscreens?\b/.test(s) ? "Near the big screens" : undefined });
          list.push(moved ? { html: moved + step.html, chips: step.chips } : step);
        } else list.push(btRoute(h[0], h[1], q));
      });
    }
    if (note && list[0]) list[0] = { html: note + list[0].html, chips: list[0].chips };
    return list;
  }
  function btGreeting() {
    if (TX) return { html: '<p dir="auto">' + TX.adam.greeting + "</p>", chips: [] };
    var m = dubai().mins, hi = m >= 180 && m < 12 * 60 ? "Morning" : m >= 180 && m < 17 * 60 ? "Afternoon" : "Evening";
    return { html: hi + "! I'm Adam. Ask me anything about Adam's Beer Kitchen: what's on, happy hour, food and prices, how to find us, or just type naturally, like “table for 4 tomorrow at 8”.", chips: BT_MAIN };
  }
  function btRoute(k, arg, text) {
    switch (k) {
      case "tonight": return aTonight();
      case "hh": return aHH();
      case "hours": return aHours();
      case "brunch": return aBrunch();
      case "live": return aLive();
      case "find": return aFind();
      case "deals": return aDeals();
      case "menu": return aMenu();
      case "sport": return aSport();
      case "groups": return aGroups();
      case "human": return aHuman(text);
      case "event": ctx.slug = arg; return aEvent(arg);
      case "day": return aDay(+arg);
      case "weekend": return aWeekend();
      case "dish": return aDish(arg);
      case "kids": return aKids();
      case "veg": return aVeg();
      case "access": return aAccess();
      case "terrace": return aTerrace();
      case "games": return aGames();
      case "room": return aRoom();
      case "drinks": return aDrinks();
      case "age": return aAge();
      case "who": return aWho();
      case "joke": return aJoke();
      case "price": return aPrice();
      case "festive": return aFestive(text);
      case "f1": return aF1();
      case "offtopic": return aOffTopic();
      case "handoff": return aHandoff(arg, text);
      case "more": return { html: "Sure. What would you like to know?", chips: BT_MORE };
      case "book": bk = {}; return bookStep();
      case "book8": bk = { guests: 8, plus: true }; return bookStep();
      case "bkterrace": bk = { seat: "Outdoor terrace" }; return bookStep();
      case "bkdate": return bookStep({ date: arg });
      case "bkguests": return bookStep({ guests: +arg, plus: +arg >= 8 });
      case "bktime": return bookStep({ time: +arg });
      case "bkevent": return bookStep({ slug: arg });
      case "bkform": bk = null; return { html: "No problem. The full booking form has a calendar for any date." + btBtns([["Open the booking form", "book.html"]]), chips: BT_MAIN };
      case "hello": return btGreeting();
      case "thanks": return { html: "Cheers! Anything else I can help with?", chips: BT_MAIN };
      default: return { html: "Good question. That one's not on my board, but the team will know." + btBtns([["Ask the team on WhatsApp", waTo("Hi Adam's Beer Kitchen! " + (text || ""))]]), chips: BT_MAIN };
    }
  }
  function btSave() {
    try { sessionStorage.setItem(BT_KEY, JSON.stringify({ log: $(".bt__log", bt).innerHTML, chips: $(".bt__chips", bt).innerHTML, open: !bt.hidden, bk: bk, ctx: ctx, ai: aiLog.slice(-16) })); } catch (e) { /* storage off: chat still works on this page */ }
  }
  function btSay(who, html) {
    var log = $(".bt__log", bt), m = document.createElement("div");
    m.className = "bt-msg bt-msg--" + who; m.innerHTML = html; log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    /* the AI reads the whole chat, chip answers included, as plain text */
    var text = (m.innerText || m.textContent || "").replace(/\s+\n/g, "\n").trim();
    if (text) aiLog.push({ role: who === "you" ? "user" : "assistant", content: text.slice(0, 600) });
  }

  /* ---------------- Real AI Adam: once data.js has ai.endpoint, typed questions go to Claude
     (through the venue's own server, which holds the key). Chips stay instant. If the AI is slow
     or down, the built-in Adam answers instead, so the chat never breaks. */
  var AI = (D.ai && D.ai.endpoint) || (D.api ? D.api.replace(/\/$/, "") + "/api/adam" : ""), aiLog = [], BT_KEY = "abk_bt" + (TX ? "_" + LANG : "");
  function aiAsk(q) {
    var log = $(".bt__log", bt), t = document.createElement("div"), ctl = window.AbortController ? new AbortController() : null;
    btChips([]);
    t.className = "bt-msg bt-msg--bot bt-typing"; t.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    if (window.ABK_TRACK) window.ABK_TRACK.log("adam", { q: q.slice(0, 120) });
    fetch(AI, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: aiLog.slice(-12) }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error("AI " + r.status); return r.json(); })
      .then(function (a) { clearTimeout(timer); t.remove(); btReply(aiAnswer(a, q)); })
      .catch(function () { clearTimeout(timer); t.remove(); btReply(adamAnswer(q)); });
  }
  /* the booking card on the Arabic and Russian pages: their language on screen, English for the team */
  function bookCardTx(n) {
    var A = TX.adam, d = fromIso(bk.date), e = bk.slug ? find(bk.slug) : null, time = bk.time >= 0 ? bk.time : -1;
    var local = new Date(d.y, d.m, d.d).toLocaleDateString(LANG === "ar" ? "ar-AE-u-nu-latn" : "ru-RU", { weekday: "long", day: "numeric", month: "long" });
    var msg = "Hi Adam's Beer Kitchen! I'd like to book a table.\n\nDate: " + longDate(d) + (time >= 0 ? "\nTime: " + fmt(time) : "") + "\nGuests: " + n + (e ? "\nFor: " + e.name : "") + "\n\n" + A.pageNote;
    var rows = [[A.date, esc(local)]];
    if (time >= 0) rows.push([A.time, fmtL(time)]);
    rows.push([A.guests, String(n)], [A.forE, e ? esc(e.name) : A.justTable]);
    bk = null;
    return { html: A.booking + btList(rows) + "<p>" + A.bookingNote + "</p>" + btBtns([[A.sendWa, waTo(msg)]]), chips: [] };
  }
  function aiAnswer(a, q) {
    var html = '<p dir="auto">' + esc(a.reply || "").replace(/\n+/g, "<br>") + "</p>", btns = [];
    (a.links || []).forEach(function (l, i) { btns.push([esc(l.label), l.page + ".html", i ? "btn--ghost" : ""]); });
    if (a.handoff) btns.push([TX ? TX.adam.team : "Ask the team on WhatsApp", waTo((TX ? TX.waHello : "Hi Adam's Beer Kitchen! ") + q), btns.length ? "btn--ghost" : ""]);
    var first = { html: html + (btns.length ? btBtns(btns) : ""), chips: TX ? [] : BT_MAIN };
    var b = a.booking || {};
    if (b.wants && /^\d{4}-\d{2}-\d{2}$/.test(b.date) && b.guests > 0) {
      /* everything needed for a booking: show the WhatsApp booking card, same as the built-in Adam */
      var tm = /^(\d{1,2}):(\d{2})$/.exec(b.time || ""), ev = b.event && find(b.event);
      bk = { date: b.date, guests: Math.min(b.guests, 8), plus: b.guests >= 8, time: tm ? +tm[1] * 60 + +tm[2] : -1, slug: ev && ev.days ? ev.slug : "" };
      return [first, TX ? bookCardTx(b.guests) : bookStep()];
    }
    return first;
  }
  function btChips(list) {
    $(".bt__chips", bt).innerHTML = list.map(function (c) {
      return '<button class="chip" type="button" data-k="' + c[0] + '" data-a="' + esc(c[2] === undefined ? "" : c[2]) + '">' + esc(c[1]) + "</button>";
    }).join("");
  }
  /* one answer or several (Adam answers two-part questions in two bubbles) */
  function btReply(ans) {
    var queue = Array.isArray(ans) ? ans.slice() : [ans], log = $(".bt__log", bt), last = null;
    btChips([]);
    (function next() {
      var a = queue.shift();
      if (!a) { btChips((last && last.chips) || BT_MAIN); btSave(); return; }
      var t = document.createElement("div");
      t.className = "bt-msg bt-msg--bot bt-typing"; t.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(function () { t.remove(); btSay("bot", a.html); last = a; next(); }, reduce ? 0 : 520);
    })();
  }
  function btOpen(open, quiet) {
    if (!bt) return;
    bt.hidden = !open;
    $(".bt-launch").classList.toggle("is-hidden", open);
    if (open) {
      var log = $(".bt__log", bt);
      if (!log.children.length) btReply(btGreeting());
      log.scrollTop = log.scrollHeight;
      if (!quiet && window.innerWidth > 760) setTimeout(function () { $(".bt__form input", bt).focus(); }, 60);
    } else if (!quiet) $(".bt-launch").focus();
    btSave();
  }
  function initAdam() {
    if (TX && !AI) return; /* the built-in Adam speaks English only */
    var chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>';
    var send = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20l18-8L3 4l2.5 8z"/></svg>';
    document.body.insertAdjacentHTML("beforeend",
      '<button class="bt-launch" type="button" aria-haspopup="dialog" aria-controls="bt">' + chat + '<span class="bt-launch__txt">' + (TX ? TX.adam.launch : "Ask Adam") + "</span></button>" +
      '<section class="bt" id="bt" role="dialog" aria-label="' + (TX ? TX.adam.launch : "Ask Adam") + '" hidden>' +
      '<header class="bt__head"><img src="assets/img/logo.png" alt=""><div><b>' + (LANG === "ar" ? "آدم" : LANG === "ru" ? "Адам" : "Adam") + '</b><span><i class="dot" aria-hidden="true"></i>' + (TX ? TX.adam.sub : "Your host at Adam\'s Beer Kitchen JVC") + '</span></div><button class="bt__close" type="button" aria-label="' + (TX ? TX.adam.close : "Close chat") + '">&times;</button></header>' +
      '<div class="bt__log" role="log" aria-live="polite" data-lenis-prevent></div>' +
      '<div class="bt__chips" data-lenis-prevent></div>' +
      '<form class="bt__form" autocomplete="off"><input type="text" placeholder="' + (TX ? TX.adam.placeholder : AI ? 'Ask me anything, in any language' : 'Ask me anything, e.g. table for 4 tomorrow at 8') + '" aria-label="Your question" maxlength="200"><button type="submit" aria-label="Send">' + send + "</button></form>" +
      '<p class="bt__note">' + (TX ? TX.adam.note : "Answers come straight from our live schedule. For anything else, the team is on WhatsApp.") + "</p></section>");
    bt = $("#bt");
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(BT_KEY) || "null"); } catch (e) { saved = null; }
    if (saved && saved.log) {
      $(".bt__log", bt).innerHTML = saved.log.replace(/<div class="bt-msg bt-msg--bot bt-typing">[\s\S]*?<\/div>/g, "");
      if (saved.chips) $(".bt__chips", bt).innerHTML = saved.chips; else btChips(TX ? [] : BT_MAIN);
      bk = saved.bk || null;
      if (saved.ctx) ctx = saved.ctx;
      if (saved.ai) aiLog = saved.ai;
    }
    $(".bt-launch").addEventListener("click", function () { btOpen(true); });
    $(".bt__close", bt).addEventListener("click", function () { btOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && bt && !bt.hidden) btOpen(false); });
    $(".bt__chips", bt).addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      btSay("you", esc(c.textContent));
      btReply(btRoute(c.getAttribute("data-k"), c.getAttribute("data-a"), c.textContent));
    });
    $(".bt__log", bt).addEventListener("click", function (e) { if (e.target.closest("a")) btSave(); });
    $(".bt__form", bt).addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("input", this), q = inp.value.trim();
      if (!q) return;
      inp.value = "";
      btSay("you", esc(q));
      if (AI) aiAsk(q); else btReply(adamAnswer(q));
    });
    /* on laptops the chat stays open as visitors move between pages; on phones it waits, with the history kept */
    if (saved && saved.open && window.innerWidth > 760) btOpen(true, true);
    var demo = /[?&]chat(?:=([^&]+))?/.exec(location.search); /* preview: open the chat, optionally ask one question */
    if (demo) {
      btOpen(true, true);
      if (demo[1]) setTimeout(function () { var q = decodeURIComponent(demo[1]); btSay("you", esc(q)); if (AI) aiAsk(q); else btReply(adamAnswer(q)); }, 900);
    }
  }

  /* ---------------- boot ---------------- */
  headerUi();
  smooth();
  try { renderTakeover(); } catch (err) { /* if anything goes wrong, the slogan stays */ }
  document.documentElement.classList.remove("pre-hero");
  $$("[data-board]").forEach(renderBoard);
  $$("[data-marquee]").forEach(renderMarquee);
  $$("[data-whatson]").forEach(renderWhatsOn);
  $$("[data-specials]").forEach(renderSpecials);
  $$("[data-event]").forEach(renderEvent);
  $$("[data-hof]").forEach(renderHof);
  $$("[data-finder]").forEach(renderFinder);
  $$("[data-artists]").forEach(renderArtists);
  $$("[data-lineup-week]").forEach(renderLineupWeek);
  $$("[data-reviews]").forEach(renderReviews);
  $$("[data-reviews-mini]").forEach(renderReviewsMini);
  $$("[data-gallery]").forEach(renderGallery);
  $$("[data-wall]").forEach(renderWall);
  $$("[data-crew]").forEach(renderCrew);
  $$("[data-book]").forEach(renderBook);
  $$("[data-matchday]").forEach(renderMatchday);
  $$("[data-hours]").forEach(renderHours);
  $$("[data-map]").forEach(renderMap);
  $$("[data-findus]").forEach(renderFindUs);
  mapIn();
  $$("[data-rating]").forEach(renderRating);
  $$("[data-dishes]").forEach(renderDishes);
  paintLive(); setInterval(paintLive, 30000);
  initAdam();
  menuModal();
  $$("[data-week]").forEach(renderWeek);
  if (location.hash && $(location.hash)) setTimeout(function () { var t = $(location.hash); if (t) t.scrollIntoView(); }, 60);

  if (L.needGate && !window.__abkEntered) window.addEventListener("abk:enter", start, { once: true });
  else start();

  var shot = /[?&]shot=(\d+)/.exec(location.search);
  if (shot) setTimeout(function () {
    /* preview mode: shift the page instead of scrolling (headless screenshots can't scroll) */
    var n = +shot[1], wk = /[?&]wk=([\d.]+)/.exec(location.search);
    ["main", ".ftr"].forEach(function (s) { var el = $(s); if (el) el.style.transform = "translateY(-" + n + "px)"; });
    $("#hdr").classList.toggle("is-solid", n > 20);
    if (wk && hasGsap) { var t = gsap.getTweensOf(".week__track")[0]; if (t) t.progress(+wk[1]); }
    console.log("PAGEH " + document.documentElement.scrollHeight);
  }, 400);

  window.ABK = { biz: biz, liveStatus: liveStatus, nextOn: nextOn, fmt: fmt, adamAnswer: adamAnswer, normalize: normalize };
})();
