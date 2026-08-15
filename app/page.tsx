"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type RankMetric = "Followers" | "PnL" | "Win rate" | "Unrealized";
type Window = "7D" | "1M";
type Cohort = 20 | 50 | 100;
type FeedMode = "Updates" | "Theses";

type Thesis = {
  handle: string;
  initials: string;
  age: string;
  token: string;
  tokenName: string;
  copy: string;
  position: string;
  pnl: string;
  likes: number;
  replies: number;
  followers: string;
  winRate: string;
  ranks: Record<Window, Record<RankMetric, number>>;
};

type Analysis = {
  id: number;
  query: string;
  heading: string;
  summary: string;
  facts: string[];
  evidence: string;
};

type CommandItem = {
  value: string;
  description: string;
};

type CommandGroup = {
  label: string;
  commands: CommandItem[];
};

type CommandFilter = "All" | "Right now" | "Tokens" | "Traders" | "My network" | "Signals and alerts";

type Situation = {
  type: string;
  title: string;
  age: string;
  changed: string;
  lead: string;
  sequence: string;
  significance: string;
  state: string;
  command: string;
};

const theses: Thesis[] = [
  {
    handle: "PoorGoat",
    initials: "PG",
    age: "8m",
    token: "PENGU",
    tokenName: "Pudgy Penguins",
    copy: "Consumer crypto wins when the brand travels further than the ticker. PENGU still has the cleanest distribution loop in the sector.",
    position: "$242.6K",
    pnl: "+$23.23K",
    likes: 293,
    replies: 18,
    followers: "31.8K",
    winRate: "78%",
    ranks: {
      "7D": { Followers: 12, PnL: 1, "Win rate": 4, Unrealized: 2 },
      "1M": { Followers: 12, PnL: 4, "Win rate": 9, Unrealized: 3 },
    },
  },
  {
    handle: "theveeman",
    initials: "VE",
    age: "19m",
    token: "FARTCOIN",
    tokenName: "Fartcoin",
    copy: "The pullback reset funding without breaking the higher-timeframe structure. Rebuilding here while attention rotates back to AI memes.",
    position: "$184.1K",
    pnl: "+$41.08K",
    likes: 184,
    replies: 31,
    followers: "18.4K",
    winRate: "72%",
    ranks: {
      "7D": { Followers: 28, PnL: 2, "Win rate": 11, Unrealized: 5 },
      "1M": { Followers: 28, PnL: 8, "Win rate": 14, Unrealized: 7 },
    },
  },
  {
    handle: "MemeKingdom",
    initials: "MK",
    age: "42m",
    token: "BONK",
    tokenName: "Bonk",
    copy: "Still the broadest Solana meme beta. Keeping the core position open while spot volume holds above the weekly median.",
    position: "$96.8K",
    pnl: "+$12.74K",
    likes: 128,
    replies: 9,
    followers: "42.1K",
    winRate: "69%",
    ranks: {
      "7D": { Followers: 7, PnL: 3, "Win rate": 18, Unrealized: 7 },
      "1M": { Followers: 7, PnL: 6, "Win rate": 21, Unrealized: 11 },
    },
  },
  {
    handle: "Clanker_Crypto",
    initials: "CC",
    age: "1h",
    token: "CLANKER",
    tokenName: "Clanker",
    copy: "Agent-native issuance keeps compounding. Added on weakness; the position stays open while creator velocity makes new weekly highs.",
    position: "$71.4K",
    pnl: "+$8.91K",
    likes: 97,
    replies: 14,
    followers: "9.7K",
    winRate: "64%",
    ranks: {
      "7D": { Followers: 54, PnL: 32, "Win rate": 44, Unrealized: 18 },
      "1M": { Followers: 54, PnL: 19, "Win rate": 37, Unrealized: 23 },
    },
  },
  {
    handle: "Dxrnteth",
    initials: "DX",
    age: "2h",
    token: "JUP",
    tokenName: "Jupiter",
    copy: "Cash-flow narratives are returning to Solana infrastructure. Holding the swing while protocol activity remains above last month’s range.",
    position: "$58.7K",
    pnl: "+$6.26K",
    likes: 82,
    replies: 7,
    followers: "25.5K",
    winRate: "74%",
    ranks: {
      "7D": { Followers: 8, PnL: 61, "Win rate": 8, Unrealized: 55 },
      "1M": { Followers: 8, PnL: 34, "Win rate": 5, Unrealized: 47 },
    },
  },
  {
    handle: "admiralfinest",
    initials: "AF",
    age: "3h",
    token: "WIF",
    tokenName: "dogwifhat",
    copy: "No new size yet. The thesis is intact, but I want a clean reclaim before increasing exposure. Existing position remains open.",
    position: "$44.2K",
    pnl: "+$3.72K",
    likes: 61,
    replies: 12,
    followers: "6.2K",
    winRate: "81%",
    ranks: {
      "7D": { Followers: 79, PnL: 88, "Win rate": 3, Unrealized: 76 },
      "1M": { Followers: 79, PnL: 65, "Win rate": 2, Unrealized: 68 },
    },
  },
];

