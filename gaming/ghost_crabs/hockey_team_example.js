const { useMemo, useState } = React;

const BANNER = "/images/banner1.png";
// ---------- Router ----------
const routes = [
  { path: "", name: "Home", Component: Home },
  { path: "about", name: "About", Component: About },
  { path: "team", name: "Team", Component: Team },
  { path: "players", name: "Players", Component: Players },
  { path: "schedule", name: "Schedule", Component: Schedule },
  { path: "live", name: "Live", Component: Live },
  { path: "media", name: "Media", Component: Media },
  { path: "tickets", name: "Tickets", Component: Tickets },
  { path: "contact", name: "Contact", Component: Contact },
];

function useHashRoute() {
  const [hash, setHash] = useState(() =>
    typeof window !== "undefined"
      ? window.location.hash.replace(/^#\/?/, "")
      : ""
  );
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace(/^#\/?/, ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return routes.find((r) => r.path === hash) ?? routes[0];
}

// ---------- Site Data ----------
function useSiteData() {
  return useMemo(
    () => ({
      brand: {
        name: "Myrtle Beach Megalodon",
        city: "Myrtle Beach, SC",
        colors: {
          primary: "#1b5cff",
          secondary: "#ffd700",
          dark: "#0a1425",
          light: "#e2e8f0",
        },
        tagline: "Clawing for Victory",
        arena: {
          name: "Boardwalk Arena",
          capacity: 8500,
          address: "100 Coastal Rd, Myrtle Beach",
        },
        logo: "./images/MBCrabs.png",
      },
      nav: [
        { label: "Home", href: "#/" },
        { label: "Team", href: "#/team" },
        { label: "Players", href: "#/players" },
        { label: "Schedule", href: "#/schedule" },
        { label: "Live", href: "#/live" },
        { label: "Media", href: "#/media" },
        { label: "Tickets", href: "#/tickets" },
        { label: "About", href: "#/about" },
        { label: "Contact", href: "#/contact" },
      ],
      promos: [
        {
          title: "$2 Beers & Dogs",
          date: "Oct 24",
          body: "6–8pm on the concourse.",
          cta: "View Promo",
          href: "#/schedule",
        },
        {
          title: "Family 4-Pack",
          date: "All Season",
          body: "4 tickets + 4 sodas + 4 hot dogs.",
          cta: "Buy Now",
          href: "#/tickets",
        },
        {
          title: "Kids Club",
          date: "Join Today",
          body: "Swag, experiences & more!",
          cta: "Sign Up",
          href: "#/contact",
        },
      ],
      games: [
        {
          id: 1,
          date: "2025-10-24",
          opponent: "Harbor City Narwhals",
          home: true,
          time: "7:05 PM",
          promo: "$2 Beers & Dogs",
        },
        {
          id: 2,
          date: "2025-10-26",
          opponent: "Cascadia Kodiaks",
          home: true,
          time: "3:05 PM",
          promo: "Kids Takeover Day",
        },
        {
          id: 3,
          date: "2025-10-31",
          opponent: "Baystate Barracuda",
          home: false,
          time: "7:35 PM",
          promo: "—",
        },
        {
          id: 4,
          date: "2025-11-02",
          opponent: "River City Riptide",
          home: true,
          time: "7:05 PM",
          promo: "Military Night",
        },
      ],
      news: [
        {
          id: 11,
          title: "Crabs Sign Blueliner Jax Whitaker",
          date: "2025-09-01",
          excerpt: "Physical, puck-moving defenseman inks one-year deal.",
          href: "#",
        },
        {
          id: 12,
          title: "Prospect Camp Recap",
          date: "2025-08-20",
          excerpt: "Standouts, systems, and who impressed.",
          href: "#",
        },
        {
          id: 13,
          title: "Theme Nights Announced",
          date: "2025-08-10",
          excerpt: "Mark your calendar for special promos.",
          href: "#",
        },
      ],
      roster: [
        {
          id: "P01",
          number: 7,
          name: "Player One",
          position: "C",
          shoots: "L",
          height: "6'0\"",
          weight: 190,
          headshot: "./images/player1.png",
          bio: "Two-way center with strong playmaking vision.",
          clips: [],
        },
        {
          id: "P02",
          number: 12,
          name: "Player Two",
          position: "RW",
          shoots: "R",
          height: "5'11\"",
          weight: 185,
          headshot: "./images/player2.png",
          bio: "Fast winger with a powerful slap shot.",
          clips: [],
        },
        {
          id: "P03",
          number: 22,
          name: "Player Three",
          position: "D",
          shoots: "L",
          height: "6'3\"",
          weight: 210,
          headshot: "./images/player3.png",
          bio: "Stay-at-home defenseman with great reach.",
          clips: [],
        },
        {
          id: "P04",
          number: 30,
          name: "Player Four",
          position: "G",
          catches: "L",
          height: "6'2\"",
          weight: 205,
          headshot: "./images/player4.png",
          bio: "Calm goalie with lightning-fast reflexes.",
          clips: [],
        },
        {
          id: "P05",
          number: 19,
          name: "Player Five",
          position: "LW",
          shoots: "L",
          height: "6'1\"",
          weight: 192,
          headshot: "./images/player5.png",
          bio: "Sniper with a lethal wrist shot.",
          clips: [],
        },
        {
          id: "P06",
          number: 27,
          name: "Player Six",
          position: "C",
          shoots: "R",
          height: "6'0\"",
          weight: 188,
          headshot: "./images/player6.png",
          bio: "Creative playmaker with excellent vision.",
          clips: [],
        },
      ],
      sponsors: [
        { name: "Local Bank", logo: "./images/MBCrabs.png" },
        { name: "Coastal Energy", logo: "./images/MBCrabs.png" },
      ],
    }),
    []
  );
}

// ---------- Shared UI ----------
function Shell({ children }) {
  const route = useHashRoute();
  const { brand, nav } = useSiteData();
  return (
    <div className="min-h-screen theme-bg">
      <Header brand={brand} nav={nav} />
      <NewsletterPopup brand={brand} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <route.Component />}
      </main>
      <Footer brand={brand} />
    </div>
  );
}

function Header({ brand, nav }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b theme-border sticky top-0 backdrop-blur theme-surface z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-3 group">
          <img
            src={brand.logo}
            alt="Team logo"
            className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-1"
          />
          <div>
            <div className="font-semibold leading-tight group-hover:text-cyan-200 transition-colors">
              {brand.name}
            </div>
            <div className="text-xs text-slate-400">{brand.tagline}</div>
          </div>
        </a>
        <nav className="hidden md:flex gap-6 text-sm">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-cyan-300">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-2 rounded-lg border border-slate-700"
          >
            Menu
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-800">
          <nav className="max-w-7xl mx-auto px-4 py-4 grid gap-3 text-sm">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2 border-b border-slate-800/60"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer({ brand }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t theme-border py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3 text-sm">
        <div className="space-y-2">
          <div className="font-semibold">{brand.name}</div>
          <p className="text-slate-400">
            {brand.arena.name} · {brand.city}
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Contact</div>
          <p className="text-slate-400">
            info@ghostcrabshockey.com · (555) 555-0133
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Newsletter</div>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"
              placeholder="Email address"
            />
            <button className="rounded-xl px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold">
              Sign Up
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-xs text-slate-500">
        © {year} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}

// ---------- Pages ----------
function Home() {
  return (
    <>
      <Hero />
      <PromoTiles />
      <NextGame />
      <NewsRail />
      <Sponsors />
    </>
  );
}

function About() {
  const { brand } = useSiteData();
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold">About the {brand.name}</h1>
        <p className="mt-3 text-slate-300">
          Founded in 2025, the Megalodon bring fast, fearless hockey to{" "}
          {brand.city}. We’re committed to player development, unforgettable
          game-night experiences, and community impact across the region.
        </p>
        <ul className="mt-4 space-y-2 text-slate-300 list-disc pl-5">
          <li>
            Home Ice: {brand.arena.name} (Capacity{" "}
            {brand.arena.capacity.toLocaleString()})
          </li>
          <li>
            Community: Learn-to-Skate, School Day Games, Hockey Fights Cancer
            Night
          </li>
        </ul>
      </div>
      <div className="rounded-2xl theme-outline theme-border p-6 theme-surface">
        <img src={BANNER} alt="Arena" className="w-full h-full object-cover" />
      </div>
    </section>
  );
}

