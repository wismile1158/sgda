const SGDS_DATA = {
  events: [
    "Upcoming Events",
    "Food Festival planning meeting • Thursday 7:00 PM",
    "Summer Picnic • Sunday, August 16 after Badarak",
    "Choir rehearsal • Wednesday 7:30 PM",
    "Women's Guild meeting • September 10"
  ],
  community: [
    { type: "birthday", text: "Happy Birthday Lara Derderian" },
    { type: "birthday", text: "Happy Birthday Daniel Sarafian" },
    { type: "anniversary", text: "Wedding Anniversary Kevork & Sirvart Kouyoumjian" },
    { type: "birth", text: "Welcome baby Emma to the St. George family" },
    { type: "prayer", text: "In our prayers: Alice Keshishian" }
  ],
  announcements: [
    { title: "Feast of the Assumption", body: "Blessing of grapes following Badarak this Sunday." },
    { title: "Sunday School Registration", body: "Families may register students during coffee hour." },
    { title: "Church Clean-Up Day", body: "Saturday, 8:00 AM – 12:00 PM. Many hands make light work." },
    { title: "Parish Council Meeting", body: "Monthly meeting in the library after fellowship." }
  ],
  hokehankist: [
    ["Anna Bedrosian", "Requested by the Bedrosian Family"],
    ["Rose Sarkisian", "Requested by Mary Sarkisian"],
    ["Mariam Hagopian", "Requested by the Hagopian Family"],
    ["George Derderian", "Requested by his children"],
    ["Lucine Melkonian", "Requested by grandchildren"],
    ["Aram Keshishian", "Requested by the Keshishian Family"]
  ],
  legacyNames: [
    "John & Mary Sarkisian", "George & Alice Bedrosian", "The Hagopian Family", "Haig & Silva Melkonian", "Vartan & Anoush Chamlian", "Kevork & Sirvart Kouyoumjian", "Dr. & Mrs. Movses Tashjian", "Antranig & Seta Keshishian", "The Papazian Family", "Peter & Lucy Minasian", "Ara & Louise Maloulian", "Michael & Houry Boyadjian", "The Derderian Family", "Hagop & Isabel Vartivarian", "The Garabedian Family", "Paul & Arpi Hovsepian", "The Koumjian Family", "Richard & Nora Davidian", "The Krikorian Family"
  ]
};

function iconForCommunity(type) {
  if (type === "birthday") return "🎂";
  if (type === "anniversary") return "💕";
  if (type === "birth") return "👶";
  if (type === "prayer") return "✝";
  return "✦";
}

function buildCrawls() {
  const events = document.getElementById("eventsCrawl");
  const eventItems = SGDS_DATA.events.map((item, i) => {
    if (i === 0) return `<span class="crawl-label">${item}</span>`;
    return `<span><span class="pennant"></span>${item}</span>`;
  }).join("");
  events.innerHTML = eventItems + eventItems;

  const community = document.getElementById("communityCrawl");
  const communityItems = SGDS_DATA.community.map(item =>
    `<span><span class="community-icon">${iconForCommunity(item.type)}</span>${item.text}</span>`
  ).join("");
  community.innerHTML = communityItems + communityItems;
}

function buildAnnouncements() {
  const target = document.getElementById("announcementsList");
  target.innerHTML = SGDS_DATA.announcements.map(item => `
    <div class="announcement-item">
      <div class="small-pennant"></div>
      <div><h3>${item.title}</h3><p>${item.body}</p></div>
    </div>
  `).join("");
}

function buildHokehankist() {
  const target = document.getElementById("hokehankistList");
  const rows = SGDS_DATA.hokehankist.map(([name, by]) => `<div>${name}<br><span>${by}</span></div>`).join("");
  target.innerHTML = rows + rows;
}

function buildLegacy() {
  const rows = SGDS_DATA.legacyNames.map(name => `<div>${name}</div>`).join("");
  document.getElementById("legacyNamesLeft").innerHTML = rows + rows;
  document.getElementById("legacyNamesRight").innerHTML = rows + rows;
}

function updateClock() {
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const full = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(now);
  const parts = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(now);
  const hour = parts.find(p => p.type === "hour")?.value || "10";
  const minute = parts.find(p => p.type === "minute")?.value || "42";
  const dayPeriod = (parts.find(p => p.type === "dayPeriod")?.value || "am").toLowerCase();
  document.getElementById("dateDay").textContent = day;
  document.getElementById("dateFull").textContent = full;
  document.getElementById("dateTime").innerHTML = `${hour}:${minute}<span>${dayPeriod}</span>`;
}

buildCrawls();
buildAnnouncements();
buildHokehankist();
buildLegacy();
updateClock();
setInterval(updateClock, 30000);