const commandGroups: CommandGroup[] = [
  {
    label: "Right now",
    commands: [
      { value: "/now", description: "The three most important things happening" },
      { value: "/catchup 15m", description: "Important changes since you last checked" },
      { value: "/convergence 5m", description: "Tokens drawing several watched traders" },
      { value: "/rotation 10m", description: "Where traders moved from and to" },
      { value: "/unusual", description: "Traders acting differently than usual" },
      { value: "/exits 10m", description: "Important traders who fully exited" },
    ],
  },
  {
    label: "Tokens",
    commands: [
      { value: "/token BAG", description: "The complete trader story for a token" },
      { value: "/origin BAG", description: "Who arrived first and who followed" },
      { value: "/who-in BAG", description: "Who holds, added, reduced, or exited" },
      { value: "/flow BAG 10m", description: "Position changes and theses in order" },
      { value: "/theses BAG", description: "What was said and when" },
      { value: "/thesis @ace BAG", description: "One trader's thesis and position timing" },
      { value: "/thesis-first", description: "Theses published before the trader bought" },
      { value: "/buy-first", description: "Theses published after the trader bought" },
      { value: "/replay BAG", description: "Replay the complete token timeline" },
      { value: "/compare BAG DOG", description: "Compare two tokens across the same traders" },
    ],
  },
  {
    label: "Traders",
    commands: [
      { value: "/trader @ace", description: "Current positions and unusual behavior" },
      { value: "/intent @ace BAG", description: "New position, add, reduction, exit, or return" },
      { value: "/position @ace BAG", description: "Position amount and history" },
      { value: "/moves @ace 30m", description: "Recent moves grouped by meaning" },
      { value: "/compare @ace @rio", description: "Who tends to lead and perform better" },
      { value: "/overlaps @ace", description: "Traders who often enter after this person" },
      { value: "/leaderboard 24h pnl", description: "Rank traders by period and result" },
      { value: "/emerging 24h", description: "New traders providing early information" },
    ],
  },
  {
    label: "My network",
    commands: [
      { value: "/watch @ace", description: "Add a trader to your watchlist" },
      { value: "/mute @ace", description: "Hide a trader from your feed" },
      { value: "/watchlist", description: "Review watched traders" },
      { value: "/group create core", description: "Create a trader group" },
      { value: "/group core add @ace", description: "Add a trader to a group" },
      { value: "/group core now", description: "Show only one group's activity" },
    ],
  },
  {
    label: "Signals and alerts",
    commands: [
      { value: "/why SIGNAL-1842", description: "Explain why a signal was created" },
      { value: "/lifecycle BAG", description: "See what happened after a signal" },
      { value: "/alerts", description: "View or change alert settings" },
      { value: "/alert thesis rank<=20", description: "Create an alert for top-trader theses" },
    ],
  },
];

