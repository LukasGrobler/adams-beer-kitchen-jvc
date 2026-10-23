/* Adam's Beer Kitchen JVC, version 3 (18 October 2026): the marketing that runs itself.
   - Dashboard: poster & story maker, WhatsApp broadcast writer, club members, song requests
   - Adam's Club (birthday club + loyalty card), score predictor, song requests, match board, creators form
   With data.js > api empty, everything runs in practice mode on this device (sample members, sample fixtures).
   Once the server is set up (jvc-server, see its README), the same screens use the real database. */
(function () {
  "use strict";
  var D = window.ABK_DATA, V = D.venue, TR = window.ABK_TRACK;
  var API = (D.api || "").replace(/\/$/, "");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var CLUB = D.club || { need: 10, reward: "a house drink on us", birthday: "a dessert or a house drink in your birthday month" };
  var F1 = D.f1 || null;

  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function waTo(text) { return "https://wa.me/" + V.whatsapp + "?text=" + encodeURIComponent(text); }
  function waPerson(phone, text) { return "https://wa.me/" + String(phone).replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }
  function dubai(ms) { return new Date((ms === undefined ? Date.now() : ms) + 4 * 36e5); } /* read with getUTC* */
  function biz() { return dubai(Date.now() - 3 * 36e5); } /* before 3AM is still last night */
  function hm(d) { var h = d.getUTCHours(), m = d.getUTCMinutes(); return (h % 12 || 12) + (m ? ":" + pad(m) : "") + (h < 12 ? "AM" : "PM"); }
  function dayLabel(d) { return DAYS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()]; }
  function short(d) { return DAY3[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON3[d.getUTCMonth()]; }
  function ls(k, v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; }
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }
  function rid(n) { var c = "abcdefghijkmnpqrstuvwxyz23456789", s = ""; for (var i = 0; i < (n || 12); i++) s += c.charAt(Math.floor(Math.random() * c.length)); return s; }
  function siteBase() {
    if (/^https?:/.test(location.protocol)) return location.origin + location.pathname.replace(/[^/]*$/, "");
    return D.siteUrl || "https://lukasgrobler.github.io/adams-beer-kitchen-jvc/";
  }
  function staffPin() { return ss("abk_pin") || ""; }
  function copy(text, btn) {
    function done() { if (btn) { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1600); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
  }

  /* ================= dates for the Grand Prix season page ================= */
  function bizIso() { return biz().toISOString().slice(0, 10); }
  function dayOf(day) { return new Date(day + "T00:00:00Z"); }
  /* a race start ("21:00", Dubai time) in each language: 9PM, 9 مساءً, 21:00 */
  function raceTime(t, lang) {
    var h = +t.slice(0, 2), m = t.slice(3), hm = (h % 12 || 12) + (m !== "00" ? ":" + m : "");
    if (lang === "ru") return t;
    if (lang === "ar") return h === 0 ? "منتصف الليل" : hm + (h < 12 ? " صباحًا" : " مساءً");
    return h === 0 ? "midnight" : hm + (h < 12 ? "AM" : "PM");
  }

  /* ================= the server, or practice mode on this device ================= */
  function call(path, payload) {
    if (!API) return Promise.resolve().then(function () { return demo(path, payload || {}); });
    return fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || "Something went wrong, try again"); e.status = r.status; e.data = j; throw e; } return j; }); });
  }
  function fail(msg, status, data) { var e = new Error(msg); e.status = status; e.data = data; throw e; }

  /* ---- practice data ---- */
  function demoDb() { return ls("abk_demo_club") || { seq: 1005, members: {} }; }
  function sampleMembers() {
    var now = biz(), mm = pad(now.getUTCMonth() + 1), day = 864e5, t = Date.now();
    return [
      { id: "1001", name: "Sarah Khan", phone: "971500000101", bday: mm + "-22", joined: new Date(t - 40 * day).toISOString(), stamps: 7, visits: 7, rewards: 0, bdayUsed: "", src: "instagram", sample: true },
      { id: "1002", name: "Omar Aziz", phone: "971500000102", bday: "03-14", joined: new Date(t - 33 * day).toISOString(), stamps: 3, visits: 13, rewards: 1, bdayUsed: "", src: "qr-table", sample: true },
      { id: "1003", name: "Priya Sharma", phone: "971500000103", bday: mm + "-05", joined: new Date(t - 21 * day).toISOString(), stamps: 10, visits: 10, rewards: 0, bdayUsed: "", src: "google", sample: true },
      { id: "1004", name: "Dan Murphy", phone: "971500000104", bday: "11-30", joined: new Date(t - 9 * day).toISOString(), stamps: 1, visits: 1, rewards: 0, bdayUsed: "", src: "whatsapp", sample: true },
      { id: "1005", name: "Lena Volkova", phone: "971500000105", bday: "07-09", joined: new Date(t - 2 * day).toISOString(), stamps: 2, visits: 2, rewards: 0, bdayUsed: "", src: "ig-ad", sample: true }
    ];
  }
  function cardOf(m) {
    var now = biz();
    return { id: m.id, name: m.name, joined: m.joined, stamps: m.stamps, need: CLUB.need, rewards: m.rewards || 0, rewardReady: m.stamps >= CLUB.need,
      birthdayMonth: m.bday.slice(0, 2) === pad(now.getUTCMonth() + 1), birthdayUsed: m.bdayUsed === String(now.getUTCFullYear()) };
  }
  function phoneKey(p) { var d = String(p || "").replace(/\D/g, ""); if (d.indexOf("00") === 0) d = d.slice(2); if (d.charAt(0) === "0" && d.length === 10) d = "971" + d.slice(1); return d; }
  function demo(path, b) {
    var db = demoDb(), PIN = "2026";
    function save() { ls("abk_demo_club", db); }
    function guest() { var m = db.members[b.id]; if (!m || m.token !== b.token) fail("Card not found", 404); return m; }
    if (path === "/api/staff") { if (b.pin !== PIN) fail("That PIN doesn't match", 401); return { ok: true }; }
    if (path === "/api/club") {
      if (b.action === "join") {
        var phone = phoneKey(b.phone);
        if (!b.name || phone.length < 9 || !/^\d\d-\d\d$/.test(b.bday || "") || b.consent !== true) fail("Please fill in your name, WhatsApp number and birthday, and tick the box", 400);
        if (Object.keys(db.members).some(function (k) { return db.members[k].phone === phone; })) fail("This number is already in the club. Message the team on WhatsApp and they'll send your card again.", 409);
        db.seq += 1;
        var m = { id: String(db.seq), name: b.name.slice(0, 40), phone: phone, bday: b.bday, joined: new Date().toISOString(), stamps: 0, visits: 0, rewards: 0, lastStamp: 0, bdayUsed: "", token: rid(16), src: b.src || "" };
        db.members[m.id] = m; save();
        return { token: m.token, card: cardOf(m) };
      }
      if (b.action === "card") return { card: cardOf(guest()) };
      if (b.action === "stamp" || b.action === "reward" || b.action === "birthday") {
        if (b.pin !== PIN) fail("That staff PIN doesn't match", 401);
        var g = guest();
        if (b.action === "stamp") {
          if (Date.now() - (g.lastStamp || 0) < 8 * 36e5) fail("This card already has today's stamp", 409, { card: cardOf(g) });
          g.stamps += 1; g.visits += 1; g.lastStamp = Date.now();
        } else if (b.action === "reward") {
          if (g.stamps < CLUB.need) fail("Not enough stamps yet", 409, { card: cardOf(g) });
          g.stamps -= CLUB.need; g.rewards += 1;
        } else {
          var c = cardOf(g);
          if (!c.birthdayMonth || c.birthdayUsed) fail("No birthday treat on this card right now", 409, { card: c });
          g.bdayUsed = String(biz().getUTCFullYear());
        }
        save();
        return { card: cardOf(g) };
      }
      if (b.action === "list") {
        if (b.pin !== PIN) fail("That staff PIN doesn't match", 401);
        var mine = Object.keys(db.members).map(function (k) { return db.members[k]; });
        return { members: mine.concat(sampleMembers()).sort(function (x, y) { return y.joined.localeCompare(x.joined); }), need: CLUB.need, demo: true };
      }
      if (b.action === "relink") {
        if (b.pin !== PIN) fail("That staff PIN doesn't match", 401);
        var r = db.members[b.id];
        if (!r) fail("Sample members have no card link. Real members do.", 404);
        r.token = rid(16); save();
        return { id: r.id, token: r.token, phone: r.phone, name: r.name };
      }
    }
    if (path === "/api/songs") {
      var key = "abk_demo_songs_" + biz().toISOString().slice(0, 10), list = ls(key) || [];
      if (b.action === "request") {
        if (!b.song) fail("Which song?", 400);
        if (list.filter(function (s) { return !s.sample; }).length >= 6) fail("That's plenty of requests for now, the host has them", 429);
        list.push({ id: rid(8), song: b.song.slice(0, 80), artist: (b.artist || "").slice(0, 60), name: (b.name || "").slice(0, 30), note: (b.note || "").slice(0, 120), at: new Date().toISOString(), played: false });
        ls(key, list);
        return { ok: true };
      }
      if (b.pin !== PIN) fail("That staff PIN doesn't match", 401);
      if (!list.some(function (s) { return s.sample; })) {
        var t = Date.now();
        list = [{ id: "s1", song: "Mr. Brightside", artist: "The Killers", name: "Hannah", note: "Birthday table by the screens", at: new Date(t - 50 * 6e4).toISOString(), played: true, sample: true },
          { id: "s2", song: "Galway Girl", artist: "Steve Earle", name: "Ciaran", note: "", at: new Date(t - 32 * 6e4).toISOString(), played: false, sample: true },
          { id: "s3", song: "Wonderwall", artist: "Oasis", name: "", note: "Table 12", at: new Date(t - 12 * 6e4).toISOString(), played: false, sample: true }].concat(list);
      }
      if (b.action === "played") list.forEach(function (s) { if (s.id === b.id) s.played = !s.played; });
      ls(key, list);
      return { songs: list.slice().sort(function (x, y) { return x.at.localeCompare(y.at); }), demo: true };
    }
    if (path === "/api/fixtures") return { matches: sampleFixtures(), sample: true };
    if (path === "/api/predictor") {
      var round = sampleFixtures().filter(function (m) { return m.comp === "Premier League"; });
      var picksAll = ls("abk_demo_picks") || {};
      if (b.action === "save") {
        var mem = db.members[b.id];
        if (!mem || mem.token !== b.token) fail("Join Adam's Club to play", 401);
        var mineP = picksAll[b.id] || {};
        round.forEach(function (g) { var p = b.picks && b.picks[g.id]; if (p && Date.parse(g.utc) > Date.now()) mineP[g.id] = [Math.max(0, Math.min(20, +p[0] || 0)), Math.max(0, Math.min(20, +p[1] || 0))]; });
        picksAll[b.id] = mineP; ls("abk_demo_picks", picksAll);
      }
      var board = [["Omar A.", 14, 3], ["Priya S.", 12, 2], ["Dan M.", 11, 2], ["Hessa K.", 9, 1], ["Tom B.", 8, 1], ["Lena V.", 7, 1], ["Rahul P.", 6, 0], ["Mia C.", 4, 0]].map(function (r) { return { name: r[0], pts: r[1], exact: r[2] }; });
      var me = b.id && db.members[b.id] && db.members[b.id].token === b.token ? { picks: picksAll[b.id] || {}, pts: 0, place: null } : null;
      return { matchday: 9, matches: round, board: board, mine: me, saved: b.action === "save", sample: true };
    }
    fail("Not available in practice mode", 400);
  }

  /* sample fixtures, dated from today, until the live feed is on (real clubs, made-up dates) */
  function at(daysAhead, h, m) { var d = biz(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysAhead, h - 4, m || 0)).toISOString(); }
  function sampleFixtures() {
    var dow = biz().getUTCDay(), sat = (6 - dow + 7) % 7 || 7;
    var list = [[sat, 16, 30, "Arsenal", "Chelsea"], [sat, 19, 0, "Newcastle", "Aston Villa"], [sat, 21, 30, "Liverpool", "Man City"],
      [sat + 1, 17, 0, "Brighton", "Everton"], [sat + 1, 19, 30, "Man United", "Spurs"], [sat + 2, 23, 0, "West Ham", "Fulham"]];
    var out = list.map(function (x, i) { return { id: "s" + (i + 1), utc: at(x[0], x[1], x[2]), comp: "Premier League", matchday: 9, status: "TIMED", home: x[3], away: x[4], homeCrest: "", awayCrest: "", score: null }; });
    out.push({ id: "c1", utc: at(sat + 3, 23, 0), comp: "Champions League", matchday: null, status: "TIMED", home: "Real Madrid", away: "Liverpool", homeCrest: "", awayCrest: "", score: null });
    out.push({ id: "c2", utc: at(sat + 4, 23, 0), comp: "Champions League", matchday: null, status: "TIMED", home: "Arsenal", away: "Bayern", homeCrest: "", awayCrest: "", score: null });
    return out;
  }
  var fixturesP = null;
  function fixtures() {
    if (!fixturesP) fixturesP = call("/api/fixtures").catch(function () { return { matches: sampleFixtures(), sample: true }; });
    return fixturesP;
  }

  /* ================= Adam's Club: sign up, card, stamps ================= */
  function myCard() { return ls("abk_club"); }
  function takeCardFromLink() {
    var m = /[?&]card=(\d+)\.([a-z0-9]+)/i.exec(location.search);
    if (!m) return;
    ls("abk_club", { id: m[1], token: m[2] });
    history.replaceState(null, "", location.pathname);
  }
  function renderClub(root) {
    takeCardFromLink();
    var mine = myCard();
    if (mine) return showCard(root, mine);
    var months = MONTHS.map(function (m, i) { return '<option value="' + pad(i + 1) + '">' + m + "</option>"; }).join("");
    var days = ""; for (var d = 1; d <= 31; d++) days += '<option value="' + pad(d) + '">' + d + "</option>";
    root.innerHTML = '<form class="form club-form" novalidate>' +
      '<h2 class="d-m">Join in 30 seconds</h2>' +
      '<div class="form__row"><div class="field"><label for="cl-name">Your name</label><input id="cl-name" autocomplete="name" placeholder="e.g. Sarah Khan" maxlength="40"></div>' +
      '<div class="field"><label for="cl-phone">WhatsApp number</label><input id="cl-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="05x xxx xxxx"></div></div>' +
      '<fieldset class="field"><legend>Your birthday</legend><div class="form__row"><select id="cl-day" aria-label="Day"><option value="">Day</option>' + days + '</select><select id="cl-month" aria-label="Month"><option value="">Month</option>' + months + "</select></div></fieldset>" +
      '<label class="check"><input type="checkbox" id="cl-ok"> <span>I\'m 21 or over, and happy to get WhatsApp messages from Adam\'s Beer Kitchen JVC about my card, my birthday treat and what\'s on. I can stop them any time.</span></label>' +
      '<div class="btn-row"><button class="btn" type="submit">Get my card</button></div><p class="small" data-msg aria-live="polite" style="margin:0"></p></form>';
    $(".club-form", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("[data-msg]", root), btn = $("button[type=submit]", root);
      var src = TR ? TR.source().src : "";
      btn.disabled = true; msg.textContent = "";
      call("/api/club", { action: "join", name: $("#cl-name", root).value.trim(), phone: $("#cl-phone", root).value, bday: $("#cl-month", root).value + "-" + $("#cl-day", root).value, consent: $("#cl-ok", root).checked, src: src })
        .then(function (j) {
          ls("abk_club", { id: j.card.id, token: j.token });
          if (TR) TR.log("club", { kind: "join" });
          var next = new URLSearchParams(location.search).get("next");
          if (next && /^[a-z-]+\.html$/.test(next)) { location.href = next; return; }
          showCard(root, myCard(), j.card, true);
        })
        .catch(function (err) { msg.textContent = err.message; btn.disabled = false; });
    });
  }
  var STAFF_DONE = { stamp: "Stamp added.", reward: "Reward given.", birthday: "Birthday treat given." };
  function showCard(root, mine, card, fresh, note) {
    if (!card) {
      root.innerHTML = '<p class="small">Loading your card…</p>';
      call("/api/club", { action: "card", id: mine.id, token: mine.token })
        .then(function (j) { showCard(root, mine, j.card); })
        .catch(function (err) {
          if (err.status === 404) { ls("abk_club", null); try { localStorage.removeItem("abk_club"); } catch (e) {} renderClub(root); }
          else root.innerHTML = '<p class="small">' + esc(err.message) + "</p>";
        });
      return;
    }
    var dots = ""; for (var i = 0; i < card.need; i++) dots += '<span class="stamp' + (i < card.stamps ? " is-on" : "") + '" aria-hidden="true">' + (i < card.stamps ? "&#10003;" : i + 1) + "</span>";
    var perks = [];
    if (card.rewardReady) perks.push('<p class="club-card__ready">Reward ready: ' + esc(CLUB.reward) + ". Show this card at the bar.</p>");
    if (card.birthdayMonth && !card.birthdayUsed) perks.push('<p class="club-card__ready">Happy birthday month! Your treat: ' + esc(CLUB.birthday.replace(/ in your birthday month$/, "")) + ".</p>");
    root.innerHTML = (fresh ? '<p class="club-welcome">Welcome to the club, ' + esc(card.name.split(" ")[0]) + "! Save this page to your home screen so your card is always one tap away.</p>" : "") +
      '<div class="club-card"><div class="club-card__top"><img src="assets/img/logo.png" alt="" width="64" height="64"><div><span class="kicker">Adam\'s Club</span><b>' + esc(card.name) + '</b><span class="small">Member no. ' + esc(card.id) + "</span></div></div>" +
      '<div class="stamps" role="img" aria-label="' + card.stamps + " of " + card.need + ' stamps">' + dots + "</div>" +
      '<p class="small" style="margin:0">' + card.stamps + " of " + card.need + " stamps. Every " + card.need + "th visit: " + esc(CLUB.reward) + ". " + (card.rewards ? "Rewards so far: " + card.rewards + "." : "") + "</p>" + perks.join("") +
      (note ? '<p class="club-done" role="status">' + esc(note) + "</p>" : "") +
      '<div class="btn-row"><button class="btn btn--ghost" type="button" data-staff>Staff: stamp or reward</button></div>' +
      '<div class="club-staff" hidden><label for="cl-pin" class="small">Staff PIN' + (API ? "" : " (practice PIN: 2026)") + '</label><input id="cl-pin" class="pin-mask" inputmode="numeric" autocomplete="off" maxlength="8">' +
      '<div class="btn-row"><button class="btn btn--sm" type="button" data-do="stamp">Add today\'s stamp</button>' +
      (card.rewardReady ? '<button class="btn btn--sm" type="button" data-do="reward">Give the reward</button>' : "") + (card.birthdayMonth && !card.birthdayUsed ? '<button class="btn btn--sm" type="button" data-do="birthday">Give the birthday treat</button>' : "") + "</div>" +
      '<p class="small" data-staff-msg aria-live="polite" style="margin:0"></p></div></div>' +
      '<p class="small" style="margin-top:16px">New phone or lost this page? <a href="' + esc(waTo("Hi Adam's Beer Kitchen! Could you send me my Adam's Club card again? My member number is " + card.id + ".")) + '" target="_blank" rel="noopener">Ask the team on WhatsApp</a> and they\'ll send your card link.</p>';
    $("[data-staff]", root).addEventListener("click", function () { var p = $(".club-staff", root); p.hidden = !p.hidden; if (!p.hidden) $("#cl-pin", root).focus(); });
    $$("[data-do]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var m = $("[data-staff-msg]", root), act = b.getAttribute("data-do");
        b.disabled = true;
        call("/api/club", { action: act, id: mine.id, token: mine.token, pin: $("#cl-pin", root).value.trim() })
          .then(function (j) { showCard(root, mine, j.card, false, STAFF_DONE[act]); })
          .catch(function (err) { m.textContent = err.message; b.disabled = false; });
      });
    });
  }

  /* ================= Grand Prix season page (data.js > f1): race nights and the brands' F1 promotions ================= */
  function renderF1(root) {
    if (!F1) { root.innerHTML = '<section class="sec sec--tight"><div class="wrap"><p class="empty">Grand Prix season is over for this year. <a href="sports.html">See what\'s on the big screens</a>.</p></div></section>'; return; }
    var today = bizIso(), H = F1.heineken, J = F1.jack;
    function range(a, b) { var x = dayOf(a), y = dayOf(b); return (x.getUTCMonth() === y.getUTCMonth() ? x.getUTCDate() : x.getUTCDate() + " " + MONTHS[x.getUTCMonth()]) + " – " + y.getUTCDate() + " " + MONTHS[y.getUTCMonth()]; }
    function rows(list) { return '<ul class="pts">' + list.map(function (r) { return "<li><span>" + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></li>"; }).join("") + "</ul>"; }
    var races = F1.races.map(function (r) {
      var d = dayOf(r.date), past = r.date < today, when = dayLabel(d) + ", " + raceTime(r.time, "en");
      return "<li" + (past ? ' class="is-past"' : r.finale ? ' class="is-finale"' : "") + '><span class="races__day">' + when + "</span><b>" + esc(r.name) + (r.finale ? ' <span class="small">The season finale</span>' : "") + "</b>" +
        (past ? '<span class="small">Done</span>' : '<a class="btn btn--sm" href="' + esc(waTo("Hi Adam's Beer Kitchen! I'd like to book a table to watch the " + r.name + " on " + when + ".\nGuests: ")) + '" target="_blank" rel="noopener">Book a table</a>') + "</li>";
    }).join("");
    root.innerHTML =
      '<section class="sec sec--tight" style="padding-top:0" id="races"><div class="wrap split split--top">' +
      '<div><div class="sec-head"><h2 class="d-l">Race nights</h2><p class="lede">Every race on the big screens, with the sound up. Times are Dubai time.</p></div><ul class="races">' + races + "</ul></div>" +
      '<div class="frame frame--tall" style="max-width:420px;justify-self:center"><img src="assets/img/ig/' + esc(F1.img) + '.jpg" alt="The big screens at Adam\'s Beer Kitchen JVC" loading="lazy"></div></div></section>' +
      '<section class="sec sec--tight sec--wood" id="win"><div class="wrap"><div class="sec-head"><h2 class="d-l">Win your way to the Grand Prix</h2><p class="lede">Two ways to win while you watch. Heineken and Jack Daniel\'s run these themselves and pick the winners.</p></div><div class="promos">' +
      '<article class="promo"><span class="kicker">' + range(H.from, H.to) + '</span><h3 class="d-m">' + esc(H.name) + "</h3>" +
      '<ol class="steps"><li>Order 2 or more Heineken pints at the bar.</li><li>Scan the QR code on the Heineken card and scratch to reveal your code.</li><li>Enter it on the Fans\' Grid. You start at P16, and your first entry moves you up 4 places and wins you an F1 cup.</li><li>Come back and climb: 2 or more pints move you up 4 places, once every 24 hours.</li></ol>' +
      '<ul class="ladder">' + H.prizes.slice().reverse().map(function (r) { return '<li><span class="ladder__p">' + esc(r[0]) + "</span><span><b>" + esc(r[1]) + '</b><span class="small">' + esc(r[2]) + "</span></span>" + (r[3] ? '<img src="assets/img/promo/' + esc(r[3]) + '.png" alt="" loading="lazy">' : "") + "</li>"; }).join("") + "</ul>" +
      (H.lounge ? '<div class="lounge"><img src="assets/img/promo/' + esc(H.lounge.img) + '.jpg" alt="The VIP Hospitality Lounge at the Abu Dhabi Grand Prix" loading="lazy"><div><span class="kicker">The P1 prize</span><b>VIP Hospitality Lounge</b><ul>' + H.lounge.perks.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul></div></div>" : "") +
      '<h4 class="kicker">Ways to climb</h4>' + rows(H.points) +
      (H.url ? '<div class="btn-row"><a class="btn" href="' + esc(H.url) + '" target="_blank" rel="noopener">Open the Fans\' Grid</a></div>' : "") +
      '<p class="small" style="margin:0">Heineken runs the Fans\' Grid and picks the winners, under its own terms.</p></article>' +
      '<article class="promo"><span class="kicker">' + range(J.from, J.to) + '</span><h3 class="d-m">' + esc(J.name) + "</h3>" +
      "<p>Order any Jack Daniel's drink from the F1 menu and you get a scratch card. You could win " + esc(J.prize) + " on the spot.</p>" +
      (J.prizes ? '<div class="merch">' + J.prizes.map(function (m) { return '<figure><img src="assets/img/promo/' + esc(m[1]) + '.jpg" alt="' + esc(m[0]) + '" loading="lazy"><figcaption>' + esc(m[0]) + "</figcaption></figure>"; }).join("") + "</div>" : "") +
      rows(J.menu.map(function (m) { return [m[0], m[1] ? "AED " + m[1] : ""]; })) +
      '<p class="small" style="margin:0">Jack Daniel\'s runs the scratch cards and the prizes.</p></article>' +
      "</div></div></section>" +
      '<section class="sec sec--flush"><div class="wrap"><div class="band"><div><h2 class="d-l">First to know</h2><p>Join Adam\'s Club and hear about race nights and F1 specials on WhatsApp before anyone else.</p></div><div class="btn-row"><a class="btn" href="club.html">Join Adam\'s Club</a></div></div></div></section>' +
      '<section class="sec sec--tight"><div class="wrap"><p class="small" style="margin:0">21+ only. Please drink responsibly. Heineken\'s Fans\' Grid and the Jack Daniel\'s scratch cards are run by the brands, under their own terms.</p></div></section>';
  }

  /* ================= match board ================= */
  function matchBook(m) {
    var d = dubai(Date.parse(m.utc));
    return waTo("Hi Adam's Beer Kitchen! I'd like to book a table to watch " + m.home + " v " + m.away + " on " + dayLabel(d) + " (kick-off " + hm(d) + "), somewhere with a good view of the screens.\nGuests: ");
  }
  function crest(url) { return url ? '<img src="' + esc(url) + '" alt="" width="28" height="28" loading="lazy">' : ""; }
  function renderMatchBoard(root) {
    var mini = root.hasAttribute("data-mini");
    root.innerHTML = '<p class="small">Loading this week\'s games…</p>';
    fixtures().then(function (j) {
      var list = (j.matches || []).filter(function (m) { return m.status !== "FINISHED" || Date.now() - Date.parse(m.utc) < 3 * 36e5; });
      if (mini) list = list.slice(0, 4);
      if (!list.length) { root.innerHTML = '<p class="empty">No big games in the next few days. Check back at the weekend.</p>'; return; }
      var html = "", last = "";
      list.forEach(function (m) {
        var d = dubai(Date.parse(m.utc)), key = d.toISOString().slice(0, 10);
        if (key !== last && !mini) { html += (last ? "</div>" : "") + '<h3 class="mb-day">' + dayLabel(d) + '</h3><div class="mb-list">'; last = key; }
        var live = m.status === "IN_PLAY" || m.status === "PAUSED", done = m.status === "FINISHED";
        html += '<div class="mb-match' + (live ? " is-live" : "") + '"><span class="mb-comp">' + esc(m.comp) + "</span>" +
          '<span class="mb-time">' + (live ? '<i class="mb-dot" aria-hidden="true"></i>Live now' + (m.score ? " " + m.score[0] + "–" + m.score[1] : "") : done ? "Full time " + (m.score ? m.score[0] + "–" + m.score[1] : "") : (mini ? short(d) + ", " : "") + hm(d)) + "</span>" +
          '<span class="mb-teams">' + crest(m.homeCrest) + "<b>" + esc(m.home) + '</b><span class="mb-v">v</span><b>' + esc(m.away) + "</b>" + crest(m.awayCrest) + "</span>" +
          (done ? "" : '<a class="btn btn--sm" href="' + esc(matchBook(m)) + '" target="_blank" rel="noopener">Book a table</a>') + "</div>";
      });
      if (!mini) html += "</div>";
      if (mini) html = '<div class="mb-list">' + html + "</div>";
      root.innerHTML = html + (j.sample ? '<p class="small mb-note">Sample fixtures to show how it works. The live Premier League and Champions League feed switches on with the server.</p>' : "");
    });
  }

  /* ================= score predictor ================= */
  function renderPredictor(root) {
    var mine = myCard();
    root.innerHTML = '<p class="small">Loading this round…</p>';
    function draw(j, note) {
      var picks = (j.mine && j.mine.picks) || {}, now = Date.now();
      var rows = j.matches.map(function (m) {
        var d = dubai(Date.parse(m.utc)), locked = Date.parse(m.utc) <= now, p = picks[m.id] || ["", ""];
        return '<div class="pr-row' + (locked ? " is-locked" : "") + '" data-id="' + esc(m.id) + '"><span class="pr-when">' + short(d) + ", " + hm(d) + "</span>" +
          '<span class="pr-team pr-home">' + esc(m.home) + "</span>" +
          '<input type="number" min="0" max="20" inputmode="numeric" aria-label="' + esc(m.home) + ' goals" value="' + esc(p[0]) + '"' + (locked ? " disabled" : "") + '><span class="pr-dash">–</span>' +
          '<input type="number" min="0" max="20" inputmode="numeric" aria-label="' + esc(m.away) + ' goals" value="' + esc(p[1]) + '"' + (locked ? " disabled" : "") + ">" +
          '<span class="pr-team pr-away">' + esc(m.away) + "</span>" +
          '<span class="pr-state">' + (m.status === "FINISHED" && m.score ? "Final " + m.score[0] + "–" + m.score[1] : locked ? "Locked" : "") + "</span></div>";
      }).join("");
      var board = j.board.length ? '<table class="dash-table pr-board"><thead><tr><th scope="col">#</th><th scope="col">Player</th><th scope="col">Points</th><th scope="col">Exact scores</th></tr></thead><tbody>' +
        j.board.map(function (r, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(r.name) + "</td><td><b>" + r.pts + "</b></td><td>" + r.exact + "</td></tr>"; }).join("") + "</tbody></table>" : '<p class="empty">No points yet. The table fills up after the first games.</p>';
      root.innerHTML = '<div class="pr-grid"><section class="dash-card"><h2 class="d-s">Round ' + esc(j.matchday) + '</h2><p class="small" style="margin:2px 0 14px">Each game locks at kick-off. Change your picks as often as you like before then.</p>' +
        '<form class="pr-form" novalidate>' + rows + '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">' + (mine ? "Save my predictions" : "Join the club to play") + "</button></div>" +
        '<p class="small" data-msg aria-live="polite" style="margin:8px 0 0">' + (note || "") + "</p></form></section>" +
        '<section class="dash-card"><h2 class="d-s">The table</h2>' + (j.mine && j.mine.place ? '<p class="small">You\'re in place ' + j.mine.place + " with " + j.mine.pts + " points.</p>" : "") + board +
        (j.sample ? '<p class="small mb-note">Sample round and table to show how it works. Real Premier League rounds and results come in by themselves once the server is on.</p>' : "") + "</section></div>";
      $(".pr-form", root).addEventListener("submit", function (e) {
        e.preventDefault();
        if (!mine) { location.href = "club.html?next=predictor.html"; return; }
        var picksOut = {};
        $$(".pr-row", root).forEach(function (r) { var ins = $$("input", r); if (!ins[0].disabled && ins[0].value !== "" && ins[1].value !== "") picksOut[r.getAttribute("data-id")] = [+ins[0].value, +ins[1].value]; });
        call("/api/predictor", { action: "save", id: mine.id, token: mine.token, picks: picksOut })
          .then(function (j2) { draw(j2, "Saved. Good luck!"); })
          .catch(function (err) { $("[data-msg]", root).textContent = err.message; });
      });
    }
    call("/api/predictor", mine ? { id: mine.id, token: mine.token } : {})
      .then(function (j) { draw(j); })
      .catch(function (err) { root.innerHTML = '<p class="small">' + esc(err.message) + "</p>"; });
  }

  /* ================= song requests ================= */
  function tonightMusic() {
    var b = biz(), dow = b.getUTCDay(), out = [];
    D.events.forEach(function (e) {
      if (e.days.indexOf(dow) === -1 || !e.lineup) return;
      e.lineup.forEach(function (l) { var a = D.artists[l.who]; if (a) out.push((a.role === "Karaoke host" ? "Karaoke with " : "") + a.name + (a.role === "Karaoke host" ? "" : " live") + ", " + l.time); });
    });
    return out;
  }
  function renderSongs(root) {
    var acts = tonightMusic();
    root.innerHTML = '<div class="songs-now"><span class="kicker">Tonight</span><p>' + (acts.length ? acts.map(esc).join("<br>") : "No live set tonight, so requests go to the bar playlist.") + "</p></div>" +
      '<form class="form song-form" novalidate><div class="form__row"><div class="field"><label for="sg-song">Song</label><input id="sg-song" maxlength="80" placeholder="e.g. Galway Girl"></div>' +
      '<div class="field"><label for="sg-artist">Artist <span class="small">(optional)</span></label><input id="sg-artist" maxlength="60" placeholder="e.g. Steve Earle"></div></div>' +
      '<div class="form__row"><div class="field"><label for="sg-name">Your name <span class="small">(optional)</span></label><input id="sg-name" maxlength="30"></div>' +
      '<div class="field"><label for="sg-note">Table or a message <span class="small">(optional)</span></label><input id="sg-note" maxlength="120" placeholder="e.g. Table 6, it\'s Mia\'s birthday"></div></div>' +
      '<div class="btn-row"><button class="btn" type="submit">Send to the host</button></div><p class="small" data-msg aria-live="polite" style="margin:0"></p></form>';
    $(".song-form", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("[data-msg]", root), f = this;
      call("/api/songs", { action: "request", song: $("#sg-song", f).value.trim(), artist: $("#sg-artist", f).value.trim(), name: $("#sg-name", f).value.trim(), note: $("#sg-note", f).value.trim() })
        .then(function () { if (TR) TR.log("song", { kind: "request" }); f.reset(); msg.textContent = "Sent to the host. They'll do their best to fit it in."; })
        .catch(function (err) { msg.textContent = err.message; });
    });
  }

  /* ================= creators form ================= */
  function renderCreatorForm(f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) { return ($("#" + id, f).value || "").trim(); };
      if (!v("cr-handle")) { $("[data-msg]", f).textContent = "Please add your Instagram or TikTok handle."; return; }
      var lines = ["Hi Adam's Beer Kitchen! I'm a creator and I'd love to work with you.", "",
        "Name: " + (v("cr-name") || "…"), "Handle: " + v("cr-handle"), "Followers: " + (v("cr-followers") || "…"), "Best night for me: " + v("cr-night"), "Advertiser permit: " + v("cr-permit")];
      if (v("cr-idea")) lines.push("Idea: " + v("cr-idea"));
      lines.push("", "Sent from the creators page");
      window.open(waTo(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* ================= posters & stories (dashboard) ================= */
  /* Arabic and Russian wording for each night (update these if a price changes; English comes from data.js) */
  var PT = {
    ar: {
      1: { k: "كل اثنين", t: ["خصم 20%", "أيام الاثنين"], l: ["من 9 مساءً حتى الإغلاق", "خصم 20% على الطعام والمشروبات", "لطاقم الطيران والمعلمين والعاملين في الفنادق"] },
      2: { k: "كل ثلاثاء", t: ["ليلة", "المسابقات"], l: ["7 – 9:30 مساءً مع ItsDylanLive", "جوائز تصل إلى 2,000 درهم", "برانش مسائي 7 – 10 مساءً: 189 / 239 درهم"] },
      3: { k: "كل أربعاء", t: ["ليلة", "السيدات"], l: ["للسيدات 99 / 129 درهم", "للرجال 149 / 199 درهم", "موسيقى حية 8 – 11 مساءً: Joe & David"] },
      4: { k: "كل خميس", t: ["ليلة", "الستيك"], l: ["ريب آي 250 غرام مع البطاطس ومشروبين: 199 درهم", "برانش مسائي 7 – 11 مساءً: 199 / 249 درهم", "موسيقى حية 8 – 11 مساءً: Fergal O'Neill"] },
      5: { k: "كل جمعة", t: ["الجمعة", "الكبيرة"], l: ["برانش المعلمين 1 – 5 مساءً", "Fuel Up من 4 إلى 8 مساءً: 229 / 279 درهم", "كاريوكي 8 – 11 مساءً، وموسيقى حية حتى 2 فجرًا"] },
      6: { k: "كل سبت", t: ["سبت", "الشواء"], l: ["برانش شواء 3 – 7 مساءً: 229 / 279 درهم", "برانش مسائي 7 – 10 مساءً: 199 / 249 درهم", "موسيقى حية: Fergal O'Neill وDavid Bracken"] },
      0: { k: "كل أحد", t: ["روست", "الأحد"], l: ["بوفيه روست 1 – 8 مساءً: 99 درهم", "برانش مسائي 5 – 8 مساءً: 179 / 229 درهم", "موسيقى حية 8 – 11 مساءً: Lee Wall"] },
      happy: { k: "كل يوم", t: ["ساعة", "السعادة"], l: ["الأحد – الخميس: 12 ظهرًا – 9 مساءً", "الجمعة والسبت: 12 ظهرًا – 7 مساءً", "في كل أرجاء المكان"] },
      "christmas-parties": { k: "1 – 24 ديسمبر", t: ["حفلات", "الكريسماس"], l: ["باقات من 199 درهم", "مساحة خاصة لـ 15 – 40 شخصًا", "احجز موعدك بعربون بسيط"] },
      "new-years-eve": { k: "31 ديسمبر", t: ["ليلة", "رأس السنة"], l: ["فرقة موسيقية حية من 9 مساءً", "العد التنازلي على كل الشاشات", "باقات من 299 درهم"] },
      "match-day-tables": { k: "كل نهاية أسبوع", t: ["يوم", "المباراة"], l: ["كل مباريات الدوري الإنجليزي على الشاشات الكبيرة", "طاولة مقابل الشاشات", "الحجز مجاني"] },
      f1: { race: "ليلة سباق الفورمولا 1", screens: "على الشاشات الكبيرة، الساعة",
        promo: "*اربح جوائز الفورمولا 1:* اطلب كأسين أو أكثر من Heineken وامسح رمز QR للتقدم في Fans' Grid، أو اطلب من قائمة Jack Daniel's للفورمولا 1 واكشط البطاقة لتربح." },
      week: { k: "هذا الأسبوع في Adam's Beer Kitchen", t: ["سبع", "ليالٍ"] },
      days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
      bar: "احجز عبر واتساب \u2066+971 54 306 8854\u2069", addr: "الطابق 1، HE Hotel Apartments، JVC", hh: "ساعة السعادة يوميًا من 12 ظهرًا"
    },
    ru: {
      1: { k: "Каждый понедельник", t: ["−20%", "по понедельникам"], l: ["С 21:00 до закрытия", "Скидка 20% на еду и напитки", "Для бортпроводников, учителей и сотрудников отелей"] },
      2: { k: "Каждый вторник", t: ["Квиз", "по вторникам"], l: ["19:00 – 21:30, ведущий ItsDylanLive", "Призы до 2 000 AED", "Квиз-бранч 19:00 – 22:00: 189 / 239 AED"] },
      3: { k: "Каждую среду", t: ["Ladies", "Night"], l: ["Девушки: 99 / 129 AED", "Мужчины: 149 / 199 AED", "Живая музыка 20:00 – 23:00: Joe & David"] },
      4: { k: "Каждый четверг", t: ["Стейк-", "вечер"], l: ["Рибай 250 г, фри и 2 напитка: 199 AED", "Вечерний бранч 19:00 – 23:00: 199 / 249 AED", "Живая музыка 20:00 – 23:00: Fergal O'Neill"] },
      5: { k: "Каждую пятницу", t: ["Большая", "пятница"], l: ["Бранч для учителей 13:00 – 17:00", "Fuel Up 16:00 – 20:00: 229 / 279 AED", "Караоке 20:00 – 23:00, живая музыка до 02:00"] },
      6: { k: "Каждую субботу", t: ["Гриль-", "суббота"], l: ["BBQ-бранч 15:00 – 19:00: 229 / 279 AED", "Вечерний бранч 19:00 – 22:00: 199 / 249 AED", "Живая музыка: Fergal O'Neill, David Bracken"] },
      0: { k: "Каждое воскресенье", t: ["Воскресный", "роуст"], l: ["Роуст-буфет 13:00 – 20:00: 99 AED", "Вечерний бранч 17:00 – 20:00: 179 / 229 AED", "Живая музыка 20:00 – 23:00: Lee Wall"] },
      happy: { k: "Каждый день", t: ["Happy", "hour"], l: ["Вс – Чт: 12:00 – 21:00", "Пт и Сб: 12:00 – 19:00", "По всему заведению"] },
      "christmas-parties": { k: "1 – 24 декабря", t: ["Рождество", "в Adam's"], l: ["Пакеты от 199 AED", "Отдельная зона на 15 – 40 гостей", "Дата закрепляется депозитом"] },
      "new-years-eve": { k: "31 декабря", t: ["Новый", "год"], l: ["Живая группа с 21:00", "Обратный отсчёт на всех экранах", "Пакеты от 299 AED"] },
      "match-day-tables": { k: "Каждые выходные", t: ["Футбол", "АПЛ"], l: ["Все матчи Премьер-лиги на больших экранах", "Стол напротив экранов", "Бронь бесплатно"] },
      f1: { race: "Вечер Формулы 1", screens: "на больших экранах, старт в",
        promo: "*Выиграйте призы Формулы 1:* закажите 2+ пинты Heineken и отсканируйте QR-код, чтобы подняться в Fans' Grid, или закажите напиток из F1-меню Jack Daniel's и сотрите скретч-карту." },
      week: { k: "Эта неделя в Adam's Beer Kitchen", t: ["Семь", "вечеров"] },
      days: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      bar: "Бронь в WhatsApp +971 54 306 8854", addr: "1-й этаж, HE Hotel Apartments, JVC", hh: "Happy hour каждый день с 12:00"
    }
  };
  var EN_UI = { bar: "Book on WhatsApp +971 54 306 8854", addr: "Floor 1, HE Hotel Apartments, JVC", hh: "Happy hour every day from 12PM" };

  function eventBySlug(s) { return D.events.filter(function (e) { return e.slug === s; })[0]; }
  function enNight(dow) {
    var tk = D.takeover[dow], ev = eventBySlug(tk.slug) || {}, wk = dow === 5 ? D.fridayWeek : ev.week;
    var lines = ((wk && wk.lines) || []).map(function (p) { return /\d/.test(p[0]) ? p[0] + " · " + p[1] : p[0] + ": " + p[1]; });
    return { k: ev.dayLabel || "", t: tk.lines.slice(), l: lines.slice(0, 4), img: dow === 5 ? D.fridayWeek.img : ev.img, sub: tk.sub };
  }
  function enCampaign(c) {
    var low = Math.min.apply(null, c.packages.map(function (p) { return p.price; }));
    return { k: c.season, t: c.title.slice(), l: ["Packages from AED " + low, c.perks[0], c.perks[1]], img: c.img, sub: c.hook };
  }
  function posterList() {
    var out = [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (dow) { out.push({ id: "n" + dow, label: DAYS[dow] + ": " + D.takeover[dow].lines.join(" ") }); });
    out.push({ id: "week", label: "This week (all 7 nights)" }, { id: "happy", label: "Happy hour" });
    (D.campaigns || []).forEach(function (c) { out.push({ id: "c:" + c.slug, label: c.name }); });
    return out;
  }
  function posterData(id, lang) {
    var P = PT[lang], p;
    if (id === "week") {
      var rows = [1, 2, 3, 4, 5, 6, 0].map(function (dow) {
        return [lang === "en" ? DAY3[dow] : P.days[dow], lang === "en" ? D.takeover[dow].lines.join(" ") : P[dow].t.join(" ").replace("- ", "-")];
      });
      p = lang === "en" ? { k: "This week at Adam's Beer Kitchen", t: ["Seven", "nights"] } : { k: P.week.k, t: P.week.t.slice() };
      p.rows = rows; p.img = "post-1"; p.foot = lang === "en" ? EN_UI.hh : P.hh;
      p.sub = lang === "en" ? rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") : rows.map(function (r) { return r[0] + ": " + r[1]; }).join("\n");
      return p;
    }
    if (id === "happy") {
      p = lang === "en" ? { k: "Every day", t: ["Happy", "hour"], l: ["Sunday – Thursday · 12PM – 9PM", "Friday & Saturday · 12PM – 7PM", "Across the whole venue"] } : JSON.parse(JSON.stringify(P.happy));
      p.img = "post-12"; return p;
    }
    if (id.indexOf("c:") === 0) {
      var c = D.campaigns.filter(function (x) { return x.slug === id.slice(2); })[0];
      p = lang === "en" || !P[c.slug] ? enCampaign(c) : JSON.parse(JSON.stringify(P[c.slug]));
      p.img = c.img; return p;
    }
    var dow = +id.slice(1), en = enNight(dow);
    if (lang === "en") return en;
    p = JSON.parse(JSON.stringify(P[dow])); p.img = en.img; return p;
  }
  function caption(p, lang, id) {
    var base = siteBase(), name = p.t.join(" ").replace("- ", "-");
    if (lang === "ar") return name + "، " + p.k + ".\n" + (p.rows ? p.sub : p.l.join("\n")) + "\n\nالطابق 1، HE Hotel Apartments، JVC. احجز عبر واتساب: \u2066+971 54 306 8854\u2069، أو من الرابط في البايو.\n\n#دبي #JVC #مطاعم_دبي #فعاليات_دبي #سهرات_دبي";
    if (lang === "ru") return name + ", " + p.k.toLowerCase() + ".\n" + (p.rows ? p.sub : p.l.join("\n")) + "\n\n1-й этаж HE Hotel Apartments, JVC. Бронь в WhatsApp: +971 54 306 8854 или по ссылке в профиле.\n\n#дубай #JVC #русскиевдубае #кудапойтивдубае #дубайресторан";
    var tag = name.replace(/[^A-Za-z0-9]/g, "");
    return name + ", " + (p.k || "").toLowerCase() + ".\n" + (p.rows ? p.sub : p.l.join("\n")) + "\n\nFloor 1, HE Hotel Apartments, JVC. Book on WhatsApp: +971 54 306 8854, or tap the link in our bio (" + base.replace(/^https?:\/\//, "") + ").\n\n#JVC #JVCDubai #DubaiNightlife #ThingsToDoInDubai #DubaiEats" + (tag ? " #" + tag : "");
  }

  var imgCache = {};
  function loadImg(src) {
    if (!imgCache[src]) imgCache[src] = new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; });
    return imgCache[src];
  }
  function fontsFor(text) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(["800 120px 'Barlow Condensed'", "700 46px 'Barlow Condensed'", "600 42px 'Barlow Condensed'"].map(function (f) { return document.fonts.load(f, text); })).catch(function () {});
  }
  function wrapLines(ctx, text, maxW) {
    var words = String(text).split(" "), out = [], cur = "";
    words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur);
    return out;
  }
  function drawPoster(cv, p, size, lang, photo, logo) {
    var W = 1080, H = size === "story" ? 1920 : 1350, ctx = cv.getContext("2d"), rtl = lang === "ar", up = lang !== "ar";
    cv.width = W; cv.height = H;
    var DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif";
    ctx.fillStyle = "#130e0a"; ctx.fillRect(0, 0, W, H);
    var X = rtl ? W - 80 : 80, maxW = W - 160, safeTop = size === "story" ? 210 : 56, safeBottom = size === "story" ? 250 : 0;
    var barH = 112, barTop = H - safeBottom - barH;
    ctx.direction = rtl ? "rtl" : "ltr"; ctx.textAlign = rtl ? "right" : "left"; ctx.textBaseline = "alphabetic";

    /* measure the text block first, then lay it out from the bottom up */
    var kicker = up ? String(p.k).toUpperCase() : p.k, title = p.t.map(function (t) { return up ? t.toUpperCase() : t; });
    var ts = p.rows ? (size === "story" ? 150 : 120) : 196, rowH = size === "story" ? 70 : 58;
    for (; ts > 84; ts -= 4) { ctx.font = "800 " + ts + "px " + DISPLAY; if (title.every(function (t) { return ctx.measureText(t).width <= maxW; })) break; }
    var lh = rtl ? ts * 1.2 : ts * 0.9;
    ctx.font = "600 42px " + DISPLAY;
    var facts = [];
    (p.l || []).forEach(function (l) { facts = facts.concat(wrapLines(ctx, l, maxW)); });
    var factsH = p.rows ? p.rows.length * rowH + 60 : facts.length * 58;
    var contentH = 46 + 22 + (rtl ? ts * 1.05 : lang === "ru" ? ts * 0.97 : ts * 0.86) + (title.length - 1) * lh + 34 + 54 + factsH + 70;
    var y0 = barTop - 36 - contentH + 46; /* kicker baseline */
    /* the photo fades to black just behind the kicker, so every line of text sits on a dark background */
    var photoH = Math.max(size === "story" ? 700 : 330, Math.min(size === "story" ? 1100 : 760, y0 + 60));

    if (photo) {
      var r = Math.max(W / photo.width, photoH / photo.height), w = photo.width * r, h = photo.height * r;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, photoH); ctx.clip();
      ctx.drawImage(photo, (W - w) / 2, (photoH - h) / 2, w, h);
      ctx.restore();
    }
    var g = ctx.createLinearGradient(0, Math.max(0, photoH - 420), 0, photoH);
    g.addColorStop(0, "rgba(19,14,10,0)"); g.addColorStop(0.6, "rgba(19,14,10,.78)"); g.addColorStop(1, "rgba(19,14,10,1)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, photoH + 1);
    var tg = ctx.createLinearGradient(0, 0, 0, safeTop + 260); tg.addColorStop(0, "rgba(19,14,10,.55)"); tg.addColorStop(1, "rgba(19,14,10,0)");
    ctx.fillStyle = tg; ctx.fillRect(0, 0, W, safeTop + 260);

    if (logo) {
      var lx = rtl ? W - 70 - 156 : 70;
      ctx.save(); ctx.fillStyle = "rgba(19,14,10,.78)"; ctx.beginPath(); ctx.arc(lx + 78, safeTop + 78, 92, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.drawImage(logo, lx, safeTop, 156, 156);
    }

    var y = y0;
    ctx.fillStyle = "#e2c487"; ctx.font = "700 46px " + DISPLAY; ctx.fillText(kicker, X, y);
    y += 22 + (rtl ? ts * 1.05 : lang === "ru" ? ts * 0.97 : ts * 0.86);
    ctx.fillStyle = "#ffc72c"; ctx.font = "800 " + ts + "px " + DISPLAY;
    title.forEach(function (t, i) { ctx.fillText(t, X, y + i * lh); });
    y += (title.length - 1) * lh + 34;
    ctx.strokeStyle = "#c9a25b"; ctx.lineWidth = 4; ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(W - 80, y); ctx.stroke(); ctx.setLineDash([]);
    y += 54 + 6;
    if (p.rows) {
      p.rows.forEach(function (r) {
        ctx.fillStyle = "#e2c487"; ctx.font = "700 40px " + DISPLAY; ctx.fillText(up ? r[0].toUpperCase() : r[0], X, y);
        ctx.fillStyle = "#f4eadb"; ctx.font = "700 46px " + DISPLAY; ctx.fillText(up ? r[1].toUpperCase() : r[1], rtl ? X - 190 : X + 190, y);
        y += rowH;
      });
      ctx.fillStyle = "#ffc72c"; ctx.font = "700 42px " + DISPLAY; ctx.fillText(p.foot, X, y + 2);
    } else {
      ctx.fillStyle = "#f4eadb"; ctx.font = "600 42px " + DISPLAY;
      facts.forEach(function (f) { ctx.fillText(f, X, y); y += 58; });
    }
    var UI = lang === "en" ? EN_UI : PT[lang];
    ctx.fillStyle = "#a89a86"; ctx.font = "600 34px " + DISPLAY; ctx.fillText(UI.addr, X, barTop - 34);
    ctx.fillStyle = "#ffc72c"; ctx.fillRect(0, barTop, W, barH);
    ctx.fillStyle = "#1a1206"; ctx.font = "800 44px " + DISPLAY;
    ctx.fillText(up ? UI.bar.toUpperCase() : UI.bar, X, barTop + 72);
    ctx.direction = "ltr"; ctx.textAlign = rtl ? "left" : "right"; ctx.font = "700 40px " + DISPLAY; ctx.fillText("@abk_jvc", rtl ? 80 : W - 80, barTop + 70); ctx.direction = rtl ? "rtl" : "ltr";
    ctx.textAlign = rtl ? "right" : "left";
    if (size === "story") {
      ctx.fillStyle = "#130e0a"; ctx.fillRect(0, barTop + barH, W, H - barTop - barH);
    }
  }
  function renderStudio(root) {
    var st = { id: "n" + biz().getUTCDay(), size: "post", lang: "en", photo: "" };
    var photos = []; for (var i = 1; i <= 12; i++) photos.push("post-" + i);
    root.innerHTML = '<div class="studio"><div class="studio__controls">' +
      '<div class="field"><label for="st-what">What to promote</label><select id="st-what">' + posterList().map(function (o) { return '<option value="' + o.id + '">' + esc(o.label) + "</option>"; }).join("") + "</select></div>" +
      '<fieldset class="field"><legend>Size</legend><div class="choices" data-size><button class="chip" type="button" data-v="post" aria-pressed="true">Instagram post</button><button class="chip" type="button" data-v="story" aria-pressed="false">Story</button></div></fieldset>' +
      '<fieldset class="field"><legend>Language</legend><div class="choices" data-lang><button class="chip" type="button" data-v="en" aria-pressed="true">English</button><button class="chip" type="button" data-v="ar" aria-pressed="false" lang="ar">العربية</button><button class="chip" type="button" data-v="ru" aria-pressed="false" lang="ru">Русский</button></div></fieldset>' +
      '<fieldset class="field"><legend>Photo</legend><div class="studio__photos">' + photos.map(function (p) { return '<button type="button" data-photo="' + p + '" aria-pressed="false"><img src="assets/img/ig/' + p + '.jpg" alt="' + p + '" loading="lazy"></button>'; }).join("") + "</div></fieldset>" +
      '<div class="btn-row"><button class="btn" type="button" data-download>Download image</button></div><p class="small" data-dl-msg aria-live="polite" style="margin:0"></p>' +
      '<div class="field"><label for="st-cap">Caption</label><textarea id="st-cap" rows="8"></textarea></div>' +
      '<div class="btn-row"><button class="btn btn--ghost" type="button" data-copy-cap>Copy caption</button></div></div>' +
      '<div class="studio__preview"><canvas aria-label="Poster preview"></canvas></div></div>';
    var cv = $("canvas", root), sel = $("#st-what", root);
    sel.value = st.id;
    function press(group, v) { $$("[data-v]", $(group, root)).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === v)); }); }
    function draw() {
      var p = posterData(st.id, st.lang), photo = st.photo || p.img;
      $$("[data-photo]", root).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-photo") === photo)); });
      $("#st-cap", root).value = caption(p, st.lang, st.id);
      var text = [p.k].concat(p.t, p.l || [], (p.rows || []).map(function (r) { return r.join(" "); }), [(st.lang === "en" ? EN_UI : PT[st.lang]).bar]).join(" ");
      Promise.all([loadImg("assets/img/ig/" + photo + ".jpg"), loadImg("assets/img/logo.png"), fontsFor(text)]).then(function (a) { drawPoster(cv, p, st.size, st.lang, a[0], a[1]); });
    }
    sel.addEventListener("change", function () { st.id = sel.value; st.photo = ""; draw(); });
    $("[data-size]", root).addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) { st.size = b.getAttribute("data-v"); press("[data-size]", st.size); draw(); } });
    $("[data-lang]", root).addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) { st.lang = b.getAttribute("data-v"); press("[data-lang]", st.lang); draw(); } });
    $(".studio__photos", root).addEventListener("click", function (e) { var b = e.target.closest("[data-photo]"); if (b) { st.photo = b.getAttribute("data-photo"); draw(); } });
    $("[data-copy-cap]", root).addEventListener("click", function () { copy($("#st-cap", root).value, this); });
    $("[data-download]", root).addEventListener("click", function () {
      var msg = $("[data-dl-msg]", root), name = "adams-beer-kitchen-" + st.id.replace(/[^a-z0-9-]/gi, "") + "-" + st.size + "-" + st.lang + ".png";
      try {
        cv.toBlob(function (blob) {
          if (!blob) { msg.textContent = "Couldn't make the image here. Try the online version of the site."; return; }
          var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
          msg.textContent = "Saved as " + name;
        }, "image/png");
      } catch (err) {
        msg.textContent = "Downloads work on the online site (browsers block them when the site is opened from a file). The preview is exactly what you'll get.";
      }
    });
    draw();
  }

  /* ================= WhatsApp broadcast writer (dashboard) ================= */
  function renderBroadcast(root) {
    var st = { lang: "en", start: 0, hh: true, specials: true, football: true, club: true, f1: !!F1 };
    root.innerHTML = '<div class="studio"><div class="studio__controls">' +
      '<fieldset class="field"><legend>Language</legend><div class="choices" data-lang><button class="chip" type="button" data-v="en" aria-pressed="true">English</button><button class="chip" type="button" data-v="ar" aria-pressed="false" lang="ar">العربية</button><button class="chip" type="button" data-v="ru" aria-pressed="false" lang="ru">Русский</button></div></fieldset>' +
      '<fieldset class="field"><legend>Which week</legend><div class="choices" data-start><button class="chip" type="button" data-v="0" aria-pressed="true">From today</button><button class="chip" type="button" data-v="next" aria-pressed="false">Next Monday</button></div></fieldset>' +
      '<fieldset class="field"><legend>Include</legend><div class="choices" data-inc>' +
      [["hh", "Happy hour"], ["specials", "Specials & parties"], ["football", "Football"], ["club", "Adam's Club"]].concat(F1 ? [["f1", "F1 race nights"]] : []).map(function (x) { return '<button class="chip" type="button" data-v="' + x[0] + '" aria-pressed="true">' + x[1] + "</button>"; }).join("") + "</div></fieldset>" +
      '<p class="small">Paste it into a WhatsApp Business broadcast list, or a status. Every link carries a tag, so bookings from it show up as "WhatsApp broadcast" on the dashboard.</p>' +
      '<div class="btn-row"><button class="btn" type="button" data-copy>Copy message</button><a class="btn btn--wa" data-open target="_blank" rel="noopener">Open in WhatsApp</a></div></div>' +
      '<div class="studio__preview"><div class="wa-phone"><div class="wa-phone__top"><img src="assets/img/logo.png" alt=""><div><b>Broadcast</b><span>Preview</span></div></div><div class="wa-bubble" data-preview></div></div></div></div>';
    function weekStart() {
      var b = biz();
      if (st.start === "next") { var add = (8 - b.getUTCDay()) % 7 || 7; return new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate() + add)); }
      return new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()));
    }
    function dateIn(d, lang) {
      if (lang === "en") return short(d);
      return d.toLocaleDateString(lang === "ar" ? "ar-AE-u-nu-latn" : "ru-RU", { weekday: lang === "ar" ? "long" : "short", day: "numeric", month: "short", timeZone: "UTC" });
    }
    function build(matches) {
      var L = st.lang, base = siteBase(), s = weekStart(), lines = [];
      var head = { en: "*This week at Adam's Beer Kitchen JVC*", ar: "*هذا الأسبوع في Adam's Beer Kitchen JVC*", ru: "*На этой неделе в Adam's Beer Kitchen JVC*" };
      lines.push(head[L], "");
      for (var i = 0; i < 7; i++) {
        var d = new Date(s.getTime() + i * 864e5), dow = d.getUTCDay();
        if (L === "en") lines.push("*" + short(d) + ", " + D.takeover[dow].lines.join(" ") + ":* " + D.takeover[dow].sub);
        else lines.push("*" + dateIn(d, L) + (L === "ar" ? "، " : ", ") + PT[L][dow].t.join(" ").replace("- ", "-") + ":* " + PT[L][dow].l.join(L === "ar" ? "، " : ", ") + ".");
      }
      if (st.hh) lines.push("", { en: "*Happy hour* every day from 12PM: till 9PM Sunday to Thursday, till 7PM Friday and Saturday.", ar: "*ساعة السعادة* يوميًا من 12 ظهرًا: حتى 9 مساءً من الأحد إلى الخميس، وحتى 7 مساءً الجمعة والسبت.", ru: "*Happy hour* каждый день с 12:00: до 21:00 с воскресенья по четверг, до 19:00 в пятницу и субботу." }[L]);
      if (st.specials) {
        var end = new Date(s.getTime() + 7 * 864e5).toISOString().slice(0, 10), from = s.toISOString().slice(0, 10), soon = new Date(s.getTime() + 60 * 864e5).toISOString().slice(0, 10);
        var sp = [];
        if (L === "en") (D.specials || []).forEach(function (x) { if (x.from <= end && x.to >= from && !/TBC|to be/i.test(x.short)) sp.push("*" + x.name + ":* " + x.short); });
        (D.campaigns || []).forEach(function (c) {
          if (c.from > soon || c.to < from || c.slug === "match-day-tables") return;
          if (L === "en") sp.push("*" + c.name + " (" + c.season + "):* " + enCampaign(c).l[0] + ". Book: " + base + c.slug + ".html?src=whatsapp");
          else { var t = PT[L][c.slug]; if (t) sp.push("*" + t.t.join(" ") + " (" + t.k + "):* " + t.l[0] + ". " + base + c.slug + ".html?src=whatsapp"); }
        });
        if (sp.length) lines.push("", sp.join("\n"));
      }
      if (st.football && matches.length) {
        var wkEnd = s.getTime() + 7 * 864e5 - 4 * 36e5, big = matches.filter(function (m) { var t = Date.parse(m.utc); return t >= s.getTime() - 4 * 36e5 && t < wkEnd && m.status !== "FINISHED"; }).slice(0, 4);
        if (big.length) lines.push("", { en: "*Football on the big screens:* ", ar: "*كرة القدم على الشاشات الكبيرة:* ", ru: "*Футбол на больших экранах:* " }[L] +
          big.map(function (m) { var d = dubai(Date.parse(m.utc)); return m.home + " v " + m.away + " (" + (L === "en" ? DAY3[d.getUTCDay()] + " " + hm(d) : (L === "ar" ? PT.ar.days[d.getUTCDay()] : PT.ru.days[d.getUTCDay()]) + " " + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes())) + ")"; }).join(", ") + ". " + base + "matches.html?src=whatsapp");
      }
      if (st.f1 && F1) {
        var wFrom = s.toISOString().slice(0, 10), wTo = new Date(s.getTime() + 7 * 864e5).toISOString().slice(0, 10), f1 = [];
        F1.races.forEach(function (r) {
          if (r.date < wFrom || r.date >= wTo) return;
          var d = dayOf(r.date);
          f1.push(L === "en" ? "*F1 race night, " + short(d) + ":* the " + r.name + " on the big screens, from " + raceTime(r.time, "en") + "."
            : "*" + PT[L].f1.race + (L === "ar" ? "، " : ", ") + dateIn(d, L) + ":* " + r[L] + " " + PT[L].f1.screens + " " + raceTime(r.time, L) + ".");
        });
        if ((wFrom <= F1.heineken.to && wTo > F1.heineken.from) || (wFrom <= F1.jack.to && wTo > F1.jack.from)) {
          f1.push((L === "en" ? "*Win F1 prizes:* order 2+ Heineken pints and scan the QR to climb Heineken's Fans' Grid, or order from the Jack Daniel's F1 menu and scratch to win." : PT[L].f1.promo) + " " + base + "grand-prix.html?src=whatsapp");
        }
        if (f1.length) lines.push("", f1.join("\n"));
      }
      if (st.club) lines.push("", { en: "Not in Adam's Club yet? A birthday treat and every " + CLUB.need + "th visit on us: " + base + "club.html?src=whatsapp", ar: "لست عضوًا في Adam's Club بعد؟ هدية في شهر ميلادك، والزيارة رقم " + CLUB.need + " علينا: " + base + "club.html?src=whatsapp", ru: "Ещё не в Adam's Club? Подарок в месяц рождения и каждый " + CLUB.need + "-й визит за наш счёт: " + base + "club.html?src=whatsapp" }[L]);
      lines.push("", { en: "Book a table: " + base + "book.html?src=whatsapp\nFloor 1, HE Hotel Apartments, JVC", ar: "احجز طاولة: " + base + "ar.html?src=whatsapp#book\nالطابق 1، HE Hotel Apartments، JVC", ru: "Бронь стола: " + base + "ru.html?src=whatsapp#book\n1-й этаж, HE Hotel Apartments, JVC" }[L]);
      return lines.join("\n");
    }
    function bold(t) { return esc(t).replace(/\*([^*\n]+)\*/g, "<b>$1</b>"); } /* the bubble keeps line breaks itself */
    function draw() {
      fixtures().then(function (j) {
        var text = build(j.matches || []), pv = $("[data-preview]", root);
        pv.innerHTML = bold(text); pv.setAttribute("dir", st.lang === "ar" ? "rtl" : "ltr");
        $("[data-open]", root).href = "https://wa.me/?text=" + encodeURIComponent(text);
        root._text = text;
      });
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-v]"); if (!b) return;
      var g = b.parentNode, v = b.getAttribute("data-v");
      if (g.hasAttribute("data-inc")) { st[v] = !st[v]; b.setAttribute("aria-pressed", String(st[v])); }
      else { $$("[data-v]", g).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); if (g.hasAttribute("data-lang")) st.lang = v; else st.start = v === "next" ? "next" : 0; }
      draw();
    });
    $("[data-copy]", root).addEventListener("click", function () { copy(root._text || "", this); });
    draw();
  }

  /* ================= club members (dashboard) ================= */
  function renderClubAdmin(root) {
    root.innerHTML = '<p class="small">Loading members…</p>';
    call("/api/club", { action: "list", pin: staffPin() || "2026" }).then(function (j) {
      var mem = j.members, now = biz(), mm = pad(now.getUTCMonth() + 1), month = MONTHS[now.getUTCMonth()];
      var recent = mem.filter(function (m) { return Date.now() - Date.parse(m.joined) < 30 * 864e5; }).length;
      var bdays = mem.filter(function (m) { return m.bday.slice(0, 2) === mm; }).sort(function (a, b) { return a.bday.localeCompare(b.bday); });
      var ready = mem.filter(function (m) { return m.stamps >= j.need; }).length;
      function bdayMsg(m) { return "Happy birthday, " + m.name.split(" ")[0] + "! Your birthday treat is waiting at Adam's Beer Kitchen JVC this month: " + CLUB.birthday.replace(/ in your birthday month$/, "") + ". Just show your Adam's Club card at the bar. See you soon!"; }
      var nice = function (b) { var p = b.split("-"); return +p[1] + " " + MON3[+p[0] - 1]; };
      root.innerHTML = '<div class="dash">' + (j.demo ? '<p class="small" style="margin:0">Practice mode: 5 sample members, plus anyone who joins on this device. Real members appear once the server is on.</p>' : "") +
        '<div class="dash-tiles">' + [["Members", mem.length], ["Joined in the last 30 days", recent], ["Birthdays in " + month, bdays.length], ["Rewards ready to give", ready]].map(function (t) { return '<div class="dash-tile"><span class="dash-label">' + t[0] + '</span><b class="dash-value">' + t[1] + "</b></div>"; }).join("") + "</div>" +
        '<div class="dash-grid"><section class="dash-card"><h3 class="d-s">Birthdays in ' + month + '</h3><p class="small" style="margin:2px 0 10px">One tap sends the birthday message on WhatsApp.</p>' +
        (bdays.length ? '<ul class="bday-list">' + bdays.map(function (m) { return "<li><span><b>" + esc(m.name) + "</b> " + nice(m.bday) + (m.bdayUsed === String(now.getUTCFullYear()) ? ' <span class="small">(treat given)</span>' : "") + '</span><a class="btn btn--sm btn--wa" href="' + esc(waPerson(m.phone, bdayMsg(m))) + '" target="_blank" rel="noopener">Send wishes</a></li>'; }).join("") + "</ul>" : '<p class="empty">No birthdays this month.</p>') + "</section>" +
        '<section class="dash-card"><h3 class="d-s">Broadcast list</h3><p class="small" style="margin:2px 0 10px">Every member\'s WhatsApp number, ready to add to a WhatsApp Business broadcast list. Members said yes to messages when they joined.</p><div class="btn-row"><button class="btn btn--ghost" type="button" data-copy-nums>Copy all ' + mem.length + " numbers</button></div></section>" +
        '<section class="dash-card dash-wide"><h3 class="d-s">Members</h3><div class="dash-tablewrap"><table class="dash-table"><thead><tr><th scope="col">Name</th><th scope="col">WhatsApp</th><th scope="col">Birthday</th><th scope="col">Stamps</th><th scope="col">Visits</th><th scope="col">Joined</th><th scope="col">Came from</th><th scope="col"><span class="sr-only">Card link</span></th></tr></thead><tbody>' +
        mem.map(function (m) { var jd = dubai(Date.parse(m.joined)); return "<tr><td>" + esc(m.name) + "</td><td>+" + esc(m.phone) + "</td><td>" + nice(m.bday) + "</td><td>" + m.stamps + " / " + j.need + "</td><td>" + (m.visits || 0) + "</td><td>" + jd.getUTCDate() + " " + MON3[jd.getUTCMonth()] + "</td><td>" + esc(TR && m.src ? TR.label(m.src) : (m.src || "–")) + '</td><td><button class="link" type="button" data-relink="' + esc(m.id) + '">Resend card</button></td></tr>'; }).join("") +
        '</tbody></table></div><p class="small" data-relink-msg aria-live="polite"></p></section></div></div>';
      $("[data-copy-nums]", root).addEventListener("click", function () { copy(mem.map(function (m) { return "+" + m.phone; }).join("\n"), this); });
      root.addEventListener("click", function (e) {
        var b = e.target.closest("[data-relink]"); if (!b) return;
        call("/api/club", { action: "relink", id: b.getAttribute("data-relink"), pin: staffPin() || "2026" }).then(function (r) {
          var link = siteBase() + "club.html?card=" + r.id + "." + r.token;
          window.open(waPerson(r.phone, "Hi " + r.name.split(" ")[0] + "! Here's your Adam's Club card: " + link + "\nOpen it and save it to your home screen."), "_blank", "noopener");
        }).catch(function (err) { $("[data-relink-msg]", root).textContent = err.message; });
      });
    }).catch(function (err) { root.innerHTML = '<p class="small">' + esc(err.message) + "</p>"; });
  }

  /* ================= song requests (dashboard, for the host) ================= */
  function renderSongsAdmin(root) {
    function load() {
      call("/api/songs", { action: "list", pin: staffPin() || "2026" }).then(function (j) { draw(j); }).catch(function (err) { root.innerHTML = '<p class="small">' + esc(err.message) + "</p>"; });
    }
    function draw(j) {
      var open = j.songs.filter(function (s) { return !s.played; }), done = j.songs.filter(function (s) { return s.played; });
      function row(s) { var d = dubai(Date.parse(s.at)); return '<li class="' + (s.played ? "is-played" : "") + '"><span class="song-time">' + hm(d) + '</span><span class="song-main"><b>' + esc(s.song) + "</b>" + (s.artist ? " · " + esc(s.artist) : "") + (s.name || s.note ? '<span class="small">' + esc([s.name, s.note].filter(Boolean).join(": ")) + "</span>" : "") + '</span><button class="btn btn--sm ' + (s.played ? "btn--ghost" : "") + '" type="button" data-played="' + esc(s.id) + '">' + (s.played ? "Undo" : "Played") + "</button></li>"; }
      root.innerHTML = '<div class="dash">' + (j.demo ? '<p class="small" style="margin:0">Practice mode: 3 sample requests, plus any sent from this device.</p>' : "") +
        '<div class="dash-grid"><section class="dash-card"><h3 class="d-s">Up next (' + open.length + ')</h3><p class="small" style="margin:2px 0 10px">Tonight\'s requests, oldest first. Refreshes every 20 seconds. Share the page link: ' + esc(siteBase().replace(/^https?:\/\//, "")) + "songs.html</p>" +
        (open.length ? '<ul class="song-list">' + open.map(row).join("") + "</ul>" : '<p class="empty">No requests waiting.</p>') + "</section>" +
        '<section class="dash-card"><h3 class="d-s">Played</h3>' + (done.length ? '<ul class="song-list">' + done.map(row).join("") + "</ul>" : '<p class="empty">Nothing played yet.</p>') + "</section></div></div>";
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-played]"); if (!b) return;
      call("/api/songs", { action: "played", id: b.getAttribute("data-played"), pin: staffPin() || "2026" }).then(draw);
    });
    load();
    root._timer = setInterval(function () { if (!root.hidden) load(); }, 20000);
  }

  /* ================= dashboard tabs ================= */
  function renderDashNav(root) {
    if (ss("abk_dash") !== "1") return;
    var tabs = [["bookings", "Bookings"], ["posters", "Posters & stories"], ["broadcast", "WhatsApp broadcast"], ["club", "Club members"], ["songs", "Song requests"]];
    var made = {};
    root.innerHTML = '<div class="dash-tabs" role="tablist" aria-label="Dashboard">' + tabs.map(function (t, i) { return '<button class="chip" type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (i === 0) + '" aria-pressed="' + (i === 0) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    var builders = { posters: renderStudio, broadcast: renderBroadcast, club: renderClubAdmin, songs: renderSongsAdmin };
    function show(tab) {
      $$("[data-tab]", root).forEach(function (b) { var on = b.getAttribute("data-tab") === tab; b.setAttribute("aria-selected", String(on)); b.setAttribute("aria-pressed", String(on)); });
      $$("[data-dash-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-dash-panel") !== tab; });
      if (builders[tab] && !made[tab]) { made[tab] = true; builders[tab]($('[data-dash-panel="' + tab + '"]')); }
      try { history.replaceState(null, "", "#" + tab); } catch (e) {}
    }
    root.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) show(b.getAttribute("data-tab")); });
    var start = (location.hash || "").slice(1);
    show(tabs.some(function (t) { return t[0] === start; }) ? start : "bookings");
  }

  function boot() {
    [["[data-club]", renderClub], ["[data-f1]", renderF1], ["[data-matchboard]", renderMatchBoard], ["[data-predictor]", renderPredictor], ["[data-songs]", renderSongs],
      ["[data-creator-form]", renderCreatorForm], ["[data-dash-nav]", renderDashNav]
    ].forEach(function (r) { $$(r[0]).forEach(function (el) { try { r[1](el); } catch (err) { if (window.console) console.error(err); } }); });
  }
  window.ABK_GROW = { call: call, posterData: posterData, drawPoster: drawPoster, loadImg: loadImg, fontsFor: fontsFor, sampleFixtures: sampleFixtures };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
