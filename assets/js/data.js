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
    groupMax: 40, /* the biggest group that can book online; bigger groups are asked to call the team */
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
      slug: "monday-20-off", days: [1], dayLabel: "Every Monday",
      name: "20% Off Mondays", with: "For cabin crew, teachers and hoteliers",
      cats: ["deals"], img: "monday-20-off", weekImg: "monday-20-off-wide",
      short: "20% off the food and drinks menus, 9PM till close.",
      intro: "You spend all week looking after everyone else. On Monday nights we return the favour: 20% off the food menu and the drinks menu for cabin crew, teachers and hoteliers.",
      facts: [["When", "9PM till close"], ["Discount", "20% off food & drinks"], ["Who", "Cabin crew, teachers, hoteliers"]],
      slots: [{ label: "20% off for cabin crew, teachers & hoteliers", start: "21:00", end: "03:00" }],
      week: { title: "20% off", lines: [["9PM till close", "20% off food & drinks"], ["For", "Cabin crew, teachers, hoteliers"]] }
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
      cats: ["drinks"], img: "teachers-brunch",
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
      cats: ["food", "drinks", "music"], img: "smoking-saturdays", weekImg: "post-10", /* the venue's poster on its page; a photo on the homepage week */
      short: "BBQ brunch 3PM – 7PM, drunch 7PM – 10PM, live music all evening.",
      intro: "The BBQ gets lit at 3PM and Fergal O'Neill plays through the brunch. Saturday Drunch follows from 7PM, then David Bracken closes the night out from 9PM.",
      facts: [["BBQ brunch", "3PM – 7PM"], ["Drunch", "7PM – 10PM"], ["Live music", "3PM – 12AM"]],
      packages: [{ name: "BBQ Brunch", time: "3PM – 7PM", house: 229, premium: 279 }, { name: "Saturday Drunch", time: "7PM – 10PM", house: 199, premium: 249 }],
      lineup: [{ who: "fergal", time: "3PM – 6PM" }, { who: "david", time: "9PM – 12AM" }],
      img2: "smoking-saturdays-menu", menuTitle: "The BBQ brunch menu",
      menu: [
        { name: "Pick your starter", items: ["Jalapeño poppers", "BBQ chicken wings", "Chicken tenders", "Onion rings", "Solo nacho with guacamole, salsa and sour cream"] },
        { name: "Mixed BBQ platter", items: ["Shish tawook chicken", "Grilled salmon", "Grilled jumbo prawns", "Rib-eye steak"], note: "Served with fresh salad and your choice of sauce: hummus, blue cheese, tartar, pepper mint or garlic mayo." }
      ],
      slots: [{ label: "Smoking Saturdays BBQ Brunch", start: "15:00", end: "19:00", price: "AED 229 / 279" }, { label: "Fergal O'Neill live", start: "15:00", end: "18:00" }, { label: "Saturday Drunch", start: "19:00", end: "22:00", price: "AED 199 / 249" }, { label: "David Bracken live", start: "21:00", end: "00:00" }],
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
    1: { slug: "monday-20-off", lines: ["20% off", "Mondays"], sub: "20% off food and drinks for cabin crew, teachers and hoteliers, from 9PM till close." },
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
      slug: "tower-up", name: "Tower Up Your Day", with: "2.5L beer tower + bites platter", cats: ["deals", "drinks"], img: "post-1",
      dayLabel: "Monday to Thursday, all day",
      short: "A 2.5 litre tower of select beer with a bites platter, AED 179, Monday to Thursday.",
      intro: "A 2.5 litre tower of select beer and a bites platter, for AED 179, all day Monday to Thursday. Built for sharing, so bring the group.",
      facts: [["When", "Mon – Thu, all day"], ["Tower", "2.5L + bites platter"], ["Price", "AED 179"]],
      fine: "Monday to Thursday, all day. Terms and conditions apply."
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
      slug: "halloween-week", name: "Halloween Week", with: "Two house drinks and a main course for AED 99",
      from: "2026-10-26", to: "2026-10-31", when: "26 – 31 October, all day", img: "halloween-week",
      short: "Two house drinks and a main course for AED 99, all day.",
      intro: "Two house drinks and a main course for one spooky price, AED 99, all day from Monday 26 to Saturday 31 October. Costumes are encouraged, though not compulsory.",
      facts: [["When", "26 – 31 October"], ["Hours", "All day"], ["Price", "AED 99"]],
      deal: { title: "2 house drinks and a main course", price: 99 },
      fine: "All day, 26 – 31 October. Terms and conditions apply.",
      ar: { name: "أسبوع الهالوين", when: "26 – 31 أكتوبر، طوال اليوم", short: "مشروبان مع طبق رئيسي بسعر 99 درهم، طوال اليوم." },
      ru: { name: "Неделя Хэллоуина", when: "26 – 31 октября, весь день", short: "Два напитка и основное блюдо за 99 AED, весь день." }
    },
    {
      slug: "beer-bucket", name: "Heineken Beer Bucket", with: "A bucket of Heineken for AED 129",
      from: "2026-10-01", to: "2026-11-30", when: "October and November", img: "beer-bucket",
      short: "A bucket of Heineken for the table, AED 129. Dine-in only.",
      intro: "A bucket of Heineken bottles on ice for the table, AED 129, all through October and November. Built for the match, the race or just the catch-up.",
      facts: [["Bucket", "Heineken"], ["Price", "AED 129"], ["Until", "30 November"]],
      deal: { title: "A bucket of Heineken bottles", price: 129 },
      fine: "Dine-in only. Same price for every brand. Valid October and November 2026.",
      ar: { name: "دلو بيرة Heineken", when: "أكتوبر ونوفمبر", short: "دلو من زجاجات Heineken للطاولة بسعر 129 درهم. داخل المطعم فقط." },
      ru: { name: "Ведро Heineken", when: "Октябрь и ноябрь", short: "Ведро бутылок Heineken на стол за 129 AED. Только в заведении." }
    },
    {
      slug: "festive-with-amstel", name: "Festive with Amstel", with: "Win an Amstel festive jumper",
      from: "2026-12-01", to: "2026-12-31", when: "December", img: "festive-with-amstel", img2: "festive-with-amstel-poster",
      short: "Order 2 Amstel pints for a chance to win an Amstel festive jumper.",
      intro: "Christmas comes with a jumper this year. Order two Amstel pints at the bar for a chance to win an Amstel festive jumper.",
      facts: [["Order", "2 Amstel pints"], ["Win", "A festive jumper"], ["When", "December"]],
      fine: "Run by Amstel. Dates to be confirmed.",
      ar: { name: "احتفل مع Amstel", when: "ديسمبر", short: "اطلب كأسين من Amstel لفرصة الفوز بكنزة Amstel الاحتفالية." },
      ru: { name: "Праздник с Amstel", when: "Декабрь", short: "Закажите 2 пинты Amstel и получите шанс выиграть праздничный свитер Amstel." }
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
    { img: "post-6", cap: "20% off Mondays, out on the terrace" },
    { img: "post-5", cap: "The quiz night platter" },
    { img: "post-11", cap: "Premier League returns" },
    { img: "post-7", cap: "Terrace season" },
    { img: "post-2", cap: "Mid-Term Mayhem, 10 – 18 October" },
    { img: "post-4", cap: "GAA tournament after party" }
  ],

  /* Menus open here as PDFs. Food menu from the venue, 23 October 2026; drinks menu still to come. */
  menus: { food: "assets/menus/food-menu.pdf", drinks: null, roomService: "assets/menus/room-service-menu.pdf" },

  /* The full food menu (from the venue's menu PDF, 23 October 2026), so Adam can answer price questions. [name, details, AED, search words] */
  menuItems: [
    ["Regular fries", "Thick or thin", 30, "fries chips"],
    ["Truffle fries", "Thick fries, truffle oil, parmesan, oregano, parsley", 40, "fries truffle chips"],
    ["Loaded fries", "Thick fries, beef bacon, grated cheddar, jalapeño, onion, sour cream", 45, "fries loaded bacon cheese chips"],
    ["Chili cheese fries", "Thick fries, chili con carne, jalapeño, grated cheddar", 50, "fries chili cheese chips"],
    ["Solo nacho", "Guacamole, salsa, sour cream", 40, "nachos nacho vegetarian"],
    ["Solo crudités", "Carrot, cucumber, celery, olives, tomato, cheese and dips", 45, "crudites vegetables vegetarian"],
    ["Jalapeño poppers", "Deep fried, with garlic mayo", 55, "jalapeno poppers vegetarian"],
    ["Veg spring rolls", "With Thai sweet chili sauce", 50, "spring rolls vegetarian"],
    ["Onion rings", "Deep fried, with sour cream", 55, "onion rings vegetarian"],
    ["Edamame", "Salted or spiced", 50, "edamame vegetarian vegan"],
    ["Beef lumpia", "With Thai chili sauce", 57, "lumpia beef rolls"],
    ["Beijing crispy beef", "Crispy beef sautéed with Asian sauce", 65, "beef crispy beijing"],
    ["Chicken balls", "With Asian sauce or curry sauce", 55, "chicken balls"],
    ["Chicken tenders", "With honey mustard sauce", 55, "chicken tenders strips"],
    ["Irish spice bag", "Fries, crispy chicken, onions, peppers and curry sauce", 65, "spice bag irish chicken curry"],
    ["Dynamite shrimps", "Deep fried, with dynamite sauce", 65, "shrimps shrimp prawns dynamite"],
    ["Crispy calamari", "Deep fried, with tartar sauce", 60, "calamari squid"],
    ["Stuffed mushrooms", "Deep fried, with garlic mayo", 55, "mushrooms stuffed vegetarian"],
    ["Crispy wings, 6 pieces", "BBQ, buffalo, lemon pepper, honey glaze, Thai style or sweet chili", 65, "wings chicken buffalo"],
    ["Crispy wings, 12 pieces", "BBQ, buffalo, lemon pepper, honey glaze, Thai style or sweet chili", 99, "wings chicken buffalo"],
    ["Bites platter", "6 wings, 6 veg rolls, crispy calamari, 6 beef lumpia, 6 jalapeño poppers, stuffed mushrooms, onion rings, cajun fries and dips", 155, "platter sharing bites"],
    ["Cheese platter", "Cheddar, parmesan, emmental, blue cheese, camembert, crackers, grapes, honey and berry compote", 75, "cheese platter sharing"],
    ["Mixed grill platter", "Chicken or beef: 3 chicken skewers, 3 chicken kebabs, 3 beef skewers, 3 beef kebabs, grilled veg and dips", 210, "mixed grill platter kebab skewers sharing"],
    ["Slider platter", "6 beef, chicken or mixed sliders with fries", 130, "sliders platter sharing burger"],
    ["Seafood platter", "Mussels, jumbo prawns, squid, salmon and grilled veg", 250, "seafood platter fish prawns sharing"],
    ["Crudités platter", "Lettuce, celery, cucumber, carrot, olives, cherry tomato, cheddar cubes, pickles, hummus and blue cheese dip", 79, "crudites platter vegetarian sharing"],
    ["Loaded nachos", "Guacamole, sour cream, jalapeño, spicy tomato salsa and cheese sauce. Add chili con carne or chicken for AED 20", 75, "nachos loaded sharing"],
    ["US Prime Angus ribeye steak", "With 1 side and 1 sauce", 210, "steak ribeye rib-eye beef angus"],
    ["Lamb chops", "With 1 side and 1 sauce", 180, "lamb chops"],
    ["Grilled salmon", "With 1 side and lemon butter sauce", 145, "salmon fish"],
    ["Fish & chips", "With tartar sauce, curry sauce and mushy minty peas", 110, "fish chips"],
    ["Spicy garlic butter prawns", "With Thai chili and garlic bread", 120, "prawns shrimp garlic"],
    ["Irish beef stew", "With mashed potato and garlic bread", 110, "beef stew irish"],
    ["Mussels", "Natural, Thai curry or garlic cream", "111 – 135", "mussels seafood"],
    ["Butter chicken", "With rice, papad, mixed pickle and fresh salad", 90, "butter chicken curry indian"],
    ["Pizza Margherita", "Tomato, mozzarella and oregano", 60, "pizza margherita vegetarian"],
    ["Tomato & pesto pizza", "Tomato, mozzarella, sliced tomato and pesto oil", 65, "pizza pesto vegetarian"],
    ["Vegetarian pizza", "Tomato, mozzarella, peppers, onion, mushroom and olives", 65, "pizza vegetarian"],
    ["Pepperoni & mushroom pizza", "Tomato, mozzarella, beef pepperoni and mushroom", 70, "pizza pepperoni"],
    ["Tomato & basil pasta", "Spaghetti, penne or fettuccine. Add chicken or beef for AED 20, shrimps 22, mixed seafood 28", 65, "pasta tomato basil vegetarian"],
    ["Pasta arrabbiata", "Tomato sauce with a hint of chili. Spaghetti, penne or fettuccine", 65, "pasta arrabbiata arrabiata spicy vegetarian"],
    ["Pesto pasta", "Fresh basil pesto. Spaghetti, penne or fettuccine", 65, "pasta pesto vegetarian"],
    ["Pasta Alfredo", "Beef bacon, mushroom, garlic and shallots in a creamy sauce", 65, "pasta alfredo creamy"],
    ["Greek salad", "Classic Greek salad with feta. Add chicken for AED 20 or shrimps 22", 50, "salad greek feta vegetarian"],
    ["Classic Caesar salad", "With croutons. Add chicken for AED 20 or shrimps 22", 55, "salad caesar"],
    ["Angus beef burger", "200g Angus beef, lettuce, tomato, onion, pickle and cheese, with thin fries", 99, "burger beef angus cheeseburger"],
    ["Chicken burger", "Fried chicken, lettuce, tomato, onion, pickle and cheese, with thin fries", 90, "burger chicken"],
    ["Sliders", "Beef or chicken, with lettuce, tomato, onion, pickle, cheese and thin fries", 70, "sliders burger mini"],
    ["Chicken fillet wrap", "Fried chicken, lettuce, tomato and cheese, with thin fries", 65, "chicken wrap fillet"],
    ["Rustic steak sandwich", "Beef steak with peppers, onions, sundried tomato, rucola and balsamic glaze, with thin fries", 95, "steak sandwich"],
    ["Club sandwich", "Chicken, beef bacon, egg, coleslaw, tomato and cheese, with thin fries", 65, "club sandwich"],
    ["Classic hotdog", "Beef sausage, ketchup, mustard and fried onion, with thin fries", 62, "hotdog sausage"],
    ["Burrito", "Beef or chicken, peppers, guacamole, sour cream, cheddar, lettuce, kidney beans and rice, with thin fries", 60, "burrito mexican"],
    ["Apple crumble & vanilla ice cream", "Warm, rich and fruity", 50, "dessert apple crumble"],
    ["Warm chocolate brownie & vanilla ice cream", "", 50, "dessert chocolate brownie"],
    ["White chocolate & ginger cheesecake", "With caramel sauce", 50, "dessert cheesecake"]
  ],

  /* A taste of the menu, from the venue's food menu. The Arabic and Russian homepages list the same dishes. */
  dishes: [
    ["Seafood platter", "Mussels, jumbo prawns, squid, salmon and grilled veg", 250],
    ["US Prime Angus ribeye steak", "With a side and a sauce of your choice", 210],
    ["Mixed grill platter", "Chicken and beef skewers and kebabs, grilled veg and dips", 210],
    ["Lamb chops", "With a side and a sauce of your choice", 180],
    ["Bites platter", "Wings, veg rolls, calamari, beef lumpia, jalapeño poppers, stuffed mushrooms, onion rings and cajun fries", 155],
    ["Grilled salmon", "With a side and lemon butter sauce", 145],
    ["Fish & chips", "Tartar sauce, curry sauce and mushy minty peas", 110],
    ["Irish beef stew", "Mashed potato and garlic bread", 110],
    ["Angus beef burger", "200g Angus beef with cheese and thin fries", 99],
    ["Butter chicken", "Rice, papad, mixed pickle and fresh salad", 90],
    ["Irish spice bag", "Fries, crispy chicken, onions, peppers and curry sauce", 65],
    ["Apple crumble & vanilla ice cream", "", 50]
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

  /* Campaign landing pages for ads. SAMPLE packages and prices, to confirm with the venue.
     Prices are per person; a package with per: "bucket" (or "tower") is priced per item instead. */
  campaigns: [
    {
      slug: "christmas-parties", name: "Christmas parties", season: "1 – 24 December 2026", img: "christmas", src: "ig-ad",
      title: ["Christmas", "parties"], hook: "Office parties, friends' nights out and family get-togethers, in a pub that already has the screens, the booths and the private area.",
      from: "2026-12-01", to: "2026-12-24", groupMin: 2,
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
        { id: "match-bucket", name: "Heineken bucket", note: "A bucket of Heineken bottles for the table (October and November)", price: 129, deposit: 0, per: "bucket" },
        { id: "match-tower", name: "Tower up", note: "2.5L beer tower and a bites platter, for Monday to Thursday games", price: 179, deposit: 0, per: "tower" }
      ],
      perks: ["A table facing the screens", "Darts and pool for half-time", "Happy hour till 7PM on Fri and Sat", "Free to book, no deposit"]
    }
  ],

  /* Gift vouchers. SAMPLE values, to confirm with the venue. */
  vouchers: [
    { id: "roast-2", name: "Sunday roast for two", note: "Two roast buffets on any Sunday", price: 198, img: "post-9" },
    { id: "steak-2", name: "Steak night for two", note: "Two 250g rib-eyes with fries and 2 house drinks each", price: 398, img: "post-3" },
    { id: "tower", name: "Tower and bites", note: "A 2.5L beer tower with a bites platter, Monday to Thursday", price: 179, img: "post-1" },
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
  ai: { endpoint: "", languages: ["English", "Arabic", "Russian"] },

  /* ===================== v3 additions (18 October 2026) ===================== */

  /* The server (jvc-server on Vercel), e.g. "https://ask-adam-jvc.vercel.app". Empty = practice mode:
     the club, predictor and song requests work on each device with sample data, and Adam answers from the schedule.
     Filling this in switches on the AI, the real club database, song requests, the predictor and live fixtures. */
  api: "",

  /* Where the site lives, for links in WhatsApp broadcasts and captions when the dashboard is opened from a file. */
  siteUrl: "https://lukasgrobler.github.io/adams-beer-kitchen-jvc/",

  /* Adam's Club. SAMPLE rewards, to confirm with the venue. "need" must match CLUB_STAMPS on the server (default 10). */
  club: { need: 10, reward: "a house drink on us", birthday: "a dessert or a house drink in your birthday month" },

  /* Score predictor prize. SAMPLE, to confirm. */
  predictor: { prize: "An AED 200 bar tab for the top of the table each month" },

  /* ===================== v4 additions (22 October 2026) ===================== */

  /* Grand Prix season (grand-prix.html): every F1 race on the big screens, and the brands' own F1 promotions.
     Heineken and Jack Daniel's run their promotions and pick their own winners; the page explains how to take part.
     Details from the brands' trade decks. Delete this block when the season's over. */
  f1: {
    from: "2026-10-30", to: "2026-12-06", img: "grand-prix", photo: "post-1", /* the Adam's F1 car on the card; the screens photo by the race nights */
    /* the card on the Arabic and Russian homepages */
    ar: { name: "موسم الفورمولا 1", when: "30 أكتوبر – 6 ديسمبر", short: "كل سباقات الفورمولا 1 على الشاشات الكبيرة، وجوائز للفوز مع Heineken وJack Daniel's." },
    ru: { name: "Сезон Гран-при", when: "30 октября – 6 декабря", short: "Все гонки Формулы 1 на больших экранах и призы от Heineken и Jack Daniel's." },
    /* race start, Dubai time. Las Vegas (Sunday 22 November) is left out: it starts at 8AM, before we open. */
    races: [
      { date: "2026-11-01", time: "00:00", name: "Mexico City Grand Prix", ar: "جائزة مكسيكو سيتي الكبرى", ru: "Гран-при Мехико" },
      { date: "2026-11-08", time: "21:00", name: "São Paulo Grand Prix", ar: "جائزة ساو باولو الكبرى", ru: "Гран-при Сан-Паулу" },
      { date: "2026-11-29", time: "20:00", name: "Qatar Grand Prix", ar: "جائزة قطر الكبرى", ru: "Гран-при Катара" },
      { date: "2026-12-06", time: "17:00", name: "Abu Dhabi Grand Prix", ar: "جائزة أبوظبي الكبرى", ru: "Гран-при Абу-Даби", finale: true }
    ],
    heineken: {
      name: "Heineken Fans' Grid", from: "2026-10-30", to: "2026-11-27",
      url: "", /* the Fans' Grid website, once Heineken shares it; until then guests scan the QR code on the Heineken card */
      /* [place on the grid, prize, how it's won, picture in assets/img/promo] */
      prizes: [["P12", "A Heineken F1 cup", "Your first entry", "f1-cup"], ["P8", "F1 TV 2027 season subscription", "Prize draw", "f1-tv"], ["P4", "Abu Dhabi Grand Prix GA tickets", "Prize draw", "f1-tickets"], ["P1", "VIP Hospitality Lounge at the Abu Dhabi Grand Prix", "Prize draw", "f1-vip-pass"]],
      lounge: { img: "vip-lounge", perks: ["A premium view of the track", "Luxury ambience", "Gourmet dining", "Abu Dhabi experiences"] },
      points: [["2+ Heineken pints at the bar", "+4 places"], ["A Heineken 24-pack from a shop or delivery", "+4 places"], ["A Heineken 12-pack", "+2 places"], ["A friend joins with your code", "+4 for you, +2 for them"]]
    },
    jack: {
      name: "Jack Daniel's F1 menu", from: "2026-10-01", to: "2026-11-30",
      prize: "a Jack's Garage cap or a limited edition T-shirt",
      prizes: [["Jack's Garage cap", "jd-cap"], ["Limited edition T-shirt", "jd-tshirt"]],
      /* [drink, AED] SAMPLE dates and prices, to confirm with the venue (0 = no price shown) */
      menu: [["Formula Jack", 0], ["Lynchburg Lemonade", 0], ["Jack & Cola", 0], ["Jack & Ginger", 0], ["Jack Honey & Lemonade", 0], ["Jack Apple & Tonic", 0]]
    }
  }
};
