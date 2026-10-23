/* Booking tracker: works out where each visitor came from (an ad, Instagram, Google, a QR code)
   and counts every WhatsApp booking the site opens, by source.
   - Ads and QR codes link with ?src=... (see data.js > track.sources); otherwise the referrer decides.
   - The first source is remembered for 30 days, so a visitor who comes back later still counts for the ad.
   - Each booking adds a "via ..." line to the WhatsApp message, so the team sees the source too.
   - Events are kept on this device, and once the server is on (data.js > api), bookings, deposits and vouchers
     go to its booking counter too (source, night, guests and amount only), so the dashboard counts every phone. */
(function () {
  "use strict";
  var D = window.ABK_DATA || {}, T = D.track || { sources: {} };
  var KEY_SRC = "abk_src", KEY_EV = "abk_events", DAY = 864e5;
  /* the booking counter: on the server (data.js > api), or a separate address (data.js > track.endpoint) */
  var EP = T.endpoint || (D.api ? D.api.replace(/\/$/, "") + "/api/track" : "");
  /* bookings count on the server; deposits and vouchers only once payments are real, not the practice checkout */
  function counted(ev) { return ev.type === "whatsapp" || ((ev.type === "voucher" || ev.type === "deposit") && !(D.payments && D.payments.mode === "demo")); }

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function fromUrl() {
    var q = new URLSearchParams(location.search);
    var s = q.get("src") || q.get("utm_source");
    if (!s) return null;
    s = s.toLowerCase();
    var med = (q.get("utm_medium") || "").toLowerCase();
    if (/^(ig|instagram)$/.test(s)) s = /paid|cpc|ads?/.test(med) ? "ig-ad" : "instagram";
    if (/^(fb|facebook)$/.test(s)) s = /paid|cpc|ads?/.test(med) ? "ig-ad" : "facebook";
    if (s === "google" && /paid|cpc|ads?/.test(med)) s = "google-ads";
    return { src: s, campaign: q.get("c") || q.get("utm_campaign") || "" };
  }
  function fromReferrer() {
    var r = document.referrer || "";
    if (!r || r.indexOf(location.host) > -1 && location.host) return null;
    if (/instagram\.com/.test(r)) return { src: "instagram" };
    if (/facebook\.com|fb\.me/.test(r)) return { src: "facebook" };
    if (/google\./.test(r)) return { src: "google" };
    if (/whatsapp|wa\.me/.test(r)) return { src: "whatsapp" };
    return null;
  }
  /* first touch wins for 30 days; a new ad click replaces it */
  var stored = null;
  try { stored = JSON.parse(ls(KEY_SRC) || "null"); } catch (e) { stored = null; }
  if (stored && Date.now() - stored.at > 30 * DAY) stored = null;
  var now = fromUrl() || (!stored && fromReferrer());
  if (now) { stored = { src: now.src, campaign: now.campaign || "", at: Date.now() }; ls(KEY_SRC, JSON.stringify(stored)); }
  var current = stored || { src: "direct", campaign: "" };

  function label(src) { return (T.sources && T.sources[src]) || src.replace(/-/g, " "); }

  function events() { try { return JSON.parse(ls(KEY_EV) || "[]"); } catch (e) { return []; } }
  function log(type, data) {
    var ev = { t: new Date().toISOString(), type: type, src: current.src, campaign: current.campaign, page: location.pathname.split("/").pop() || "index.html" };
    Object.keys(data || {}).forEach(function (k) { ev[k] = data[k]; });
    var list = events(); list.push(ev); if (list.length > 500) list = list.slice(-500);
    ls(KEY_EV, JSON.stringify(list));
    if (EP && counted(ev)) {
      try { navigator.sendBeacon(EP, JSON.stringify(ev)); } catch (e) { /* the counter is offline: the booking still goes through */ }
    }
    return ev;
  }

  /* every WhatsApp booking the site opens passes through window.open: count it, and tag the message with its source */
  function parse(text) {
    var g = /Guests?: ([^\n]+)/.exec(text), f = /For: ([^\n]+)/.exec(text), d = /Date: ([^\n]+)/.exec(text), p = /Package: ([^\n]+)/.exec(text);
    var type = /book a table|booking/i.test(text) ? "booking" : /watch /i.test(text) ? "booking" : /voucher/i.test(text) ? "voucher" : /deposit/i.test(text) ? "deposit" : "enquiry";
    return { kind: type, guests: g ? parseInt(g[1], 10) || 0 : 0, event: f ? f[1] : (p ? p[1] : ""), date: d ? d[1] : "" };
  }
  var open = window.open;
  window.open = function (url) {
    var args = Array.prototype.slice.call(arguments);
    if (typeof url === "string" && /^https:\/\/wa\.me\/\d+/.test(url)) {
      var u = new URL(url), text = u.searchParams.get("text") || "";
      var info = parse(text);
      log("whatsapp", info);
      if (current.src !== "direct" && text.indexOf("(via ") === -1) {
        u.searchParams.set("text", text + "\n(via " + label(current.src) + (current.campaign ? ", " + current.campaign : "") + ")");
        args[0] = u.toString();
      }
    }
    return open.apply(window, args);
  };
  /* plain WhatsApp links (header, footer, buttons) count as enquiries */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (!a) return;
    var u = new URL(a.href), text = u.searchParams.get("text") || "";
    log("whatsapp", parse(text));
    if (current.src !== "direct" && text.indexOf("(via ") === -1) {
      u.searchParams.set("text", text + "\n(via " + label(current.src) + ")");
      a.href = u.toString();
    }
  }, true);

  window.ABK_TRACK = { source: function () { return current; }, label: label, log: log, events: events };
})();