const commands = commandGroups.flatMap((group) => group.commands);

const commandFilters: { label: string; value: CommandFilter }[] = [
  { label: "All", value: "All" },
  { label: "Now", value: "Right now" },
  { label: "Tokens", value: "Tokens" },
  { label: "Traders", value: "Traders" },
  { label: "Network", value: "My network" },
  { label: "Alerts", value: "Signals and alerts" },
];

const situations: Situation[] = [
  {
    type: "Rotation",
    title: "DOG → BAG",
    age: "2m",
    changed: "Three watched traders reduced DOG and two opened BAG.",
    lead: "@ace",
    sequence: "@ace → 38s @rio → 74s second BAG entry",
    significance: "Same traders moved between tokens in 4m18s",
    state: "DOG: 5 still hold · BAG: 6 still hold",
    command: "/rotation 10m",
  },
  {
    type: "Shared interest",
    title: "BAG",
    age: "4m",
    changed: "Seven watched traders acted in 3m42s: five buys and two theses.",
    lead: "@ace",
    sequence: "@ace → 31s @rio → 17s @kami thesis → second wave",
    significance: "Fastest multi-trader activity in the last hour",
    state: "6 of 7 still hold · 2 added",
    command: "/convergence 5m",
  },
  {
    type: "Early trader exited",
    title: "PENGU",
    age: "9m",
    changed: "The earliest watched buyer sold the rest of the position.",
    lead: "@PoorGoat",
    sequence: "Earliest buyer exited · @theveeman is now earliest active",
    significance: "First full exit by an early trader today",
    state: "Five later traders still hold",
    command: "/who-in PENGU",
  },
  {
    type: "Unusual activity",
    title: "@theveeman",
    age: "14m",
    changed: "Largest first position in 21 days, followed by two adds.",
    lead: "@theveeman",
    sequence: "Opened FARTCOIN → added twice → no reduction",
    significance: "3 open positions instead of the usual 12",
    state: "FARTCOIN is now the largest position",
    command: "/trader @theveeman",
  },
];

const defaultPrompts = [
  "What changed in the last 20 minutes?",
  "What coins are the top 100 traders talking about?",
];

