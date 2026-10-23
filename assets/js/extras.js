/* Adam's Beer Kitchen JVC, v2 features: campaign landing pages with deposits, gift vouchers,
   a practice checkout, the table picker in the booking form, the quiz league and the bookings dashboard.
   Loads after app.js. Payments run in demo mode until data.js > payments has real payment links. */
(function () {
  "use strict";
  var D = window.ABK_DATA, V = D.venue, TR = window.ABK_TRACK;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function img(n) { return "assets/img/ig/" + n + ".jpg"; }
  function aed(n) { return "AED " + Number(n).toLocaleString("en-US"); }
  function waTo(text) { return "https://wa.me/" + V.whatsapp + "?text=" + encodeURIComponent(text); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function todayIso() { var d = new Date(Date.now() + 4 * 36e5); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function nice(iso) { var p = iso.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); return DAYS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON3[d.getUTCMonth()]; }
  function code(prefix) { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 4; i++) s += c.charAt(Math.floor(Math.random() * c.length)); return prefix + "-" + s; }
  function q(name) { return new URLSearchParams(location.search).get(name); }
  var I = (window.ABK_LAYOUT && window.ABK_LAYOUT.icons) || {};

  /* ---------------- campaign landing pages ---------------- */
  function findCampaign(slug) { return D.campaigns.filter(function (c) { return c.slug === slug; })[0]; }
  function renderCampaign(root) {
    var c = findCampaign(root.getAttribute("data-campaign"));
    if (!c) return;
    var MAXG = D.venue.groupMax || 40; /* bigger groups call the team */
    var t0 = todayIso(), minD = c.from > t0 ? c.from : t0;
    var pkgs = c.packages.map(function (p, i) {
      return '<label class="pk' + (i === 0 ? " is-on" : "") + '"><input type="radio" name="pkg" value="' + p.id + '"' + (i === 0 ? " checked" : "") + '>' +
        '<span class="pk__name">' + esc(p.name) + '</span><span class="pk__note">' + esc(p.note) + '</span>' +
        '<span class="pk__price"><b>' + aed(p.price) + "</b> per " + esc(p.per || "person") + "</span>" +
        '<span class="pk__dep">' + (p.deposit ? (p.deposit === p.price ? "Paid in full to book" : aed(p.deposit) + " deposit per person to lock the date") : "Free to book, pay on the night") + "</span></label>";
    }).join("");
    root.innerHTML =
      '<section class="cp-hero"><div class="wrap cp-hero__in"><div class="cp-hero__copy">' +
      '<p class="cp-season">' + esc(c.season) + '</p>' +
      '<h1 class="d-hero cp-title">' + c.title.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("") + "</h1>" +
      '<p class="voice">' + esc(c.hook) + "</p>" +
      '<ul class="cp-perks">' + c.perks.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="frame frame--tilt cp-photo"><img src="' + img(c.img) + '" alt="' + esc(c.name) + ' at Adam\'s Beer Kitchen JVC"></div></div></section>' +
      '<section class="sec sec--tight" style="padding-top:0"><div class="wrap cp-book">' +
      '<form class="form cp-form" novalidate>' +
      '<fieldset class="field"><legend>Pick your package</legend><div class="pks">' + pkgs + "</div></fieldset>" +
      '<div class="form__row"><div class="field"><label for="cp-date">Date</label><input id="cp-date" type="date" min="' + minD + '" max="' + c.to + '" value="' + minD + '"></div>' +
      '<div class="field"><label for="cp-guests">Guests</label><div class="stepper"><button type="button" data-cstep="-1" aria-label="One fewer guest">&minus;</button><input id="cp-guests" type="number" min="' + c.groupMin + '" max="' + MAXG + '" value="' + c.groupMin + '" inputmode="numeric"><button type="button" data-cstep="1" aria-label="One more guest">+</button></div><p class="small guest-note">More than ' + MAXG + ' guests? <a href="tel:' + D.venue.phone + '">Call the team</a> on ' + D.venue.phoneDisplay + '.</p></div></div>' +
      '<div class="field"><label for="cp-name">Your name</label><input id="cp-name" autocomplete="name" placeholder="e.g. Sarah"></div>' +
      '<div class="field"><label for="cp-co">Company or group <span class="small">(optional)</span></label><input id="cp-co" autocomplete="organization" placeholder="e.g. Emaar finance team"></div>' +
      '<p class="small" data-cp-msg aria-live="polite" style="margin:0"></p></form>' +
      '<aside class="cp-sum" aria-live="polite"><p class="kicker" style="margin:0">Your booking</p><div data-cp-sum></div></aside>' +
      "</div></section>";
    var form = $(".cp-form", root), sum = $("[data-cp-sum]", root), msg = $("[data-cp-msg]", form);
    function state() {
      var id = $('input[name="pkg"]:checked', form).value, p = c.packages.filter(function (x) { return x.id === id; })[0];
      var g = Math.max(c.groupMin, Math.min(MAXG, +$("#cp-guests", form).value || c.groupMin));
      return { p: p, g: g, date: $("#cp-date", form).value, name: $("#cp-name", form).value.trim(), co: $("#cp-co", form).value.trim() };
    }
    function draw() {
      /* a bucket or a tower is priced per item, so there's no total for the group */
      var s = state(), each = s.p.per && s.p.per !== "person", total = s.p.price * s.g, dep = s.p.deposit * s.g;
      $$(".pk", form).forEach(function (l) { l.classList.toggle("is-on", $("input", l).checked); });
      sum.innerHTML =
        '<ul class="cp-lines"><li><span>' + esc(s.p.name) + "</span><b>" + aed(s.p.price) + (each ? " per " + esc(s.p.per) : " × " + s.g) + "</b></li>" +
        "<li><span>" + (s.date ? nice(s.date) : "Pick a date") + "</span><b>" + s.g + " guests</b></li>" +
        (each ? "" : '<li class="cp-total"><span>Package total</span><b>' + aed(total) + "</b></li>") +
        (dep ? '<li class="cp-dep"><span>' + (dep === total ? "Pay now" : "Deposit to pay now") + "</span><b>" + aed(dep) + "</b></li>" : "") + "</ul>" +
        (dep ? '<button class="btn" type="button" data-cp-go>Reserve with ' + aed(dep) + " " + (dep === total ? "payment" : "deposit") + "</button>"
          : '<button class="btn btn--wa" type="button" data-cp-go>' + (I.wa || "") + " Book on WhatsApp</button>") +
        '<p class="small" style="margin:0">' + (dep ? "The deposit comes off your bill on the night. " : "") + "The team confirms every booking on WhatsApp.</p>";
    }
    form.addEventListener("change", draw); form.addEventListener("input", draw);
    form.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cstep]"); if (!b) return;
      var inp = $("#cp-guests", form); inp.value = Math.max(c.groupMin, Math.min(MAXG, (+inp.value || 0) + +b.getAttribute("data-cstep"))); draw();
    });
    root.addEventListener("click", function (e) {
      if (!e.target.closest("[data-cp-go]")) return;
      var s = state();
      if (!s.name) { msg.textContent = "Add your name so the team knows who's booking."; $("#cp-name", form).focus(); return; }
      if (!s.date || s.date < $("#cp-date", form).min || s.date > c.to) { msg.textContent = "Pick a date within " + c.season + "."; $("#cp-date", form).focus(); return; }
      msg.textContent = "";
      var dep = s.p.deposit * s.g;
      if (dep) {
        location.href = "checkout.html?" + new URLSearchParams({ kind: "deposit", c: c.slug, item: s.p.id, guests: s.g, date: s.date, name: s.name, co: s.co }).toString();
      } else {
        window.open(waTo("Hi Adam's Beer Kitchen! I'd like to book a table.\n\nName: " + s.name + "\nDate: " + nice(s.date) + "\nGuests: " + s.g + "\nPackage: " + s.p.name + (s.co ? "\nGroup: " + s.co : "") + "\n\nSent from the " + c.name + " page"), "_blank", "noopener");
      }
    });
    draw();
  }

  /* ---------------- checkout (deposits and vouchers) ---------------- */
  function itemFor(p) {
    if (p.get("kind") === "voucher") {
      var v = D.vouchers.filter(function (x) { return x.id === p.get("item"); })[0];
      return v ? { title: "Gift voucher: " + v.name, lines: [["For", p.get("to") || "—"], ["From", p.get("from") || "—"]], amount: v.price, v: v } : null;
    }
    var c = findCampaign(p.get("c")), pk = c && c.packages.filter(function (x) { return x.id === p.get("item"); })[0];
    if (!pk) return null;
    var g = +p.get("guests") || 1;
    return { title: c.name + ": " + pk.name, lines: [["Date", nice(p.get("date"))], ["Guests", g], ["Name", p.get("name") || "—"]], amount: pk.deposit * g, total: pk.price * g, c: c, pk: pk, g: g };
  }
  function renderCheckout(root) {
    var p = new URLSearchParams(location.search), it = itemFor(p);
    if (!it) { root.innerHTML = '<div class="empty">Nothing to pay for here. <a class="link" href="christmas-parties.html">See Christmas parties</a> or <a class="link" href="vouchers.html">gift vouchers</a>.</div>'; return; }
    if (D.payments.mode === "links" && D.payments.links[p.get("item")]) { location.href = D.payments.links[p.get("item")]; return; }
    root.innerHTML =
      '<div class="co"><div class="co__sum"><p class="kicker" style="margin:0">You\'re paying for</p><h2 class="d-m" style="margin:6px 0 12px">' + esc(it.title) + "</h2>" +
      '<ul class="cp-lines">' + it.lines.map(function (l) { return "<li><span>" + esc(l[0]) + "</span><b>" + esc(l[1]) + "</b></li>"; }).join("") +
      (it.total && it.total !== it.amount ? '<li><span>Package total</span><b>' + aed(it.total) + "</b></li>" : "") +
      '<li class="cp-dep"><span>' + (p.get("kind") === "voucher" ? "Voucher value" : it.total === it.amount ? "Pay now" : "Deposit now") + "</span><b>" + aed(it.amount) + "</b></li></ul></div>" +
      '<form class="form co__pay" novalidate><p class="demo-note">Practice checkout: no card is charged. At launch this is the venue\'s own secure payment page (card or Apple Pay).</p>' +
      '<div class="field"><label for="co-card">Card number</label><input id="co-card" inputmode="numeric" value="4242 4242 4242 4242" autocomplete="off"></div>' +
      '<div class="form__row"><div class="field"><label for="co-exp">Expiry</label><input id="co-exp" value="12 / 28" autocomplete="off"></div><div class="field"><label for="co-cvc">CVC</label><input id="co-cvc" value="123" autocomplete="off"></div></div>' +
      '<button class="btn" type="submit">Pay ' + aed(it.amount) + '</button><p class="small" style="margin:0">By paying you agree to our <a href="terms.html">terms</a>, including the refund rules.</p></form></div>';
    $(".co__pay", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $("button", this); btn.disabled = true; btn.textContent = "Processing…";
      setTimeout(function () {
        var kind = p.get("kind");
        if (kind === "voucher") {
          var vc = code("JVC-GIFT");
          if (TR) TR.log("voucher", { amount: it.amount, item: it.v.name, ref: vc });
          location.href = "voucher.html?" + new URLSearchParams({ code: vc, item: it.v.id, to: p.get("to") || "", from: p.get("from") || "", msg: p.get("msg") || "" }).toString();
          return;
        }
        var ref = code("JVC");
        if (TR) TR.log("deposit", { amount: it.amount, item: it.pk.name, guests: it.g, ref: ref });
        root.innerHTML = '<div class="co-done"><p class="kicker" style="margin:0">Deposit received</p><h2 class="d-l" style="margin:8px 0 12px">You\'re booked in</h2>' +
          '<p class="lede">Reference <b>' + ref + "</b>. " + esc(it.c.name) + ", " + esc(it.pk.name) + ", " + it.g + " guests on " + nice(p.get("date")) + ". " + aed(it.amount) + " paid.</p>" +
          '<div class="btn-row"><a class="btn btn--wa" target="_blank" rel="noopener" href="' + waTo("Hi Adam's Beer Kitchen! I've paid the deposit for our booking.\n\nRef: " + ref + "\nName: " + (p.get("name") || "") + "\nDate: " + nice(p.get("date")) + "\nGuests: " + it.g + "\nPackage: " + it.c.name + ", " + it.pk.name + "\nDeposit: " + aed(it.amount)) + '">' + (I.wa || "") + ' Send the confirmation on WhatsApp</a><a class="btn btn--ghost" href="index.html">Back to the homepage</a></div>' +
          '<p class="small" style="margin-top:16px">Demo: in the live version the payment provider emails the receipt and the team gets the booking straight away.</p></div>';
      }, 1200);
    });
  }

  /* ---------------- gift vouchers ---------------- */
  function renderVouchers(root) {
    var first = D.vouchers[0];
    root.innerHTML = '<div class="vgrid">' + D.vouchers.map(function (v, i) {
      return '<label class="vcard' + (i === 0 ? " is-on" : "") + '"><input type="radio" name="voucher" value="' + v.id + '"' + (i === 0 ? " checked" : "") + '><span class="vcard__img"><img src="' + img(v.img) + '" alt="" loading="lazy"></span><span class="vcard__name">' + esc(v.name) + '</span><span class="vcard__note">' + esc(v.note) + '</span><span class="vcard__price">' + aed(v.price) + "</span></label>";
    }).join("") + "</div>" +
      '<form class="form vform" novalidate><div class="form__row"><div class="field"><label for="vo-to">Who\'s it for?</label><input id="vo-to" placeholder="e.g. Sam"></div><div class="field"><label for="vo-from">From</label><input id="vo-from" autocomplete="name" placeholder="e.g. Sarah"></div></div>' +
      '<div class="field"><label for="vo-msg">A message <span class="small">(optional)</span></label><input id="vo-msg" maxlength="90" placeholder="Happy birthday! First round\'s on me."></div>' +
      '<button class="btn" type="submit" data-vo-buy>Buy the ' + esc(first.name) + " voucher, " + aed(first.price) + '</button><p class="small" data-vo-msg aria-live="polite" style="margin:0"></p></form>';
    var form = $(".vform", root);
    function pick() { var id = $('input[name="voucher"]:checked', root).value; return D.vouchers.filter(function (v) { return v.id === id; })[0]; }
    root.addEventListener("change", function () {
      $$(".vcard", root).forEach(function (l) { l.classList.toggle("is-on", $("input", l).checked); });
      var v = pick(); $("[data-vo-buy]", root).textContent = "Buy the " + v.name + " voucher, " + aed(v.price);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = $("#vo-to", form).value.trim(), from = $("#vo-from", form).value.trim();
      if (!to || !from) { $("[data-vo-msg]", form).textContent = "Add who it's for and who it's from."; (to ? $("#vo-from", form) : $("#vo-to", form)).focus(); return; }
      location.href = "checkout.html?" + new URLSearchParams({ kind: "voucher", item: pick().id, to: to, from: from, msg: $("#vo-msg", form).value.trim() }).toString();
    });
  }
  function renderVoucher(root) {
    var p = new URLSearchParams(location.search), v = D.vouchers.filter(function (x) { return x.id === p.get("item"); })[0];
    if (!v) { root.innerHTML = '<div class="empty">This voucher link isn\'t complete. <a class="link" href="vouchers.html">See gift vouchers</a></div>'; return; }
    var link = location.href;
    root.innerHTML =
      '<div class="gift"><div class="gift__card"><img class="gift__logo" src="assets/img/logo.png" alt="Adam\'s Beer Kitchen"><p class="gift__for">For ' + esc(p.get("to") || "you") + '</p><p class="gift__name">' + esc(v.name) + '</p><p class="gift__note">' + esc(v.note) + "</p>" +
      (p.get("msg") ? '<p class="gift__msg">“' + esc(p.get("msg")) + "”</p>" : "") + '<p class="gift__from">From ' + esc(p.get("from") || "a friend") + '</p><p class="gift__code"><span>Voucher code</span><b>' + esc(p.get("code") || "") + "</b></p>" +
      '<p class="gift__fine">Adam\'s Beer Kitchen JVC, Floor 1, HE Hotel Apartments. Valid for 12 months. Show this at the bar.</p></div>' +
      '<div class="btn-row" style="justify-content:center;margin-top:22px"><a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent("A gift for you from " + (p.get("from") || "me") + ": " + v.name + " at Adam's Beer Kitchen JVC. Your voucher: " + link) + '">' + (I.wa || "") + ' Send it on WhatsApp</a><button class="btn btn--ghost" type="button" onclick="window.print()">Print it</button></div></div>';
  }

  /* ---------------- table picker (booking form) ---------------- */
  function renderTablePicker(root) {
    var seat = $("#bk-seat");
    if (!seat) return;
    D.zones.forEach(function (z) { if (!$$("option", seat).some(function (o) { return o.textContent === z.seat; })) seat.insertAdjacentHTML("beforeend", "<option>" + esc(z.seat) + "</option>"); });
    /* a sketch of the room: bar along the top, screens on the right wall, terrace outside on the left */
    var shapes = {
      bar: '<rect x="150" y="18" width="250" height="56" rx="8"/>',
      booths: '<path d="M150 104h120v120H150z"/>',
      screens: '<path d="M290 104h150v120H290z"/>',
      games: '<path d="M290 244h150v86H290z"/>',
      private: '<path d="M150 244h120v86H150z"/>',
      terrace: '<path d="M14 18h116v312H14z"/>'
    };
    root.innerHTML = '<div class="tp-plan"><svg viewBox="0 0 454 348" role="group" aria-label="Floor plan: tap where you\'d like to sit">' +
      '<rect class="tp-room" x="140" y="8" width="306" height="332" rx="10"/><rect class="tp-out" x="6" y="8" width="132" height="332" rx="10"/>' +
      D.zones.map(function (z) {
        var c = { bar: [275, 52], booths: [210, 170], screens: [365, 170], games: [365, 292], private: [210, 292], terrace: [72, 175] }[z.id];
        return '<g class="tp-zone" data-zone="' + z.id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + esc(z.name + ", " + z.note) + '">' + shapes[z.id] +
          '<text x="' + c[0] + '" y="' + (c[1] - 2) + '" text-anchor="middle">' + esc(z.name) + '</text><text class="tp-note" x="' + c[0] + '" y="' + (c[1] + 16) + '" text-anchor="middle">' + esc(z.note) + "</text></g>";
      }).join("") +
      '<path class="tp-screen" d="M444 120v90"/><text class="tp-label" x="426" y="236" text-anchor="end">Screens</text><text class="tp-label" x="300" y="92" text-anchor="middle">Bar</text>' +
      '</svg><p class="small" style="margin:8px 0 0">Tap where you\'d like to sit. A sketch of the room, so the team will confirm the exact table.</p></div>';
    function select(id) {
      var z = D.zones.filter(function (x) { return x.id === id; })[0];
      $$(".tp-zone", root).forEach(function (g) { var on = g.getAttribute("data-zone") === id; g.classList.toggle("is-on", on); g.setAttribute("aria-pressed", String(on)); });
      if (z) { seat.value = z.seat; seat.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    root.addEventListener("click", function (e) { var g = e.target.closest(".tp-zone"); if (g) select(g.getAttribute("data-zone")); });
    root.addEventListener("keydown", function (e) { var g = e.target.closest(".tp-zone"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(g.getAttribute("data-zone")); } });
    seat.addEventListener("change", function () { var z = D.zones.filter(function (x) { return x.seat === seat.value; })[0]; $$(".tp-zone", root).forEach(function (g) { var on = !!z && g.getAttribute("data-zone") === z.id; g.classList.toggle("is-on", on); g.setAttribute("aria-pressed", String(on)); }); });
  }

  /* ---------------- quiz league ---------------- */
  function standings(upto) {
    var L = D.league, n = upto == null ? L.weeks.length : upto;
    return L.teams.map(function (t) { return { name: t.name, pts: t.pts, total: t.pts.slice(0, n).reduce(function (a, b) { return a + b; }, 0) }; })
      .sort(function (a, b) { return b.total - a.total || a.name.localeCompare(b.name); });
  }
  function renderLeague(root) {
    var L = D.league, now = standings(), prev = standings(L.weeks.length - 1);
    var prevRank = {}; prev.forEach(function (t, i) { prevRank[t.name] = i; });
    var rows = now.map(function (t, i) {
      var move = prevRank[t.name] - i, arrow = move > 0 ? '<span class="lg-up" title="Up ' + move + '">▲' + move + "</span>" : move < 0 ? '<span class="lg-down" title="Down ' + (-move) + '">▼' + (-move) + "</span>" : '<span class="lg-same" title="No change">–</span>';
      return '<tr' + (i < 3 ? ' class="is-top"' : "") + '><td class="lg-rank">' + (i + 1) + "</td><td>" + arrow + "</td>" +
        '<th scope="row"><button type="button" class="lg-team" data-team="' + esc(t.name) + '" aria-expanded="false">' + esc(t.name) + "</button></th>" +
        '<td class="lg-form">' + t.pts.map(function (p, w) { return '<span class="lg-wk' + (p === 10 ? " is-win" : "") + '" title="' + L.weeks[w] + ": " + p + ' points">' + p + "</span>"; }).join("") + "</td>" +
        '<td class="lg-total">' + t.total + "</td></tr>" +
        '<tr class="lg-detail" hidden><td colspan="5"><div class="lg-bars">' + t.pts.map(function (p, w) { return '<span class="lg-bar"><i style="height:' + (p * 10) + '%"></i><b>' + p + "</b><small>" + L.weeks[w] + "</small></span>"; }).join("") + "</div></td></tr>";
    }).join("");
    root.innerHTML =
      '<div class="lg"><div class="lg-head"><h2 class="d-l">' + esc(L.season) + '</h2><p class="lede">' + esc(L.prize) + '. Points every Tuesday: 10 for a win, 8 for second, 6 for third, and points for every team that plays.</p><span class="sample-note">Sample standings, real results added every Tuesday</span></div>' +
      '<div class="lg-wrap"><table class="lg-table"><thead><tr><th scope="col">#</th><th scope="col"><span class="sr-only">Movement</span></th><th scope="col">Team</th><th scope="col">Last ' + L.weeks.length + " weeks</th><th scope=\"col\">Points</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<p class="small">Tap a team to see their season. Leaders after ' + L.weeks[L.weeks.length - 1] + ": " + esc(now[0].name) + ".</p></div>";
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".lg-team"); if (!b) return;
      var tr = b.closest("tr").nextElementSibling, open = tr.hidden;
      tr.hidden = !open; b.setAttribute("aria-expanded", String(open));
    });
  }
  function renderLeagueMini(el) {
    var top = standings().slice(0, 3);
    el.innerHTML = '<ol class="lg-mini">' + top.map(function (t, i) { return '<li><span class="lg-rank">' + (i + 1) + "</span><b>" + esc(t.name) + "</b><span>" + t.total + " pts</span></li>"; }).join("") + '</ol><a class="link" href="quiz-league.html">Full league table</a>';
  }

  /* ---------------- bookings dashboard ---------------- */
  /* demo bookings for the last 12 weeks, the same every time (seeded), plus anything tracked on this device */
  function demoEvents() {
    var seed = 20261018, out = [], srcW = [["instagram", 26], ["ig-ad", 22], ["google", 14], ["google-ads", 10], ["qr-table", 9], ["whatsapp", 7], ["qr-hotel", 4], ["direct", 18]];
    var evW = [["Quiz Night", 22], ["Ladies Night", 18], ["Steak Night", 14], ["Smoking Saturdays", 12], ["Sunday Social", 14], ["Karaoke Night", 10], ["Just a table", 20]];
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    function pick(list) { var tot = list.reduce(function (a, b) { return a + b[1]; }, 0), r = rnd() * tot; for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; } return list[0][0]; }
    var nowMs = Date.now();
    for (var d = 83; d >= 0; d--) {
      var ramp = 0.45 + (83 - d) / 83 * 0.9, n = Math.round((1.2 + rnd() * 1.6) * ramp);
      for (var k = 0; k < n; k++) out.push({ t: new Date(nowMs - d * 864e5 - rnd() * 8 * 36e5).toISOString(), type: "whatsapp", kind: "booking", src: pick(srcW), event: pick(evW), guests: 2 + Math.floor(rnd() * 7), demo: true });
      if (d < 30 && rnd() < 0.12) out.push({ t: new Date(nowMs - d * 864e5).toISOString(), type: "voucher", src: pick(srcW), amount: [179, 198, 250, 398, 500][Math.floor(rnd() * 5)], demo: true });
      if (d < 20 && rnd() < 0.1) out.push({ t: new Date(nowMs - d * 864e5).toISOString(), type: "deposit", src: pick(srcW), amount: 50 * (8 + Math.floor(rnd() * 14)), item: "Christmas parties", demo: true });
    }
    return out;
  }
  function renderDashboard(root) {
    var PIN = "2026", ok = false;
    try { ok = sessionStorage.getItem("abk_dash") === "1"; } catch (e) { ok = false; }
    if (!ok) {
      root.innerHTML = '<form class="form dash-pin"><h2 class="d-m">Bookings dashboard</h2><p class="small" style="margin:0">For the Adam\'s Beer Kitchen team.' + (D.api ? "" : " Practice PIN: 2026.") + '</p><div class="field"><label for="dash-pin">PIN</label><input id="dash-pin" inputmode="numeric" autocomplete="off"></div><button class="btn" type="submit">Open the dashboard</button><p class="small" data-pin-msg aria-live="polite" style="margin:0"></p></form>';
      $(".dash-pin", root).addEventListener("submit", function (e) {
        e.preventDefault();
        var pin = $("#dash-pin", root).value.trim(), msg = $("[data-pin-msg]", root);
        function enter() { try { sessionStorage.setItem("abk_dash", "1"); sessionStorage.setItem("abk_pin", pin); } catch (er) {} location.reload(); }
        /* with the server on, the PIN is checked there (STAFF_PIN in Vercel); otherwise the practice PIN */
        if (D.api) {
          fetch(D.api.replace(/\/$/, "") + "/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: pin }) })
            .then(function (r) { if (r.ok) enter(); else msg.textContent = r.status === 429 ? "Too many tries. Wait 15 minutes." : "That PIN doesn't match."; })
            .catch(function () { msg.textContent = "Can't reach the server. Check the connection."; });
        } else if (pin === PIN) enter();
        else msg.textContent = "That PIN doesn't match.";
      });
      return;
    }
    /* with the server on, every booking from every phone; otherwise demo data plus this phone's bookings */
    var live = !!D.api, all = live ? [] : demoEvents().concat((TR ? TR.events() : []).filter(function (e) { return e.type === "whatsapp" || e.type === "voucher" || e.type === "deposit"; }));
    var range = 30;
    var social = ["instagram", "ig-ad", "facebook", "whatsapp"];
    function label(s) { return TR ? TR.label(s) : s; }
    function inRange(e, from, to) { var t = Date.parse(e.t); return t >= from && t < to; }
    function draw() {
      var to = Date.now() + 1, from = to - range * 864e5, pfrom = from - range * 864e5;
      var cur = all.filter(function (e) { return inRange(e, from, to); }), prev = all.filter(function (e) { return inRange(e, pfrom, from); });
      var bk = function (l) { return l.filter(function (e) { return e.type === "whatsapp"; }); };
      var sum = function (l, type) { return l.filter(function (e) { return e.type === type; }).reduce(function (a, b) { return a + (b.amount || 0); }, 0); };
      var cb = bk(cur), pb = bk(prev);
      var cs = cb.filter(function (e) { return social.indexOf(e.src) > -1 || e.src === "ig-ad"; }).length, ps = pb.filter(function (e) { return social.indexOf(e.src) > -1; }).length;
      var monthly = Math.round(cs / range * 30);
      function delta(a, b, money) { if (!b) return '<span class="dash-delta">new</span>'; var d = Math.round((a - b) / b * 100); return '<span class="dash-delta ' + (d >= 0 ? "is-up" : "is-down") + '">' + (d >= 0 ? "▲ " : "▼ ") + Math.abs(d) + "% vs the " + range + " days before</span>"; }
      var tiles = [
        ["WhatsApp booking enquiries", cb.length, delta(cb.length, pb.length)],
        ["From social media and ads", cs, delta(cs, ps) + '<span class="dash-sub">About ' + monthly + " a month. Target: 20+</span>"],
        ["Deposits taken", aed(sum(cur, "deposit")), delta(sum(cur, "deposit"), sum(prev, "deposit"))],
        ["Gift vouchers sold", aed(sum(cur, "voucher")), delta(sum(cur, "voucher"), sum(prev, "voucher"))]
      ];
      /* weekly enquiries for the last 12 weeks */
      var weeks = [], wk0 = to - 84 * 864e5;
      for (var w = 0; w < 12; w++) { var a = wk0 + w * 7 * 864e5, b = a + 7 * 864e5; weeks.push({ label: (function (d) { return d.getUTCDate() + " " + MON3[d.getUTCMonth()]; })(new Date(a + 4 * 36e5)), n: bk(all).filter(function (e) { return inRange(e, a, b); }).length }); }
      var bySrc = {}; cb.forEach(function (e) { bySrc[e.src] = (bySrc[e.src] || 0) + 1; });
      var srcRows = Object.keys(bySrc).map(function (k) { return { label: label(k), n: bySrc[k] }; }).sort(function (x, y) { return y.n - x.n; });
      var byEv = {}; cb.forEach(function (e) { var k = e.event || "Just a table"; byEv[k] = (byEv[k] || 0) + 1; });
      var evRows = Object.keys(byEv).map(function (k) { return { label: k, n: byEv[k] }; }).sort(function (x, y) { return y.n - x.n; }).slice(0, 7);
      var recent = cb.slice().sort(function (x, y) { return Date.parse(y.t) - Date.parse(x.t); }).slice(0, 8);
      root.innerHTML =
        '<div class="dash"><div class="dash-top"><div><h2 class="d-l">Bookings dashboard</h2><p class="small" style="margin:6px 0 0">' + (live ? "Every booking from every phone, counted by the server." : (all.some(function (e) { return !e.demo; }) ? "Demo data, plus the bookings made on this device." : "Demo data.") + " Live numbers appear once the booking counter is connected.") + "</p></div>" +
        '<div class="filters" role="group" aria-label="Time range">' + [[7, "7 days"], [30, "30 days"], [90, "90 days"]].map(function (r) { return '<button class="chip" type="button" data-range="' + r[0] + '" aria-pressed="' + (r[0] === range) + '">Last ' + r[1] + "</button>"; }).join("") + "</div></div>" +
        '<div class="dash-tiles">' + tiles.map(function (t) { return '<div class="dash-tile"><span class="dash-label">' + t[0] + '</span><b class="dash-value">' + t[1] + "</b>" + t[2] + "</div>"; }).join("") + "</div>" +
        '<div class="dash-grid"><section class="dash-card dash-wide"><h3 class="d-s">Booking enquiries per week</h3><p class="small" style="margin:2px 0 10px">The last 12 weeks, every source</p>' + columns(weeks) + "</section>" +
        '<section class="dash-card"><h3 class="d-s">Where they came from</h3><p class="small" style="margin:2px 0 10px">Last ' + range + " days</p>" + bars(srcRows) + "</section>" +
        '<section class="dash-card"><h3 class="d-s">Which nights they booked</h3><p class="small" style="margin:2px 0 10px">Last ' + range + " days</p>" + bars(evRows) + "</section>" +
        '<section class="dash-card dash-wide"><h3 class="d-s">Latest booking enquiries</h3><div class="dash-tablewrap"><table class="dash-table"><thead><tr><th scope="col">When</th><th scope="col">Source</th><th scope="col">For</th><th scope="col">Guests</th></tr></thead><tbody>' +
        recent.map(function (e) { var d = new Date(Date.parse(e.t) + 4 * 36e5); return "<tr><td>" + d.getUTCDate() + " " + MON3[d.getUTCMonth()] + ", " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + "</td><td>" + esc(label(e.src)) + "</td><td>" + esc(e.event || "Just a table") + "</td><td>" + (e.guests || "–") + "</td></tr>"; }).join("") +
        "</tbody></table></div></section></div></div>";
    }
    function tip(el, text, x, y) { var t = $(".dash-tip"); if (!t) { document.body.insertAdjacentHTML("beforeend", '<div class="dash-tip" role="status"></div>'); t = $(".dash-tip"); } t.textContent = text; t.style.left = x + "px"; t.style.top = y + "px"; t.classList.add("is-on"); }
    function untip() { var t = $(".dash-tip"); if (t) t.classList.remove("is-on"); }
    /* single-series columns: 4px rounded tops, square at the baseline, hairline grid, value on the latest column */
    function columns(rows) {
      var W = 640, H = 220, pl = 34, pb = 26, max = Math.max.apply(null, rows.map(function (r) { return r.n; })) || 1;
      var top = Math.ceil(max / 5) * 5, bw = Math.min(24, (W - pl) / rows.length - 14), step = (W - pl) / rows.length;
      var grid = [0, top / 2, top].map(function (v) { var y = H - pb - v / top * (H - pb - 10); return '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + v + "</text>"; }).join("");
      var cols = rows.map(function (r, i) {
        var h = r.n / top * (H - pb - 10), x = pl + i * step + (step - bw) / 2, y = H - pb - h, rr = Math.min(4, h);
        return '<g class="col" tabindex="0" data-tip="Week of ' + r.label + ": " + r.n + ' enquiries"><rect class="hit" x="' + (pl + i * step) + '" y="10" width="' + step + '" height="' + (H - pb - 10) + '"/>' +
          (h > 0 ? '<path class="bar" d="M' + x + " " + (H - pb) + "V" + (y + rr) + "Q" + x + " " + y + " " + (x + rr) + " " + y + "H" + (x + bw - rr) + "Q" + (x + bw) + " " + y + " " + (x + bw) + " " + (y + rr) + "V" + (H - pb) + 'Z"/>' : "") +
          (i % 2 === 1 || i === rows.length - 1 ? '<text class="xl" x="' + (x + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + r.label + "</text>" : "") +
          (i === rows.length - 1 ? '<text class="vl" x="' + (x + bw / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + r.n + "</text>" : "") + "</g>";
      }).join("");
      return '<div class="chart"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Booking enquiries per week for the last 12 weeks">' + '<g class="grid">' + grid + "</g>" + cols + "</svg></div>" +
        '<details class="dash-data"><summary>Show as a table</summary><table class="dash-table"><tbody>' + rows.map(function (r) { return "<tr><td>Week of " + r.label + "</td><td>" + r.n + "</td></tr>"; }).join("") + "</tbody></table></details>";
    }
    /* single-series horizontal bars with the value at the tip */
    function bars(rows) {
      if (!rows.length) return '<p class="empty">No bookings in this period yet.</p>';
      var max = rows[0].n || 1;
      return '<ul class="hbars">' + rows.map(function (r) { return '<li tabindex="0" data-tip="' + esc(r.label) + ": " + r.n + '"><span class="hbars__label">' + esc(r.label) + '</span><span class="hbars__track"><i style="width:' + Math.max(2, r.n / max * 100) + '%"></i></span><span class="hbars__n">' + r.n + "</span></li>"; }).join("") + "</ul>";
    }
    root.addEventListener("click", function (e) { var c = e.target.closest("[data-range]"); if (c) { range = +c.getAttribute("data-range"); draw(); } });
    root.addEventListener("mousemove", function (e) { var g = e.target.closest("[data-tip]"); if (g) tip(g, g.getAttribute("data-tip"), e.clientX + 14, e.clientY - 10); else untip(); });
    root.addEventListener("mouseleave", untip);
    root.addEventListener("focusin", function (e) { var g = e.target.closest("[data-tip]"); if (g) { var r = g.getBoundingClientRect(); tip(g, g.getAttribute("data-tip"), r.left + r.width / 2, r.top - 8); } });
    root.addEventListener("focusout", untip);
    if (!live) return draw();
    root.innerHTML = '<p class="small">Loading the bookings…</p>';
    var pin = ""; try { pin = sessionStorage.getItem("abk_pin") || ""; } catch (e) {}
    fetch(D.api.replace(/\/$/, "") + "/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", pin: pin, days: 180 }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Can't reach the booking counter"); return j; }); })
      .then(function (j) { all = j.events || []; draw(); })
      .catch(function (err) { root.innerHTML = '<p class="small">' + esc(err.message) + ". Check the connection and refresh.</p>"; });
  }

  function boot() {
    [["[data-campaign]", renderCampaign], ["[data-checkout]", renderCheckout], ["[data-vouchers]", renderVouchers], ["[data-voucher-view]", renderVoucher],
      ["[data-tablepicker]", renderTablePicker], ["[data-league]", renderLeague], ["[data-league-mini]", renderLeagueMini], ["[data-dashboard]", renderDashboard]
    ].forEach(function (r) { $$(r[0]).forEach(function (el) { try { r[1](el); } catch (err) { if (window.console) console.error(err); } }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
