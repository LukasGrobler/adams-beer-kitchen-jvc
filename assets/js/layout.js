/* Shared layout. Runs at the very top of <body> so the header, age check and
   pour intro exist before the page paints (no flash). The footer is mounted
   by app.js once the page content has loaded. */
(function () {
  var D = window.ABK_DATA, V = D.venue;
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file.indexOf(".html") === -1) file = "index.html";
  var isHome = file === "index.html";
  /* Arabic and Russian pages (ar.html, ru.html) set <html lang> and load i18n.js */
  var LANG = (document.documentElement.getAttribute("lang") || "en").slice(0, 2);
  var TX = LANG !== "en" && window.ABK_I18N ? window.ABK_I18N[LANG] : null;
  function tx(k, en) { return TX && TX[k] !== undefined ? TX[k] : en; }
  var home = TX ? file : "index.html", bookHref = TX ? "#book" : "book.html";
  if (isHome) { document.documentElement.classList.add("pre-hero"); setTimeout(function () { document.documentElement.classList.remove("pre-hero"); }, 2500); }

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  var I = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 4.8"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l2-6h14l2 6v5H3z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
    lift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M7.5 10l1.5-2 1.5 2M13.5 14l1.5 2 1.5-2"/></svg>',
    hop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l5 3.6-5 3-5-3zM7 8.6l5 3 5-3v3.2l-5 3-5-3zM7 14.2l5 3 5-3V17l-5 4-5-4z"/></svg>'
  };

  var nav = TX ? TX.nav : [
    ["whats-on.html", "What's on"],
    ["brunches.html", "Brunches"],
    ["live-music.html", "Live music", "opt"],
    ["sports.html", "Sports", "opt"],
    ["menu.html", "Menu"]
  ];
  var more = [
    ["live-music.html", "Live music", "opt"],
    ["sports.html", "Sports & darts", "opt"],
    ["club.html", "Adam's Club"],
    ["matches.html", "Match board"],
    ["predictor.html", "Score predictor"],
    ["christmas-parties.html", "Christmas & NYE"],
    ["vouchers.html", "Gift vouchers"],
    ["quiz-league.html", "Quiz league"],
    ["songs.html", "Request a song"],
    ["offers.html", "Offers"],
    ["gallery.html", "Gallery"],
    ["reviews.html", "Reviews"],
    ["about.html", "Our story"],
    ["hotel-guests.html", "Hotel guests"],
    ["creators.html", "Creators"],
    ["find-us.html", "Find us"]
  ];
  /* Grand Prix season (data.js > f1), listed until the last race */
  if (D.f1 && new Date(Date.now() + 4 * 36e5).toISOString().slice(0, 10) <= D.f1.to) more.splice(3, 0, ["grand-prix.html", "Grand Prix season"]);
  if (TX) more = [];
  /* the language picker: every page, top right */
  var LANGS = [["index.html", "English", "en", "EN"], ["ar.html", "العربية", "ar", "ع"], ["ru.html", "Русский", "ru", "RU"]];
  var globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/></svg>';
  var langPick = '<div class="langpick"><button type="button" aria-expanded="false" aria-controls="langdrop" aria-label="Language / اللغة / Язык">' + globe + "<span>" + LANGS.filter(function (l) { return l[2] === LANG; })[0][3] + "</span>" + "</button>" +
    '<div class="langpick__drop" id="langdrop">' + LANGS.map(function (l) {
      return '<a href="' + l[0] + '" lang="' + l[2] + '"' + (l[2] === "ar" ? ' dir="rtl"' : "") + (l[2] === LANG ? ' aria-current="true"' : "") + ">" + l[1] + "</a>";
    }).join("") + "</div></div>";
  function hl(n) { return n[3] ? ' lang="' + n[3] + '"' + (n[3] === "ar" ? ' dir="rtl"' : "") : ""; }
  function cur(h) { return h === file ? ' aria-current="page"' : ""; }

  var waLink = "https://wa.me/" + V.whatsapp + "?text=" + encodeURIComponent(tx("waHello", "Hi Adam's Beer Kitchen! "));

  var header =
    '<a class="skip" href="#main">' + tx("skip", "Skip to content") + "</a>" +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter></svg>' +
    '<header class="hdr" id="hdr"><div class="wrap hdr__in">' +
    '<a class="brand" href="' + home + '" aria-label="Adam\'s Beer Kitchen JVC, home"><img src="assets/img/logo.png" alt="" width="58" height="58"><span class="brand__txt"><span class="brand__name">Adam\'s Beer Kitchen</span><span class="brand__sub">' + tx("brandSub", "JVC, Floor 1 of HE Hotel") + "</span></span></a>" +
    '<nav class="nav" aria-label="Main">' +
    nav.map(function (n) { return '<a class="nav__a' + (n[2] ? " nav__a--opt" : "") + '" href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") +
    (more.length ? '<div class="nav__more"><button type="button" aria-expanded="false" aria-controls="moredrop">More ' + I.chev + '</button><div class="nav__drop" id="moredrop">' +
    more.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] ? ' class="opt"' : "") + hl(n) + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") +
    "</div></div>" : "") + "</nav>" +
    '<div class="hdr__cta">' + langPick + '<span class="pill" data-open-pill><span class="pill__dot"></span><span data-open-text>' + tx("openDaily", "Open daily 12PM – 3AM") + '</span></span><a class="btn btn--sm" href="' + bookHref + '">' + tx("bookShort", "Book a table") + "</a>" +
    '<button class="hdr__burger" type="button" aria-label="' + tx("menuOpen", "Open menu") + '" aria-expanded="false" aria-controls="mnav"><span></span></button></div>' +
    "</div></header>" +
    '<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menu"><div class="mnav__top"><a class="brand" href="' + home + '"><img src="assets/img/logo.png" alt="Adam\'s Beer Kitchen" width="58" height="58"></a><button class="mnav__close" type="button" aria-label="' + tx("menuClose", "Close menu") + '">&times;</button></div>' +
    '<ul class="mnav__list">' +
    [[home, tx("home", "Home")]].concat(nav, more.filter(function (m) { return !m[2]; })).map(function (n, i) {
      return '<li' + (i > 5 ? ' class="mnav__minor"' : "") + '><a href="' + n[0] + '"' + hl(n) + cur(n[0]) + ">" + n[1] + "</a></li>";
    }).join("") +
    "</ul>" +
    '<div class="mnav__langs">' + LANGS.map(function (l) { return '<a href="' + l[0] + '" lang="' + l[2] + '"' + (l[2] === LANG ? ' aria-current="true"' : "") + ">" + l[1] + "</a>"; }).join("") + "</div>" +
    '<div class="mnav__foot"><a class="btn" href="' + bookHref + '">' + tx("book", "Book a table") + '</a><div class="btn-row" style="display:grid;grid-template-columns:1fr 1fr"><a class="btn btn--wa" href="' + waLink + '" target="_blank" rel="noopener">' + I.wa + " " + tx("wa", "WhatsApp") + '</a><a class="btn btn--ghost" href="tel:' + V.phone + '">' + I.phone + " " + tx("call", "Call") + "</a></div></div></div>";

  /* 21+ check, remembered on this device */
  var skip = /[?&]skip\b/.test(location.search); /* preview mode for screenshots */
  var fresh = /[?&]fresh\b/.test(location.search); /* demo mode: show the age check and the pour again */
  if (fresh) { try { localStorage.removeItem("abk_age_ok"); sessionStorage.removeItem("abk_pour"); } catch (e) {} }
  var needGate = !skip && ls("abk_age_ok") !== "1";
  var gate = needGate ?
    '<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-q"><div class="gate__card">' +
    '<img class="gate__logo" src="assets/img/logo.png" alt="Adam\'s Beer Kitchen" width="190" height="190">' +
    '<h2 class="gate__q" id="gate-q">' + tx("gateQ", "Are you 21 or over?") + "</h2>" +
    '<p class="gate__fine">' + tx("gateFine", "This website features alcohol. In line with UAE law, you need to be 21 or over to come in.") + "</p>" +
    '<div class="btn-row" style="justify-content:center"><button class="btn" type="button" data-gate-yes>' + tx("gateYes", "Yes, I\'m 21+") + '</button><button class="btn btn--ghost" type="button" data-gate-no>' + tx("gateNo", "Not yet") + "</button></div>" +
    '<p class="gate__no" aria-live="polite"></p></div></div>' : "";

  /* the pour: homepage, once per visit (add ?intro to the address to see it again) */
  var forcePour = /[?&]intro\b/.test(location.search);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var needPour = isHome && !reduce && !skip && (forcePour || ss("abk_pour") !== "1");
  var glass = "M30 22 H190 L196 70 L176 308 Q175 318 165 318 H55 Q45 318 44 308 L24 70 Z";
  var bubbles = "";
  [[60, 290, 0], [92, 300, .3], [130, 280, .15], [160, 296, .45], [110, 310, .6], [76, 270, .75], [150, 262, .9]].forEach(function (b) {
    bubbles += '<circle class="pour__bubble" cx="' + b[0] + '" cy="' + b[1] + '" r="2.6" fill="#fff4d6" style="animation-delay:' + b[2] + 's"/>';
  });
  var pour = needPour ?
    '<div class="pour" id="pour" aria-hidden="true"><div class="pour__stage">' +
    '<svg class="pour__glass" viewBox="0 0 220 340" style="opacity:0"><defs>' +
    '<clipPath id="pourClip"><path d="' + glass + '"/></clipPath>' +
    '<linearGradient id="pourBeer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd66b"/><stop offset=".35" stop-color="#f5b02e"/><stop offset="1" stop-color="#b8640c"/></linearGradient>' +
    '<linearGradient id="pourDepth" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".25" stop-color="#fff" stop-opacity=".14"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>' +
    '<linearGradient id="pourStream" x1="0" x2="1"><stop offset="0" stop-color="#e99a16"/><stop offset=".5" stop-color="#ffd970"/><stop offset="1" stop-color="#e99a16"/></linearGradient></defs>' +
    '<rect class="pour__stream" x="104" y="-420" width="12" height="0" rx="6" fill="url(#pourStream)"/>' +
    '<g clip-path="url(#pourClip)"><g class="pour__liquid" transform="translate(0 335)"><rect width="220" height="360" fill="url(#pourBeer)"/><rect width="220" height="360" fill="url(#pourDepth)"/>' + bubbles +
    '<g class="pour__foam"><path d="M0 -30 C14 -40 28 -24 44 -32 S72 -42 88 -30 S118 -22 134 -34 S164 -42 180 -30 S208 -24 220 -32 V6 H0 Z" fill="#fff6e2"/>' +
    '<circle cx="30" cy="-12" r="5" fill="#fffdf7"/><circle cx="74" cy="-6" r="4" fill="#fffdf7"/><circle cx="120" cy="-14" r="6" fill="#fffdf7"/><circle cx="168" cy="-8" r="4.5" fill="#fffdf7"/>' +
    '<path d="M0 6 H220" stroke="#efd29c" stroke-width="4"/></g></g></g>' +
    '<path d="' + glass + '" fill="rgba(255,255,255,.05)" stroke="rgba(244,234,219,.88)" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<g clip-path="url(#pourClip)">' +
    '<path d="M48 302 Q110 314 172 302" stroke="rgba(255,255,255,.28)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<path d="M37 88 L53 282" stroke="#fff" stroke-opacity=".28" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M184 92 L179 150" stroke="#fff" stroke-opacity=".18" stroke-width="4" stroke-linecap="round"/></g></svg>' +
    '<img class="pour__logo" src="assets/img/logo.png" alt="" width="160" height="160" style="opacity:0">' +
    '<p class="pour__slogan"><span style="opacity:0">Good food.</span> <span style="opacity:0">Cold beer.</span> <span style="opacity:0">Great vibes.</span></p></div>' +
    '<svg class="pour__edge" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 H1440 V30 C1340 58 1260 18 1160 40 S960 62 860 36 S660 14 560 40 S360 64 260 36 S80 20 0 44 Z" fill="#fff4dc"/></svg>' +
    '<button class="pour__skip" type="button">Skip intro</button></div>' : "";

  if (needGate || needPour) document.documentElement.classList.add("is-locked");

  var me = document.currentScript;
  me.insertAdjacentHTML("afterend", header + gate + pour);

  (function () {
    var lp = document.querySelector(".langpick"), b = lp && lp.querySelector("button");
    if (!lp) return;
    function set(o) { lp.classList.toggle("is-open", o); b.setAttribute("aria-expanded", String(o)); }
    b.addEventListener("click", function (e) { e.stopPropagation(); set(!lp.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { if (!lp.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  })();

  if (needGate) {
    var g = document.getElementById("gate");
    g.querySelector("[data-gate-yes]").addEventListener("click", function () {
      ls("abk_age_ok", "1");
      g.classList.add("is-leaving");
      /* start the pour straight away, so it's already pouring as the question fades */
      window.__abkEntered = true;
      window.dispatchEvent(new Event("abk:enter"));
      setTimeout(function () { g.remove(); }, 560);
    });
    g.querySelector("[data-gate-no]").addEventListener("click", function () {
      g.querySelector(".gate__no").textContent = tx("gateNoText", "Come back on your 21st. We'll save you a stool.");
    });
    setTimeout(function () { var y = g.querySelector("[data-gate-yes]"); if (y) y.focus(); }, 50);
  }

  /* footer + mobile action bar, mounted by app.js */
  function mountFooter() {
    if (document.querySelector(".ftr")) return;
    var year = new Date().getFullYear();
    if (TX) return document.body.insertAdjacentHTML("beforeend", footerTx(year));
    var html =
      '<footer class="ftr"><div class="wrap"><div class="ftr__grid">' +
      '<div class="ftr__brand"><img src="assets/img/logo.png" alt="Adam\'s Beer Kitchen" width="120" height="120"><p>Good food, cold beer and great vibes, one floor up at HE Hotel Apartments. JVC\'s best-kept secret, until now.</p></div>' +
      '<div><h3>Visit</h3><address>' + V.address.join("<br>") + "</address><p class=\"small\" style=\"margin-top:10px\">Open daily 12PM – 3AM<br>Valet parking available</p></div>" +
      '<div><h3>Talk to us</h3><ul><li><a href="tel:' + V.phone + '">' + V.phoneDisplay + '</a></li><li><a href="' + waLink + '" target="_blank" rel="noopener">WhatsApp us</a></li><li><a href="' + V.instagram + '" target="_blank" rel="noopener">Instagram ' + V.handle + '</a></li><li><a href="book.html">Book a table</a></li></ul></div>' +
      '<div class="ftr__explore"><h3>Explore</h3><ul><li><a href="whats-on.html">What\'s on</a></li><li><a href="brunches.html">Brunches & drunches</a></li><li><a href="live-music.html">Live music</a></li><li><a href="sports.html">Sports & darts</a></li><li><a href="club.html">Adam\'s Club</a></li><li><a href="matches.html">Match board</a></li><li><a href="predictor.html">Score predictor</a></li><li><a href="christmas-parties.html">Christmas &amp; NYE</a></li><li><a href="vouchers.html">Gift vouchers</a></li><li><a href="quiz-league.html">Quiz league</a></li><li><a href="offers.html">Offers</a></li><li><a href="menu.html">Menu</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="reviews.html">Reviews</a></li><li><a href="about.html">Our story</a></li><li><a href="hotel-guests.html">Hotel guests</a></li><li><a href="songs.html">Request a song</a></li><li><a href="creators.html">Creators</a></li><li><a href="find-us.html">Find us</a></li><li><a href="ar.html" lang="ar" dir="rtl">العربية</a></li><li><a href="ru.html" lang="ru">Русский</a></li></ul></div>' +
      "</div>" +
      '<p class="ftr__family">Also pouring in Abu Dhabi: <a href="https://lukasgrobler.github.io/adams-beer-kitchen-al-reem/">Adam\x27s Beer Kitchen Al Reem Island</a> and <a href="https://lukasgrobler.github.io/adams-beer-kitchen-al-forsan/">Adam\x27s Beer Kitchen Al Forsan</a>.</p>' +
      '<div class="ftr__base"><span>&copy; ' + year + " Adam's Beer Kitchen JVC. Please drink responsibly. Over-21s only.</span>" +
      '<span class="ftr__legal"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></span>' +
      (isHome ? '<a href="index.html?intro">Pour another (replay the intro)</a>' : "") +
      '<span class="ftr__credit">Website by Lukas Grobler</span></div>' +
      "</div></footer>" +
      '<nav class="actbar" aria-label="Quick actions"><a href="tel:' + V.phone + '">' + I.phone + ' Call</a><a href="' + waLink + '" target="_blank" rel="noopener">' + I.wa + ' WhatsApp</a><a class="actbar__book" href="book.html">Book a table</a></nav>' +
      '<div class="toast" role="status" aria-live="polite"></div>';
    document.body.insertAdjacentHTML("beforeend", html);
  }

  function footerTx(year) {
    return '<footer class="ftr"><div class="wrap"><div class="ftr__grid">' +
      '<div class="ftr__brand"><img src="assets/img/logo.png" alt="Adam\'s Beer Kitchen" width="120" height="120"><p>' + TX.ftrBlurb + "</p></div>" +
      "<div><h3>" + TX.ftrVisit + "</h3><address>" + TX.ftrAddress.join("<br>") + '</address><p class="small" style="margin-top:10px">' + TX.ftrHours + "<br>" + TX.ftrValet + "</p></div>" +
      "<div><h3>" + TX.ftrTalk + '</h3><ul><li><a href="tel:' + V.phone + '" dir="ltr">' + V.phoneDisplay + '</a></li><li><a href="' + waLink + '" target="_blank" rel="noopener">' + TX.ftrWa + '</a></li><li><a href="' + V.instagram + '" target="_blank" rel="noopener">' + TX.ftrIg + " " + V.handle + '</a></li><li><a href="#book">' + TX.book + "</a></li></ul></div>" +
      '<div class="ftr__explore"><h3>' + TX.ftrExplore + "</h3><ul>" + TX.nav.map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") +
      '<li><a href="index.html" lang="en" dir="ltr">' + TX.ftrEnglish + "</a></li>" + TX.langs.filter(function (l) { return l[2] !== "en"; }).map(function (l) { return '<li><a href="' + l[0] + '"' + hl([0, 0, 0, l[2]]) + ">" + l[1] + "</a></li>"; }).join("") + "</ul></div>" +
      "</div>" +
      '<p class="ftr__family">' + TX.ftrFamily + ' <a href="https://lukasgrobler.github.io/adams-beer-kitchen-al-reem/">' + TX.ftrReem + "</a>" + TX.ftrAnd + '<a href="https://lukasgrobler.github.io/adams-beer-kitchen-al-forsan/">' + TX.ftrForsan + "</a>.</p>" +
      '<div class="ftr__base"><span>&copy; ' + year + " Adam's Beer Kitchen JVC. " + TX.ftrBase + "</span>" +
      '<span class="ftr__legal"><a href="privacy.html">' + TX.ftrPrivacy + '</a><a href="terms.html">' + TX.ftrTerms + "</a></span>" +
      '<span class="ftr__credit">' + TX.ftrCredit + "</span></div>" +
      "</div></footer>" +
      '<nav class="actbar" aria-label="Quick actions"><a href="tel:' + V.phone + '">' + I.phone + " " + TX.call + '</a><a href="' + waLink + '" target="_blank" rel="noopener">' + I.wa + " " + TX.wa + '</a><a class="actbar__book" href="#book">' + TX.bookShort + "</a></nav>" +
      '<div class="toast" role="status" aria-live="polite"></div>';
  }

  window.ABK_LAYOUT = { icons: I, mountFooter: mountFooter, isHome: isHome, file: file, needGate: needGate, needPour: needPour, ss: ss, ls: ls, waLink: waLink, lang: LANG, tx: TX };
})();