function buildAnalysis(query: string, id: number): Analysis {
  const lower = query.toLowerCase();

  if (lower.startsWith("/now") || lower.startsWith("/catchup") || lower.includes("what changed")) {
    return {
      id,
      query,
      heading: "Important changes — last 20 minutes",
      summary: "Three situations stand out across your watched traders.",
      facts: [
        "BAG — 6 traders opened positions; @ace was first and 5 still hold",
        "DOG → BAG — 3 traders reduced DOG and moved into BAG",
        "@theveeman — largest first position in 21 days; added twice",
      ],
      evidence: "Watched traders · positions and activity checked 2m ago",
    };
  }

  if (lower.startsWith("/intent")) {
    return {
      id,
      query,
      heading: "@ace → BAG: new position",
      summary: "This was a new position, not an add to an existing one.",
      facts: [
        "First buy: 14.2 SOL · 2.8× the trader's usual first position",
        "Largest first position this week · first watched trader in",
        "Still holds the full position · no thesis posted yet",
      ],
      evidence: "Trade history and current position",
    };
  }

  if (lower.startsWith("/origin")) {
    return {
      id,
      query,
      heading: "Who found BAG first",
      summary: "@ace opened first. @rio followed 31 seconds later, before the first thesis appeared.",
      facts: [
        "First watched entry: @ace at 14:31:08",
        "First thesis: @kami, 56 seconds later",
        "Likely order: @ace → @rio → @kami → @zero",
      ],
      evidence: "Entry times, thesis times, and current positions",
    };
  }

  if (lower.startsWith("/who-in")) {
    return {
      id,
      query,
      heading: "Who still holds BAG",
      summary: "All four original traders retain a position, but two have started reducing.",
      facts: [
        "@ace — earliest · holds 100% · added twice",
        "@rio — second · holds 74% · reduced once",
        "@kami — third · holds 100% · unchanged",
      ],
      evidence: "4 entered · 4 still hold · 2 reducing",
    };
  }

  if (lower.startsWith("/flow") || lower.startsWith("/replay")) {
    return {
      id,
      query,
      heading: "BAG — trader timeline",
      summary: "One early buyer was followed by a second wave of traders and a buy-first thesis.",
      facts: [
        "14:31:08 @ace opened · +31s @rio opened",
        "+48s @kami posted a thesis · +1m04s @kami opened",
        "+2m19s @zero opened · @ace and @rio later added",
      ],
      evidence: "4 entered · 4 still hold · no full exits",
    };
  }

  if (lower.startsWith("/rotation")) {
    return {
      id,
      query,
      heading: "Trader move: DOG → BAG",
      summary: "Two traders reduced DOG and opened BAG within 74 seconds. @ace started the move.",
      facts: [
        "@ace — sold 82% of DOG · opened BAG 38 seconds later",
        "@rio — reduced DOG by 51% · opened BAG 74 seconds later",
        "DOG active holders: 9 → 5 · BAG: 1 → 6",
      ],
      evidence: "Same traders · 4m18s window",
    };
  }

  if (lower.startsWith("/exits")) {
    return {
      id,
      query,
      heading: "Recent full exits",
      summary: "One early trader fully exited while later entrants remain positioned.",
      facts: [
        "PENGU — @PoorGoat sold the remaining position 9m ago",
        "Five later entrants still hold · @theveeman is now earliest active",
        "No other watched first mover fully exited in this window",
      ],
      evidence: "Closed positions · last 10 minutes",
    };
  }

  if (lower.startsWith("/trader") || lower.startsWith("/unusual") || lower.startsWith("/moves")) {
    return {
      id,
      query,
      heading: "Behavior change — @theveeman",
      summary: "The trader is unusually concentrated compared with their own recent behavior.",
      facts: [
        "Usually 12 open positions · currently 3",
        "First FARTCOIN position was 2.9× the usual starting size",
        "Held 21 minutes · added twice · has not reduced",
      ],
      evidence: "Compared with the trader's own 30-day history",
    };
  }

  if (lower.startsWith("/theses") || lower.startsWith("/thesis") || lower.startsWith("/buy-first")) {
    return {
      id,
      query,
      heading: "BAG thesis timing",
      summary: "@ace bought before posting; @kami posted before buying.",
      facts: [
        "@ace — position opened 2m11s before the thesis",
        "@kami — thesis posted 48s before the first buy",
        "Four watched traders entered after the first thesis",
      ],
      evidence: "Thesis and trade timeline · current holdings checked",
    };
  }

  if (lower.startsWith("/emerging")) {
    return {
      id,
      query,
      heading: "Emerging traders — 24 hours",
      summary: "These traders repeatedly appeared early before broader watched-trader activity.",
      facts: [
        "@neo — first or second in 6 tokens · median lead 94s",
        "@kai — 5 theses before buying · 3 drew follow-on activity",
        "@zerox — strong closed PnL · useful as confirmation, not discovery",
      ],
      evidence: "Entry order, thesis timing, holdings, and closed results",
    };
  }

  if (lower.startsWith("/leaderboard") || lower.startsWith("/top")) {
    return {
      id,
      query,
      heading: "Top traders — 24 hours",
      summary: "Ranked by PnL with win rate and trade count shown for context.",
      facts: [
        "@PoorGoat — +$260.3K · 78% win rate · 34 trades",
        "@theveeman — +$225.1K · 72% win rate · 51 trades",
        "@MemeKingdom — +$180.6K · 69% win rate · 47 trades",
      ],
      evidence: "Leaderboard checked at 14:32 UTC",
    };
  }

  if (lower.startsWith("/convergence") || lower.startsWith("/token") || lower.includes("what coins")) {
    return {
      id,
      query,
      heading: "Tokens drawing several top traders",
      summary: "BAG has the fastest new activity; PENGU has the broadest thesis agreement; BONK has the steadiest holders.",
      facts: [
        "BAG — 7 traders acted in 3m42s · 6 still hold",
        "PENGU — 6 theses · 4 thesis authors still hold · 82% positive",
        "BONK — 4 theses · all 4 traders still hold",
      ],
      evidence: "Top 100 traders · last 24 hours",
    };
  }

  if (lower.startsWith("/watch") || lower.startsWith("/mute") || lower.startsWith("/group") || lower.startsWith("/alerts") || lower.startsWith("/alert")) {
    return {
      id,
      query,
      heading: "Watchlist and alerts",
      summary: "Your watched traders define which activity appears in updates and shared-interest signals.",
      facts: [
        "12 watched traders · 1 muted trader",
        "Core group — 5 traders · 8 important changes today",
        "Alerts enabled for full exits, rotations, and new theses",
      ],
      evidence: "Preview settings · no account changes were made",
    };
  }

  if (lower.startsWith("/why") || lower.startsWith("/lifecycle")) {
    return {
      id,
      query,
      heading: "Why this signal appeared",
      summary: "The signal combines trader quality, current position state, and confirmation from other watched traders.",
      facts: [
        "Top-ranked trader started the move",
        "Position remains open and was increased",
        "Three other watched traders followed · liquidity slightly below target",
      ],
      evidence: "Every scoring reason is shown; no hidden ranking factor",
    };
  }

  return {
    id,
    query,
    heading: "Research summary",
    summary: "I checked ranked traders, recent theses, and current positions for this question.",
    facts: [
      "PENGU has the broadest thesis agreement among the selected trader group",
      "No watched early trader fully exited in the selected window",
      "Type / to explore token, trader, and watchlist commands",
    ],
    evidence: "Preview response · data checked 2 minutes ago",
  };
}