function Team() {
  const { brand } = useSiteData();
  return (
    <section className="grid gap-6 md:grid-cols-3">
      <Card
        title="Front Office"
        body="GM, Hockey Ops, Coaching Staff, Scouts, Medical."
      >
        <a href="#" className="text-cyan-300">
          Meet the Staff →
        </a>
      </Card>
      <Card
        title="Community"
        body="School visits, charity nights, youth clinics, hospital outreach."
      >
        <a href="#" className="text-cyan-300">
          See Programs →
        </a>
      </Card>
      <Card
        title="The Arena"
        body={`${brand.arena.name} seating map, parking, policies, concessions.`}
      >
        <a href="#" className="text-cyan-300">
          Plan Your Visit →
        </a>
      </Card>
    </section>
  );
}

function Players() {
  const { roster } = useSiteData();
  const [active, setActive] = useState(null);
  return (
    <section>
      <h1 className="text-3xl font-extrabold">Roster</h1>
      <p className="mt-2 text-slate-300">
        Tap a player to view bio and highlight clips.
      </p>

      {/* Equal-height cards */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roster.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="group text-left rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-900/40 h-full flex flex-col"
          >
            {/* Force the same crop on every photo */}
            <img
              src={p.headshot}
              alt={p.name}
              className="w-full aspect-[4/3] object-cover object-center"
            />

            {/* Lock the info area height so bottoms align */}
            <div className="p-4 mt-auto min-h-[88px]">
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  #{p.number} {p.name}
                </div>
                <div className="text-xs text-slate-400">{p.position}</div>
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {p.height} · {p.weight} lb ·{" "}
                {p.shoots
                  ? `Shoots ${p.shoots}`
                  : p.catches
                  ? `Catches ${p.catches}`
                  : ""}
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <Modal onClose={() => setActive(null)}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={active.headshot}
                alt={active.name}
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <div className="mt-3">
                <h2 className="text-2xl font-bold">
                  #{active.number} {active.name} — {active.position}
                </h2>
                <p className="mt-2 text-slate-300">{active.bio}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {active.height} · {active.weight} lb ·{" "}
                  {active.shoots
                    ? `Shoots ${active.shoots}`
                    : active.catches
                    ? `Catches ${active.catches}`
                    : ""}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Highlights</h3>
              <div className="mt-3 grid gap-4">
                {(active.clips || []).map((c, i) => (
                  <figure
                    key={i}
                    className="rounded-xl overflow-hidden border border-slate-800/60"
                  >
                    <video
                      src={c.url}
                      controls
                      className="w-full h-48 object-cover"
                    />
                    <figcaption className="px-3 py-2 text-sm text-slate-300">
                      {c.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Schedule() {
  const { games } = useSiteData();
  return (
    <section>
      <h1 className="text-3xl font-extrabold">Schedule</h1>
      <p className="mt-2 text-slate-300">
        Home games at Boardwalk Arena. Times local.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800/60">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-300">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Opponent</th>
              <th className="text-left px-4 py-3">Home/Away</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Promo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id} className="border-t border-slate-800/60">
                <td className="px-4 py-3">{formatDate(g.date)}</td>
                <td className="px-4 py-3">{g.opponent}</td>
                <td className="px-4 py-3">{g.home ? "Home" : "Away"}</td>
                <td className="px-4 py-3">{g.time}</td>
                <td className="px-4 py-3">{g.promo}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href="#/tickets"
                    className="rounded-lg px-3 py-1 bg-blue-500 text-slate-950 font-semibold"
                  >
                    Tickets
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Live() {
  return (
    <section className="grid gap-6 md:grid-cols-[2fr,1fr] items-start">
      <div>
        <h1 className="text-3xl font-extrabold">Live Stream</h1>
        <p className="mt-2 text-slate-300">
          Embed your provider (YouTube, Twitch, FloHockey, AHLTV, etc.).
        </p>
        <div className="mt-4 aspect-video rounded-2xl overflow-hidden border border-slate-800/60 bg-black">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Live Stream"
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex gap-3 text-sm">
          <a
            href="#/schedule"
            className="rounded-lg px-3 py-2 border border-slate-700"
          >
            View Schedule
          </a>
          <a
            href="#/tickets"
            className="rounded-lg px-3 py-2 bg-blue-500 text-slate-950 font-semibold"
          >
            Buy Tickets
          </a>
        </div>
      </div>
      <div>
        <div className="rounded-2xl theme-outline theme-border p-6 theme-surface">
          <div className="font-semibold">Game Center</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Pregame: 6:30 PM — Coach Interview</li>
            <li>Puck Drop: 7:05 PM — vs Harbor City Narwhals</li>
            <li>Intermission: Fan Cam + On-Ice Games</li>
            <li>Postgame: Player of the Game Presentation</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Media() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold">Media</h1>
      <p className="mt-2 text-slate-300">
        Highlights, interviews, and behind-the-scenes.
      </p>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <a
            key={i}
            href="#"
            className="rounded-2xl overflow-hidden border border-slate-800/60 group"
          >
            <img
              src={BANNER}
              alt="Clip"
              className="h-48 w-full object-cover group-hover:opacity-90"
            />

            <div className="p-4">
              <div className="font-semibold">Game {i} Highlights</div>
              <div className="text-sm text-slate-400">2:31 · AHLTV</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Tickets() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      <TicketTier
        title="Single Game"
        price="$18+"
        perks={["Choose any home game", "Mobile entry", "Seat selector"]}
        cta="Find Seats"
      />
      <TicketTier
        title="Flex Plan"
        price="$199"
        perks={["10 ticket credits", "$ savings vs gate", "Share with friends"]}
        cta="Build Plan"
        featured
      />
      <TicketTier
        title="Season Membership"
        price="$549"
        perks={["Best seat value", "Member events", "Exchange nights"]}
        cta="Join Now"
      />
    </section>
  );
}

function Contact() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold">Contact Us</h1>
        <p className="mt-2 text-slate-300">
          Questions about tickets, partnerships, or media? Send a note.
        </p>
        <form className="mt-6 grid gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"
            placeholder="Full name"
          />
          <input
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"
            placeholder="Email"
          />
          <select className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2">
            <option>General</option>
            <option>Tickets</option>
            <option>Partnerships</option>
            <option>Media</option>
          </select>
          <textarea
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 min-h-[120px]"
            placeholder="Message"
          />
          <button className="rounded-xl px-5 py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold">
            Send
          </button>
        </form>
      </div>
      <div className="rounded-2xl theme-outline theme-border p-6 theme-surface">
        <h2 className="font-semibold">Front Office Directory</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>Ticketing: tickets@ghostcrabshockey.com · (555) 555-0117</li>
          <li>Partnerships: partners@ghostcrabshockey.com · (555) 555-0139</li>
          <li>Media: media@ghostcrabshockey.com · (555) 555-0199</li>
        </ul>
      </div>
    </section>
  );
}

// ---------- Small UI ----------
function Card({ title, body, children }) {
  return (
    <div className="rounded-2xl theme-outline theme-border p-6 theme-surface">
      <div className="font-semibold text-lg">{title}</div>
      <p className="mt-2 text-slate-300">{body}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TicketTier({ title, price, perks, cta, featured }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        featured
          ? "border-blue-400/60 bg-blue-500/10"
          : "border-slate-800/60 bg-slate-900/40"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {featured ? "Most Popular" : "Ticket Option"}
      </div>
      <div className="mt-1 font-bold text-xl">{title}</div>
      <div className="text-3xl font-extrabold mt-2">{price}</div>
      <ul className="mt-3 space-y-2 text-slate-300">
        {perks.map((p, i) => (
          <li key={i}>• {p}</li>
        ))}
      </ul>
      <a
        href="#/tickets"
        className={`mt-4 inline-block rounded-xl px-4 py-2 font-semibold ${
          featured ? "bg-blue-500 text-slate-950" : "border border-slate-700"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

function Modal({ children, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full rounded-2xl border border-slate-800/60 bg-slate-900/90 backdrop-blur p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-slate-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- Helpers ----------
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
      <img
        src={BANNER}
        alt="Hockey action"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />

      <div className="relative p-8 md:p-12 lg:p-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs">
          Season 2025-26
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
          Defend The Bay
        </h1>
        <p className="mt-3 text-slate-300 max-w-2xl">
          Catch every hit, save, and celly. Tickets on sale now—plus theme
          nights, giveaways, and $2 concessions on select dates.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="#/tickets"
            className="rounded-xl px-5 py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold"
          >
            Get Tickets
          </a>
          <a
            href="#/schedule"
            className="rounded-xl px-5 py-3 border border-slate-700 hover:border-slate-600"
          >
            Full Schedule
          </a>
        </div>
      </div>
    </section>
  );
}

function PromoTiles() {
  const { promos } = useSiteData();
  return (
    <section className="mt-10 grid md:grid-cols-3 gap-4">
      {promos.map((p, i) => (
        <a
          key={i}
          href={p.href}
          className="group rounded-2xl border border-slate-800/60 p-5 bg-slate-900/40 hover:bg-slate-900 transition-colors"
        >
          <div className="text-xs text-slate-400">{p.date}</div>
          <div className="mt-1 font-semibold text-lg">{p.title}</div>
          <p className="mt-1 text-slate-300">{p.body}</p>
          <div className="mt-3 text-cyan-300 group-hover:translate-x-0.5 transition-transform">
            {p.cta} →
          </div>
        </a>
      ))}
    </section>
  );
}

function NextGame() {
  const { games } = useSiteData();
  const next = games[0];
  return (
    <section className="mt-10 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div className="text-xs text-slate-400">Next Home Game</div>
      <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xl font-bold">
          {formatDate(next.date)} · {next.time} · vs {next.opponent}
        </div>
        <div className="flex gap-3">
          <a
            href="#/tickets"
            className="rounded-xl px-4 py-2 bg-blue-500 text-slate-950 font-semibold"
          >
            Tickets
          </a>
          <a
            href="#/live"
            className="rounded-xl px-4 py-2 border border-slate-700"
          >
            Watch/Listen
          </a>
        </div>
      </div>
      {next.promo && (
        <div className="mt-2 text-slate-300">Promo: {next.promo}</div>
      )}
    </section>
  );
}

function NewsRail() {
  const { news } = useSiteData();
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-3">Latest News</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {news.map((n) => (
          <article
            key={n.id}
            className="rounded-2xl border border-slate-800/60 p-5 bg-slate-900/40"
          >
            <div className="text-xs text-slate-400">{formatDate(n.date)}</div>
            <h3 className="mt-1 font-semibold">{n.title}</h3>
            <p className="mt-2 text-slate-300">{n.excerpt}</p>
            <a href="#" className="mt-3 inline-block text-cyan-300">
              Read Article →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Sponsors() {
  const { sponsors } = useSiteData();
  return (
    <section className="mt-10 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div className="text-xs text-slate-400">PRESENTED BY</div>
      <div className="mt-3 flex flex-wrap items-center gap-6">
        {sponsors.map((s) => (
          <img
            key={s.name}
            alt={s.name}
            src={s.logo}
            className="h-8 opacity-80 hover:opacity-100"
          />
        ))}
      </div>
    </section>
  );
}

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function App() {
  const route = useHashRoute();
  const Page = route.Component;
  return (
    <Shell>
      <Page />
    </Shell>
  );
}

function NewsletterPopup({ brand }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [ok, setOk] = React.useState(false);
  const key = "mbgc_news_seen"; // localStorage key
  const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  React.useEffect(() => {
    // Show only on Home (no hash or "#/")
    const isHome = !window.location.hash || window.location.hash === "#/";
    if (!isHome) return;

    const raw = localStorage.getItem(key);
    const last = raw ? Number(raw) : 0;
    const now = Date.now();
    if (!last || now - last > ttlMs) {
      // small delay so it feels intentional
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function closeAndRemember() {
    localStorage.setItem(key, String(Date.now()));
    setOpen(false);
  }

  function submit(e) {
    e.preventDefault();
    if (!ok || !/^\S+@\S+\.\S+$/.test(email)) return;
    // TODO: send to your email service/provider here
    closeAndRemember();
    alert("Thanks! You’re on the list.");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4"
      onClick={closeAndRemember}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#a40e0e] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) */}
        <button
          onClick={closeAndRemember}
          aria-label="Close"
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left: photo area (you can swap to a team image) */}
          <div className="hidden md:block bg-black/30">
            <img
              src={BANNER}
              alt="Hockey"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: form */}
          <div className="p-6 md:p-8">
            <img src={brand.logo} alt="logo" className="h-10 mb-3" />
            <div className="text-2xl md:text-3xl font-extrabold leading-tight">
              Sign up and <br /> get exclusive access
            </div>
            <p className="mt-2 text-white/90 text-sm">
              On upcoming sales, discounted offers, merchandise and more!
            </p>

            <form onSubmit={submit} className="mt-4 grid gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl px-4 py-3 text-slate-900"
                required
              />
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ok}
                  onChange={(e) => setOk(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree to receive emails from {brand.name}. I can unsubscribe
                  anytime.
                </span>
              </label>
              <button
                type="submit"
                disabled={!ok || !/^\S+@\S+\.\S+$/.test(email)}
                className="mt-1 rounded-full bg-white text-[#a40e0e] font-bold px-6 py-3 disabled:opacity-60"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={closeAndRemember}
                className="text-xs opacity-80 underline underline-offset-2"
              >
                No thanks
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
