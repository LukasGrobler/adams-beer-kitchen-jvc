/* Adam's Beer Kitchen JVC: everything the site shows lives here.
   Update a price or a time here and every page follows.
   Days: 0 Sunday, 1 Monday, ... 6 Saturday. Times are Dubai time, 24h. */

window.ABK_DATA = {
  venue: {
    name: "Adam's Beer Kitchen",
    branch: "JVC",
    full: "Adam's Beer Kitchen JVC",
    phone: "+971543068854",
    phoneDisplay: "+971 54 306 8854",
    whatsapp: "971543068854",
    address: ["Floor 1, HE Hotel Apartments", "Assel Boulevard, Al Barsha South Fourth", "Jumeirah Village Circle (JVC), Dubai"],
    landmarks: "close to Binghatti Galaxy and Binghatti Phantom",
    plusCode: "3668+3Q Dubai",
    google: { rating: "4.7", count: 115 },
    addressLine: "Floor 1, HE Hotel Apartments, Assel Boulevard, Jumeirah Village Circle, Dubai",
    maps: "https://www.google.com/maps/place/Adams+Beer+Kitchen+JVC/data=!4m2!3m1!1s0x0:0xbb22cb6ce9d9866",
    mapEmbed: "https://www.google.com/maps?q=Adam%27s+Beer+Kitchen+HE+Hotel+Apartments+JVC+Dubai&output=embed",
    reviewUrl: "https://www.google.com/maps/place/Adams+Beer+Kitchen+JVC/data=!4m2!3m1!1s0x0:0xbb22cb6ce9d9866",
    instagram: "https://www.instagram.com/abk_jvc/",
    handle: "@abk_jvc",
    opens: "12:00",
    closes: "03:00",
    happyHour: { 0: ["12:00", "21:00"], 1: ["12:00", "21:00"], 2: ["12:00", "21:00"], 3: ["12:00", "21:00"], 4: ["12:00", "21:00"], 5: ["12:00", "19:00"], 6: ["12:00", "19:00"] }
  },

  artists: {
    "itsdylanlive": { name: "ItsDylanLive", role: "Quiz host", initials: "DL" },
    "joe-david": { name: "Joe & David", role: "Live duo", initials: "J&D" },
    "fergal": { name: "Fergal O'Neill", role: "Live music", initials: "FO" },
    "jen": { name: "Jen Kusch", role: "Karaoke host", initials: "JK" },
    "david": { name: "David Bracken", role: "Live music", initials: "DB" },
    "lee": { name: "Lee Wall", role: "Live music", initials: "LW" }
  },

  /* Weekly events. "slots" drive the chalkboard, the calendar files and the booking form. */
  events: [
    {
      slug: "monday-50-off", days: [1], dayLabel: "Every Monday",
      name: "50% Off Mondays", with: "For cabin crew, teachers and hoteliers",
      cats: ["deals"], img: "post-6",
      short: "Half off the food and drinks menus, 9PM till close.",
      intro: "You spend all week looking after everyone else. On Monday nights we return the favour: half off the food menu and the drinks menu for cabin crew, teachers and hoteliers.",
      facts: [["When", "9PM till close"], ["Discount", "50% off food & drinks"], ["Who", "Cabin crew, teachers, hoteliers"]],
      slots: [{ label: "50% off for cabin crew, teachers & hoteliers", start: "21:00", end: "03:00" }],
      week: { title: "50% off", lines: [["9PM till close", "Half off food & drinks"], ["For", "Cabin crew, teachers, hoteliers"]] }
    },
    {
      slug: "quiz-night", days: [2], dayLabel: "Every Tuesday",
      name: "Quiz Night", with: "with ItsDylanLive",
      cats: ["quiz", "drinks"], img: "post-8", img2: "post-5",
      short: "Teams, trivia and prizes up to AED 2,000.",
      intro: "Round up your cleverest friends, plus the one who knows football. ItsDylanLive asks the questions, you argue over the answers, and the winning team walks away with prizes worth up to AED 2,000.",
      facts: [["Quiz", "7PM – 9:30PM"], ["Prizes", "Up to AED 2,000"], ["Drunch", "7PM – 10PM"]],
      packages: [{ name: "Quiz Drunch", time: "7PM – 10PM", house: 189, premium: 239 }],
      lineup: [{ who: "itsdylanlive", time: "7PM – 9:30PM" }],
      slots: [{ label: "Quiz Night with ItsDylanLive", start: "19:00", end: "21:30" }, { label: "Quiz Drunch", start: "19:00", end: "22:00", price: "AED 189 / 239" }],
      hallOfFame: true,
      week: { title: "Quiz night", lines: [["7PM – 9:30PM", "Hosted by ItsDylanLive"], ["Prizes", "Up to AED 2,000"], ["Drunch", "7PM – 10PM, AED 189 / 239"]] }
    },
    {
      slug: "ladies-night", days: [3], dayLabel: "Every Wednesday",
      name: "Ladies Night", with: "Live music with Joe & David",
      cats: ["drinks", "music"], img: "post-12", img2: "post-5",
      short: "Ladies from AED 99, lads from AED 149, mixed bites platter included.",
      intro: "Wednesday belongs to the ladies. The lads are welcome too, at lads' prices. Every package comes with a mixed bites platter, and Joe & David play from 8PM.",
      facts: [["Live music", "8PM – 11PM"], ["Ladies", "From AED 99"], ["Lads", "From AED 149"]],
      packages: [{ name: "Ladies", time: "Mixed bites platter included", house: 99, premium: 129 }, { name: "Lads", time: "Mixed bites platter included", house: 149, premium: 199 }],
      lineup: [{ who: "joe-david", time: "8PM – 11PM" }],
      slots: [{ label: "Ladies Night", start: "20:00", end: "23:00", price: "Ladies AED 99 / 129" }, { label: "Joe & David live", start: "20:00", end: "23:00" }],
      week: { title: "Ladies night", lines: [["Ladies", "AED 99 / 129"], ["Lads", "AED 149 / 199"], ["8PM – 11PM", "Live: Joe & David"]] }
    },
    {
      slug: "steak-night", days: [4], dayLabel: "Every Thursday",
      name: "Steak Night", with: "and Thirsty Thursdays",
      cats: ["food", "drinks", "music"], img: "post-3",
      short: "250g rib-eye, fries and two house drinks for AED 199.",
      intro: "A 250g rib-eye with fries and two house beers or house wines for AED 199. If you would rather keep the drinks flowing, Thirsty Thursdays drunch runs 7PM to 11PM, and Fergal O'Neill is on from 8PM.",
      facts: [["Steak deal", "AED 199"], ["Drunch", "7PM – 11PM"], ["Live music", "8PM – 11PM"]],
      deal: { title: "250g rib-eye, fries and 2 house beers or house wines", price: 199 },
      packages: [{ name: "Thirsty Thursdays Drunch", time: "7PM – 11PM", house: 199, premium: 249 }],
      lineup: [{ who: "fergal", time: "8PM – 11PM" }],
      slots: [{ label: "Steak Night", start: "19:00", end: "23:00", price: "AED 199" }, { label: "Thirsty Thursdays Drunch", start: "19:00", end: "23:00", price: "AED 199 / 249" }, { label: "Fergal O'Neill live", start: "20:00", end: "23:00" }],
      week: { title: "Steak night", lines: [["AED 199", "250g rib-eye, fries + 2 house drinks"], ["Drunch", "7PM – 11PM, AED 199 / 249"], ["8PM – 11PM", "Live: Fergal O'Neill"]] }
    },
    {
      slug: "teachers-brunch", days: [5], dayLabel: "Every Friday",
      name: "Teachers' Brunch", with: "School's out, brunch is in",
      cats: ["drinks"], img: "post-7",
      short: "Brunch 1PM – 5PM from AED 149, drunch 5PM – 9PM from AED 199.",
      intro: "The bell has gone and the marking can wait. Teachers' Brunch runs 1PM to 5PM, and for the ones who aren't done yet, Teachers Drunch picks up from 5PM till 9PM.",
      facts: [["Brunch", "1PM – 5PM"], ["Drunch", "5PM – 9PM"], ["From", "AED 149"]],
      packages: [{ name: "Teachers' Brunch", time: "1PM – 5PM", house: 149, premium: 179 }, { name: "Teachers Drunch", time: "5PM – 9PM", house: 199, premium: 249 }],
      slots: [{ label: "Teachers' Brunch", start: "13:00", end: "17:00", price: "AED 149 / 179" }, { label: "Teachers Drunch", start: "17:00", end: "21:00", price: "AED 199 / 249" }]
    },
    {
      slug: "fuel-up-friday", days: [5], dayLabel: "Every Friday",
      name: "Friday Fuel Up", with: "Unlimited drinks packages with a food platter",
      cats: ["drinks", "food"], img: "post-5",
      short: "4PM – 8PM, AED 229 / 279 with a food platter.",
      intro: "Four hours of unlimited drinks packages and a food platter to keep you upright. Consider it fuel for the weekend.",
      facts: [["When", "4PM – 8PM"], ["House", "AED 229"], ["Premium", "AED 279"]],
      packages: [{ name: "Fuel Up Brunch", time: "4PM – 8PM, food platter included", house: 229, premium: 279 }],
      slots: [{ label: "Friday Fuel Up", start: "16:00", end: "20:00", price: "AED 229 / 279" }]
    },
    {
      slug: "karaoke-night", days: [5], dayLabel: "Every Friday",
      name: "Karaoke Night", with: "with Jen Kusch",
      cats: ["quiz", "music", "drinks"], img: "post-1",
      short: "Karaoke 8PM – 11PM, Fergal O'Neill live till 2AM.",
      intro: "The mic is yours from 8PM, with Jen Kusch running the show. Late Night Drunch keeps going till midnight, then Fergal O'Neill takes over until 2AM.",
      facts: [["Karaoke", "8PM – 11PM"], ["Late drunch", "8PM – 12AM"], ["Live music", "11PM – 2AM"]],
      packages: [{ name: "Late Night Drunch", time: "8PM – 12AM", house: 199, premium: 249 }],
      lineup: [{ who: "jen", time: "8PM – 11PM" }, { who: "fergal", time: "11PM – 2AM" }],
      slots: [{ label: "Karaoke with Jen Kusch", start: "20:00", end: "23:00" }, { label: "Late Night Drunch", start: "20:00", end: "00:00", price: "AED 199 / 249" }, { label: "Fergal O'Neill live", start: "23:00", end: "02:00" }]
    },
    {
      slug: "smoking-saturdays", days: [6], dayLabel: "Every Saturday",
      name: "Smoking Saturdays", with: "Live BBQ brunch and two live sets",
      cats: ["food", "drinks", "music"], img: "post-10",
      short: "BBQ brunch 3PM – 7PM, drunch 7PM – 10PM, live music all evening.",
      intro: "The BBQ gets lit at 3PM and Fergal O'Neill plays through the brunch. Saturday Drunch follows from 7PM, then David Bracken closes the night out from 9PM.",
      facts: [["BBQ brunch", "3PM – 7PM"], ["Drunch", "7PM – 10PM"], ["Live music", "4PM – 12AM"]],
      packages: [{ name: "BBQ Brunch", time: "3PM – 7PM", house: 229, premium: 279 }, { name: "Saturday Drunch", time: "7PM – 10PM", house: 199, premium: 249 }],
      lineup: [{ who: "fergal", time: "4PM – 7PM" }, { who: "david", time: "9PM – 12AM" }],
      slots: [{ label: "Smoking Saturdays BBQ Brunch", start: "15:00", end: "19:00", price: "AED 229 / 279" }, { label: "Fergal O'Neill live", start: "16:00", end: "19:00" }, { label: "Saturday Drunch", start: "19:00", end: "22:00", price: "AED 199 / 249" }, { label: "David Bracken live", start: "21:00", end: "00:00" }],
      week: { title: "Smoking Saturdays", lines: [["3PM – 7PM", "BBQ brunch, AED 229 / 279"], ["7PM – 10PM", "Drunch, AED 199 / 249"], ["Live", "Fergal O'Neill, David Bracken"]] }
    },
    {
      slug: "sunday-social", days: [0], dayLabel: "Every Sunday",
      name: "Sunday Social", with: "Full roast buffet from AED 99",
      cats: ["food", "drinks", "music"], img: "post-9",
      short: "Roast buffet 1PM – 8PM, Sunday Drunch 5PM – 8PM, Lee Wall live from 8PM.",
      intro: "A proper roast buffet for AED 99, served 1PM to 8PM. Add two house drinks for AED 129, or two pints of Guinness for AED 149. Sunday Drunch runs 5PM to 8PM, and Lee Wall plays you into the new week.",
      facts: [["Roast buffet", "1PM – 8PM"], ["From", "AED 99"], ["Live music", "8PM – 11PM"]],
      deals: [["Full roast buffet", 99], ["Roast + 2 house drinks", 129], ["Roast + 2 Guinness", 149]],
      packages: [{ name: "Sunday Drunch", time: "5PM – 8PM", house: 179, premium: 229 }],
      lineup: [{ who: "lee", time: "8PM – 11PM" }],
      slots: [{ label: "Sunday roast buffet", start: "13:00", end: "20:00", price: "From AED 99" }, { label: "Sunday Drunch", start: "17:00", end: "20:00", price: "AED 179 / 229" }, { label: "Lee Wall live", start: "20:00", end: "23:00" }],
      week: { title: "Sunday social", lines: [["1PM – 8PM", "Roast buffet, AED 99"], ["Drunch", "5PM – 8PM, AED 179 / 229"], ["8PM – 11PM", "Live: Lee Wall"]] }
    }
  ],

  /* Tonight takeover: on each day the homepage headline becomes that day's main event. */
  takeover: {
    1: { slug: "monday-50-off", lines: ["50% off", "Mondays"], sub: "Half off food and drinks for cabin crew, teachers and hoteliers, from 9PM till close." },
    2: { slug: "quiz-night", lines: ["Quiz", "night"], sub: "With ItsDylanLive. Prizes up to AED 2,000, and quiz drunch from AED 189." },
    3: { slug: "ladies-night", lines: ["Ladies", "night"], sub: "Ladies from AED 99 with a mixed bites platter, and Joe & David live from 8PM." },
    4: { slug: "steak-night", lines: ["Steak", "night"], sub: "A 250g rib-eye, fries and two house drinks for AED 199, with Fergal O'Neill live from 8PM." },
    5: { slug: "karaoke-night", lines: ["Big", "Friday"], sub: "Teachers' brunch from 1PM, Fuel Up at 4PM, karaoke at 8PM and Fergal O'Neill till 2AM.", start: "13:00", end: "02:00", link: "whats-on.html#day-5" },
    6: { slug: "smoking-saturdays", lines: ["Smoking", "Saturdays"], sub: "Live BBQ brunch from 3PM, drunch from 7PM and live music all evening." },
    0: { slug: "sunday-social", lines: ["Sunday", "roast"], sub: "The full roast buffet from AED 99, 1PM to 8PM, then Lee Wall live from 8PM." }
  },

  /* Friday has three events; the week scroller shows them as one night. */
  fridayWeek: { title: "Big Friday", img: "post-1", link: "karaoke-night", lines: [["1PM – 9PM", "Teachers' brunch & drunch"], ["4PM – 8PM", "Friday Fuel Up, AED 229 / 279"], ["8PM – 11PM", "Karaoke with Jen Kusch"], ["11PM – 2AM", "Live: Fergal O'Neill"]] },

  offers: [
    {
      slug: "happy-hour", name: "Happy Hour", with: "Every single day", cats: ["deals"], img: "post-12",
      dayLabel: "Every day",
      short: "Sunday – Thursday till 9PM, Friday & Saturday till 7PM.",
      intro: "The best hours of the day, priced accordingly. Happy Hour starts the moment the doors open and runs till 9PM Sunday to Thursday, and till 7PM on Friday and Saturday.",
      facts: [["Sun – Thu", "12PM – 9PM"], ["Fri – Sat", "12PM – 7PM"], ["Where", "Whole venue"]]
    },
    {
      slug: "tower-up", name: "Tower Up Your Day", with: "3.5L beer tower + bites platter", cats: ["deals", "drinks"], img: "post-1",
      dayLabel: "Any day",
      short: "A 3.5 litre tower of select beer with a bites platter, AED 179.",
      intro: "A 3.5 litre tower of select beer and a bites platter, for AED 179. Built for sharing, so bring the group.",
      facts: [["Tower", "3.5 litres of select beer"], ["Plus", "Bites platter"], ["Price", "AED 179"]]
    }
  ],

  specials: [
    {
      slug: "mid-term-mayhem", name: "Mid-Term Mayhem", with: "Family-friendly packages for the mid-term break",
      from: "2026-10-10", to: "2026-10-18", when: "10 – 18 October", img: "post-2",
      short: "Packs of 4 vouchers from AED 279. Kids under 12 eat free.",
      intro: "Make the most of the mid-term break. Buy a pack of four vouchers and use them any time between 10 and 18 October. Kids under 12 eat free.",
      vouchers: [["4 vouchers: 1 starter + 1 select main + 1 pint", 349], ["4 vouchers: 1 starter + 1 select main + 2 pints", 399], ["4 vouchers: 1 select main + 1 select pint", 279]],
      fine: "All vouchers can be redeemed throughout the mid-term break. Terms and conditions apply."
    },
    {
      slug: "halloween-week", name: "Halloween Week", with: "Two house drinks and a main course",
      from: "2026-10-25", to: "2026-10-31", when: "Late October, dates to be confirmed", img: null,
      short: "Two house drinks and a main course, price to be announced.",
      intro: "Two house drinks and a main course for one spooky price. Costumes are encouraged, though not compulsory. Dates and price coming soon.",
      vouchers: [["2 house drinks + a main course", "TBC"]],
      fine: "Dates and price to be confirmed."
    }
  ],

  /* Real Google reviews (supplied by the venue's Google page). Names shortened. */
  reviews: [
    { name: "Owais I.", meta: "Local Guide", text: "Absolutely fantastic experience! The place looks amazing, and the food tastes even better. A special shoutout to Leo for the warm hospitality, he really made us feel welcome. Being within walking distance from home makes it even better. Highly recommended!" },
    { name: "I.M.", meta: "Local Guide", text: "Every dish was full of flavor, fresh, and beautifully served. The cocktails were also excellent, perfectly made and genuinely enjoyable. What impressed me even more were the prices — honestly, I was shocked at how reasonable they were for such quality. … Rahul, our waiter, was simply amazing.", featured: true },
    { name: "Khaldoun S.", meta: "Local Guide", text: "Quite lovely cozy place, friendly team and good outdoor space, affordable price and many more. Highly recommended." },
    { name: "Omar A.", meta: "Google review", text: "A wonderful and elegant place, excellent and varied food, and a large selection of beers. I highly recommend trying it." },
    { name: "Maychelle A.", meta: "Google review", text: "Check out this newly opened bar in JVC, great ambience, delicious food and amazing service by Rose!" }
  ],

  /* SAMPLE: names come from guest reviews; roles and lines to be confirmed with the team. */
  crew: [
    { name: "Leo", role: "Manager", initials: "L", line: "Guests mention him by name in their reviews. Ask for Leo and he'll find you the best table in the house." },
    { name: "Rahul", role: "Floor team", initials: "R", line: "“Simply amazing”, according to one very happy Google reviewer. Fastest refill in JVC." },
    { name: "Rose", role: "Floor team", initials: "R", line: "Another name guests remember. Knows exactly which seat has the best view of the screens." },
    { name: "The kitchen", role: "Back of house", initials: "K", line: "Responsible for the rib-eye, the Sunday roast and the gravy. Mostly the gravy." }
  ],

  /* SAMPLE quiz winners, replaced every Tuesday once live. */
  hallOfFame: [
    ["6 Oct 2026", "Quiz Team Aguilera"],
    ["29 Sep 2026", "Les Quizérables"],
    ["22 Sep 2026", "The Hoppy Campers"],
    ["15 Sep 2026", "Pint of No Return"],
    ["8 Sep 2026", "Universally Challenged"],
    ["1 Sep 2026", "Know It Ales"]
  ],

  gallery: [
    { img: "post-12", cap: "Wednesday well spent" },
    { img: "post-3", cap: "Steak night, no regrets" },
    { img: "post-8", cap: "Quiz night champions" },
    { img: "post-10", cap: "Live music, Saturday evening" },
    { img: "post-1", cap: "Booths, screens and a seat with your name on it" },
    { img: "post-9", cap: "Two pints of the black stuff" },
    { img: "post-6", cap: "50% off Mondays, out on the terrace" },
    { img: "post-5", cap: "The quiz night platter" },
    { img: "post-11", cap: "Premier League returns" },
    { img: "post-7", cap: "Terrace season" },
    { img: "post-2", cap: "Mid-Term Mayhem, 10 – 18 October" },
    { img: "post-4", cap: "GAA tournament after party" }
  ],

  /* Menus open here once the venue sends the PDFs. */
  menus: { food: "assets/menus/room-service-menu.pdf", drinks: null, roomService: "assets/menus/room-service-menu.pdf" },

  /* The full menu (from the venue's current menu PDF), so Adam can answer price questions. [name, details, AED, search words] */
  menuItems: [
    ["Kale & quinoa salad", "Add chicken (AED 20), salmon (AED 25) or shrimps (AED 22)", 68, "salad kale quinoa vegetarian healthy"],
    ["Classic Caesar salad", "Add chicken (AED 20), salmon (AED 25) or shrimps (AED 22)", 55, "salad caesar"],
    ["Cheeseburger", "Beef or chicken", 99, "burger cheeseburger beef"],
    ["Sliders", "Beef or chicken", 70, "sliders burger mini"],
    ["Chicken fillet roll", "", 65, "chicken roll wrap sandwich"],
    ["Rustic steak sandwich", "", 95, "steak sandwich"],
    ["Club sandwich", "", 65, "club sandwich"],
    ["Snack meal box", "2 chicken sliders, 6 BBQ wings, truffle fries, 6 jalapeño poppers", 90, "snack box wings fries poppers sharing"],
    ["Pasta arrabbiata", "Penne, spicy tomato sauce, shrimps, garlic bread", 70, "pasta penne arrabbiata shrimp"],
    ["Pasta Alfredo", "Fettuccine, creamy sauce, grilled chicken, garlic bread", 80, "pasta alfredo fettuccine chicken"],
    ["Pizza Margherita", "", 60, "pizza margherita vegetarian"],
    ["Pizza pepperoni", "", 70, "pizza pepperoni"],
    ["Pizza supreme", "Peppers, aubergine, olives, mushroom, shredded chicken", 90, "pizza supreme"],
    ["US Prime Angus ribeye", "Mashed potato, sautéed vegetables, herbed butter sauce", 210, "steak ribeye rib-eye beef angus"],
    ["Lamb chops", "Thick-cut fries, green salad, mint pepper sauce", 180, "lamb chops"],
    ["Grilled salmon", "Lemon butter sauce, rice, sautéed vegetables", 145, "salmon fish"],
    ["Beef stew", "Mashed potato, garlic bread", 110, "beef stew"],
    ["Butter chicken", "Rice, papad, pickle, fresh salad", 90, "butter chicken curry indian"],
    ["Lava cake", "", 60, "dessert lava cake chocolate"],
    ["Apple crumble", "", 60, "dessert apple crumble"],
    ["Fruit bowl", "", 58, "dessert fruit healthy"]
  ],

  /* A taste of the menu, from the venue's current menu PDF. */
  dishes: [
    ["US Prime Angus ribeye", "Mashed potato, sautéed vegetables, herbed butter sauce", 210],
    ["Lamb chops", "Thick-cut fries, green salad, mint pepper sauce", 180],
    ["Grilled salmon", "Lemon butter sauce, rice, sautéed vegetables", 145],
    ["Beef stew", "Mashed potato, garlic bread", 110],
    ["Cheeseburger", "Beef or chicken", 99],
    ["Rustic steak sandwich", "", 95],
    ["Snack meal box", "2 chicken sliders, 6 BBQ wings, truffle fries, 6 jalapeño poppers", 90],
    ["Butter chicken", "Rice, papad, pickle, fresh salad", 90],
    ["Pizza supreme", "Peppers, aubergine, olives, mushroom, shredded chicken", 90],
    ["Kale & quinoa salad", "Add chicken, salmon or shrimps", 68],
    ["Lava cake", "", 60],
    ["Apple crumble", "", 60]
  ],

  /* ===================== v2 additions (18 October 2026) ===================== */

  /* Where bookings come from. Each ad or QR code links with ?src=..., so every WhatsApp booking is counted by source.
     endpoint: the booking counter's web address once it's live (empty = demo, kept on this device). */
  track: {
    endpoint: "",
    sources: {
      instagram: "Instagram", "ig-ad": "Instagram ads", google: "Google search", "google-ads": "Google ads",
      "qr-table": "QR on the tables", "qr-hotel": "QR in HE Hotel", whatsapp: "WhatsApp broadcast", facebook: "Facebook", direct: "Direct and other"
    }
  },

  /* Payments for deposits and vouchers. mode "demo" shows a practice checkout (no card is charged);
     at launch it becomes "links", with one payment link per item from the venue's payment provider. */
  payments: { mode: "demo", provider: "Card or Apple Pay", links: {} },

  /* Campaign landing pages for ads. SAMPLE packages and prices, to confirm with the venue. */
  campaigns: [
    {
      slug: "christmas-parties", name: "Christmas parties", season: "1 – 24 December 2026", img: "post-1", src: "ig-ad",
      title: ["Christmas", "parties"], hook: "Office parties, friends' nights out and family get-togethers, in a pub that already has the screens, the booths and the private area.",
      from: "2026-12-01", to: "2026-12-24", groupMin: 8,
      packages: [
        { id: "xmas-feast", name: "Festive feast", note: "Three-course festive menu with 2 house drinks", price: 199, deposit: 50 },
        { id: "xmas-party", name: "Party package", note: "Sharing platters and 3 hours of house drinks", price: 249, deposit: 75 },
        { id: "xmas-premium", name: "Premium party", note: "Platters, carvery station and 3 hours of premium drinks", price: 329, deposit: 100 }
      ],
      perks: ["Private area for groups of 15 – 40", "Big screens for your slides or the match", "A deposit locks the date, so it's yours", "Free table for the organiser's birthday month"]
    },
    {
      slug: "new-years-eve", name: "New Year's Eve", season: "Thursday 31 December 2026", img: "post-12", src: "ig-ad",
      title: ["New Year's", "Eve"], hook: "Live music, a countdown on every screen and a package that runs right through midnight.",
      from: "2026-12-31", to: "2026-12-31", groupMin: 2,
      packages: [
        { id: "nye-house", name: "House package", note: "9PM – 1AM, house drinks, bites platter and the countdown", price: 299, deposit: 299 },
        { id: "nye-premium", name: "Premium package", note: "9PM – 1AM, premium drinks, sharing platters and a reserved table", price: 399, deposit: 399 }
      ],
      perks: ["Live band from 9PM", "Countdown on every screen", "Reserved table for your group", "Paid in full to secure the table"]
    },
    {
      slug: "match-day-tables", name: "Match-day tables", season: "Every Premier League weekend", img: "post-11", src: "google-ads",
      title: ["Match", "day"], hook: "Every Premier League game on the big screens, with a table saved for you and your mates.",
      from: "2026-10-01", to: "2027-05-31", groupMin: 2,
      packages: [
        { id: "match-bucket", name: "Bucket and bites", note: "5 select beers and a bites platter for the table", price: 199, deposit: 0 },
        { id: "match-tower", name: "Tower up", note: "3.5L beer tower and a bites platter", price: 179, deposit: 0 }
      ],
      perks: ["A table facing the screens", "Darts and pool for half-time", "Happy hour till 7PM on Fri and Sat", "Free to book, no deposit"]
    }
  ],

  /* Gift vouchers. SAMPLE values, to confirm with the venue. */
  vouchers: [
    { id: "roast-2", name: "Sunday roast for two", note: "Two roast buffets on any Sunday", price: 198, img: "post-9" },
    { id: "steak-2", name: "Steak night for two", note: "Two 250g rib-eyes with fries and 2 house drinks each", price: 398, img: "post-3" },
    { id: "tower", name: "Tower and bites", note: "A 3.5L beer tower with a bites platter", price: 179, img: "post-1" },
    { id: "credit-250", name: "AED 250 credit", note: "Spend it on anything, any day", price: 250, img: "post-5" },
    { id: "credit-500", name: "AED 500 credit", note: "Spend it on anything, any day", price: 500, img: "post-12" }
  ],

  /* Where you can sit. Zones on the floor plan in the booking form; the layout is a sketch, to confirm with the venue. */
  zones: [
    { id: "booths", name: "Booths", note: "Cosy, seats 4 – 6", seat: "Booth" },
    { id: "screens", name: "By the big screens", note: "Best for the match", seat: "Near the big screens" },
    { id: "bar", name: "High tables by the bar", note: "Quick service, great buzz", seat: "High table by the bar" },
    { id: "games", name: "Darts and pool", note: "Settle it the old way", seat: "Near the darts and pool" },
    { id: "terrace", name: "Terrace", note: "Fresh air, covered", seat: "Outdoor terrace" },
    { id: "private", name: "Private area", note: "Groups of 15 – 40", seat: "Private area (groups)" }
  ],

  /* Quiz league: points per week (1st 10, 2nd 8, 3rd 6, 4th 5, then 4, 3, 2, 1 for taking part). SAMPLE season, to confirm. */
  league: {
    season: "Autumn league 2026", weeks: ["8 Sep", "15 Sep", "22 Sep", "29 Sep", "6 Oct", "13 Oct"], prize: "AED 2,000 in prizes at the season final, 15 December",
    teams: [
      { name: "Quiz Team Aguilera", pts: [6, 8, 5, 8, 10, 6] },
      { name: "Les Quizérables", pts: [8, 5, 6, 10, 8, 5] },
      { name: "The Hoppy Campers", pts: [5, 6, 10, 6, 5, 8] },
      { name: "Pint of No Return", pts: [4, 10, 8, 5, 6, 4] },
      { name: "Universally Challenged", pts: [10, 4, 4, 4, 4, 10] },
      { name: "Know It Ales", pts: [3, 3, 3, 3, 3, 3] },
      { name: "JVC Brainiacs", pts: [2, 2, 1, 2, 2, 2] },
      { name: "Circle of Trust", pts: [1, 1, 2, 1, 1, 1] }
    ]
  },

  /* Real AI for Adam. endpoint: the web address of the small server that talks to Claude (empty = Adam answers from the schedule as before). */
  ai: { endpoint: "", languages: ["English", "Arabic", "Russian"] }
};