export default function Home() {
  const [cohort, setCohort] = useState<Cohort>(20);
  const [rankBy, setRankBy] = useState<RankMetric>("PnL");
  const [window, setWindow] = useState<Window>("7D");
  const [feedMode, setFeedMode] = useState<FeedMode>("Updates");
  const [selectedHandle, setSelectedHandle] = useState("PoorGoat");
  const [query, setQuery] = useState("");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandFilter, setCommandFilter] = useState<CommandFilter>("All");
  const [commandIndex, setCommandIndex] = useState(0);
  const conversationRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);

  const visibleTheses = useMemo(
    () => theses
      .filter((thesis) => thesis.ranks[window][rankBy] <= cohort)
      .sort((a, b) => a.ranks[window][rankBy] - b.ranks[window][rankBy]),
    [cohort, rankBy, window],
  );

  const selectedThesis = theses.find((thesis) => thesis.handle === selectedHandle) ?? theses[0];

  const filteredCommandGroups = commandFilter === "All"
    ? commandGroups
    : commandGroups.filter((group) => group.label === commandFilter);

  const filteredCommandCount = filteredCommandGroups.reduce((total, group) => total + group.commands.length, 0);

  const visibleCommands = useMemo(() => {
    const typed = query.trim().toLowerCase();
    if (!typed.startsWith("/") || typed === "/") return commands;
    return commands.filter((command) => command.value.toLowerCase().startsWith(typed));
  }, [query]);

  useEffect(() => {
    if (!analyses.length) return;
    const conversation = conversationRef.current;
    conversation?.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
  }, [analyses]);

  useEffect(() => {
    if (!commandsOpen) return;
    commandListRef.current
      ?.querySelector<HTMLElement>("[aria-selected='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [commandIndex, commandsOpen]);

  function runQuery(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    setAnalyses((current) => [...current, buildAnalysis(trimmed, Date.now())]);
    setQuery("");
    setCommandsOpen(false);
  }

  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runQuery(query);
  }

  function chooseCommand(command: string) {
    setQuery(command);
    setCommandsOpen(false);
    setShortcutsOpen(false);
    setCommandIndex(0);
    requestAnimationFrame(() => document.getElementById("message")?.focus());
  }

  function updateQuery(value: string) {
    setQuery(value);
    setCommandIndex(0);
    setCommandsOpen(value.startsWith("/") && (!query.startsWith("/") || commandsOpen));
  }

  function handleComposerKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!commandsOpen || !visibleCommands.length) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setCommandsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setCommandIndex((current) => (current + direction + visibleCommands.length) % visibleCommands.length);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setCommandIndex(event.key === "Home" ? 0 : visibleCommands.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      chooseCommand(visibleCommands[commandIndex]?.value ?? visibleCommands[0].value);
    }
  }

  return (
    <main className="product-shell">
      <header className="topbar">
        <div className="brand" aria-label="FOMO Thesis Scout">
          <span className="brand-word">fomo</span>
          <span className="brand-divider" />
          <span className="product-name">Thesis Scout</span>
        </div>
        <div className="live-state"><span /> Preview data · 14:32 UTC</div>
      </header>

      <div className="workspace">
        <aside className="feed-pane" aria-label="FOMO trader activity feed">
          <div className="pane-heading">
            <div>
              <p className="eyebrow">LIVE FEED</p>
              <h1>{feedMode === "Updates" ? "Important updates" : "Trader theses"}</h1>
            </div>
            <div className="pane-tools">
              <span className="result-count">{feedMode === "Updates" ? situations.length : visibleTheses.length} shown</span>
              <div aria-label="Feed view" className="feed-mode-switch" role="group">
                {(["Updates", "Theses"] as FeedMode[]).map((mode) => (
                  <button aria-pressed={feedMode === mode} className={feedMode === mode ? "selected" : ""} key={mode} onClick={() => setFeedMode(mode)}>{mode}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-toolbar" aria-label="Thesis ranking filters">
            <div className="toolbar-control cohort-control">
              <span className="toolbar-label">Top traders</span>
              <div className="content-switcher" aria-label="Top-trader group" role="group">
                {([100, 50, 20] as Cohort[]).map((value) => (
                  <button aria-pressed={cohort === value} className={cohort === value ? "selected" : ""} key={value} onClick={() => setCohort(value)}>Top {value}</button>
                ))}
              </div>
            </div>
            <label className="toolbar-control sort-control">
              <span className="toolbar-label">Rank by</span>
              <select value={rankBy} onChange={(event) => setRankBy(event.target.value as RankMetric)}>
                {(["Followers", "PnL", "Win rate", "Unrealized"] as RankMetric[]).map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <div className="toolbar-control period-control">
              <span className="toolbar-label">Period</span>
              <div className="content-switcher" aria-label="Ranking window" role="group">
                {(["7D", "1M"] as Window[]).map((value) => (
                  <button aria-pressed={window === value} className={window === value ? "selected" : ""} key={value} onClick={() => setWindow(value)}>{value}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="feed-list">
            {feedMode === "Updates" ? situations.map((situation) => (
              <article className="situation-row" key={`${situation.type}-${situation.title}`}>
                <div className="situation-heading">
                  <span>{situation.type}</span>
                  <strong>{situation.title}</strong>
                  <time>{situation.age}</time>
                </div>
                <p>{situation.changed}</p>
                <dl>
                  <div><dt>Led by</dt><dd>{situation.lead}</dd></div>
                  <div><dt>Then</dt><dd>{situation.sequence}</dd></div>
                  <div><dt>Why it matters</dt><dd>{situation.significance}</dd></div>
                  <div><dt>Now</dt><dd>{situation.state}</dd></div>
                </dl>
                <button onClick={() => chooseCommand(situation.command)}>Open in chat</button>
              </article>
            )) : visibleTheses.length ? visibleTheses.map((thesis) => {
              const rank = thesis.ranks[window][rankBy];
              return (
                <article className={`thesis-row ${selectedHandle === thesis.handle ? "active" : ""}`} key={thesis.handle}>
                  <button className="thesis-select" onClick={() => setSelectedHandle(thesis.handle)}>
                    <div className="thesis-author">
                      <span className="rank-cell">{rank}</span>
                      <div className="avatar">{thesis.initials}</div>
                      <div className="author-copy">
                        <div className="author-line">
                          <strong>@{thesis.handle}</strong>
                          <span className="thesis-badge">Thesis</span>
                          <time>{thesis.age}</time>
                        </div>
                        <span className="rank-line">Top {cohort} · {window} {rankBy}</span>
                      </div>
                    </div>
                    <p className="thesis-copy">{thesis.copy}</p>
                    <div className="position-row">
                      <strong>{thesis.token}</strong>
                      <span>{thesis.tokenName} · Open · {thesis.position}</span>
                      <b>{thesis.pnl}</b>
                    </div>
                  </button>
                  <div className="engagement">
                    <span>{thesis.likes} likes</span>
                    <span>{thesis.replies} replies</span>
                    <button onClick={() => { setSelectedHandle(thesis.handle); chooseCommand(`/theses trader @${thesis.handle}`); }}>Use in chat</button>
                  </div>
                </article>
              );
            }) : (
              <div className="filtered-empty">
                <strong>No theses match these filters</strong>
                <span>Choose more traders or another ranking method.</span>
              </div>
            )}
          </div>
        </aside>

        <section className="chat-pane" aria-label="FOMO analysis chat">
          <div className="chat-heading">
            <div>
              <p className="eyebrow">ANALYSIS</p>
              <h2>Ask the market</h2>
            </div>
            <div className="chat-actions">
              <button className="quiet-button" onClick={() => setShortcutsOpen(true)}>Shortcuts</button>
              <button className="quiet-button" onClick={() => setAnalyses([])}>Clear</button>
            </div>
          </div>

          <div className="conversation" aria-live="polite" ref={conversationRef}>
            {analyses.map((analysis) => (
              <div className="analysis-turn" key={analysis.id}>
                <div className="query-row"><span>You asked</span><code>{analysis.query}</code></div>
                <div className="analysis-result">
                  <div className="response-meta"><span>Thesis Scout</span><time>Now</time></div>
                  <h3>{analysis.heading}</h3>
                  <p>{analysis.summary}</p>
                  <ul>{analysis.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
                  <div className="evidence-line"><span>{analysis.evidence}</span><button onClick={() => chooseCommand("/why SIGNAL-1842")}>Explain</button></div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-dock">
            <div className="query-guide">
              <div className="query-guide-copy">
                <span className="context-label">TOP {cohort} · {window} {rankBy.toUpperCase()} · LAST 24H</span>
                <strong>Ask about traders, tokens, and recent moves</strong>
                <p>Every answer shows who acted, what changed, and who still holds.</p>
              </div>
              <div className="prompt-list" aria-label="Suggested questions">
                <span>Suggested</span>
                {defaultPrompts.map((prompt) => <button key={prompt} onClick={() => runQuery(prompt)}>{prompt}</button>)}
              </div>
            </div>

            <div className="assistant-response">
              <div className="response-meta"><span>Thesis Scout</span><time>Now</time></div>
              <p>Three important situations developed across your watched traders.</p>
              <ol className="signal-list">
                <li><div><span className="signal-rank">01</span><strong>BAG</strong><small>Several traders moving in</small></div><div className="signal-proof"><strong>7 traders</strong><span>6 still hold · @ace first</span></div></li>
                <li><div><span className="signal-rank">02</span><strong>DOG → BAG</strong><small>Trader rotation</small></div><div className="signal-proof"><strong>3 traders</strong><span>Move completed in 4m18s</span></div></li>
                <li><div><span className="signal-rank">03</span><strong>@theveeman</strong><small>Unusual activity</small></div><div className="signal-proof"><strong>Largest start in 21d</strong><span>Added twice · no reduction</span></div></li>
              </ol>
              <div className="evidence-line"><span>Based on watched-trader activity and current positions</span><button onClick={() => chooseCommand("/catchup 20m")}>Open catch-up</button></div>
            </div>
          </div>

          <form className="composer" onSubmit={submitQuery}>
            <div className="composer-inner">
              {commandsOpen && query.startsWith("/") && (
                <div className="slash-menu" aria-label="Available commands">
                  <div className="slash-menu-heading">
                    <span>Commands</span>
                    <small>{visibleCommands.length ? `${Math.min(5, visibleCommands.length)} shown · ${visibleCommands.length} total` : "No matches"}</small>
                  </div>
                  <div aria-label="Commands" className="slash-command-list" id="command-menu" ref={commandListRef} role="listbox">
                    {visibleCommands.map((command, index) => (
                      <button
                        id={`command-option-${index}`}
                        aria-selected={commandIndex === index}
                        className={commandIndex === index ? "selected" : ""}
                        key={command.value}
                        onClick={() => chooseCommand(command.value)}
                        onMouseEnter={() => setCommandIndex(index)}
                        role="option"
                        tabIndex={-1}
                        type="button"
                      >
                        <code>{command.value}</code>
                        <span>{command.description}</span>
                      </button>
                    ))}
                    {!visibleCommands.length && <p className="command-empty">No command starts with “{query}”.</p>}
                  </div>
                </div>
              )}
              <label htmlFor="message">Ask about traders, tokens, positions, or recent moves</label>
              <div className="composer-row">
                <input
                  aria-activedescendant={commandsOpen && visibleCommands.length ? `command-option-${commandIndex}` : undefined}
                  aria-autocomplete="list"
                  aria-controls={commandsOpen ? "command-menu" : undefined}
                  aria-expanded={commandsOpen}
                  aria-haspopup="listbox"
                  autoComplete="off"
                  id="message"
                  onChange={(event) => updateQuery(event.target.value)}
                  onKeyDown={handleComposerKey}
                  placeholder="Ask a question or type / for commands"
                  role="combobox"
                  spellCheck={false}
                  value={query}
                />
                <button disabled={!query.trim()} type="submit">Send</button>
              </div>
              <span className="composer-hint">Context: @{selectedThesis.handle} · {selectedThesis.token} · Preview data, not financial advice</span>
            </div>
          </form>
        </section>

        <aside aria-label="Command shortcuts" className={`shortcut-pane ${shortcutsOpen ? "open" : ""}`}>
          <div className="shortcut-heading">
            <div>
              <p className="eyebrow">SHORTCUTS</p>
              <h2>All commands</h2>
            </div>
            <button aria-label="Close shortcuts" onClick={() => setShortcutsOpen(false)}>Close</button>
          </div>
          <p className="shortcut-intro">Choose a command to add it to chat. Type <code>/</code> to search instead.</p>
          <div aria-label="Filter commands" className="shortcut-filters" role="group">
            {commandFilters.map((filter) => (
              <button
                aria-pressed={commandFilter === filter.value}
                className={commandFilter === filter.value ? "selected" : ""}
                key={filter.value}
                onClick={() => setCommandFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="shortcut-count">{filteredCommandCount} commands</div>
          <nav className="shortcut-groups">
            {filteredCommandGroups.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                {group.commands.map((command) => (
                  <button key={command.value} onClick={() => chooseCommand(command.value)}>
                    <code>{command.value}</code>
                    <span>{command.description}</span>
                  </button>
                ))}
              </section>
            ))}
          </nav>
        </aside>
        {shortcutsOpen && <button aria-label="Close shortcuts" className="shortcut-backdrop" onClick={() => setShortcutsOpen(false)} />}
      </div>
    </main>
  );
}
