"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type RankMetric = "Followers" | "PnL" | "Win rate" | "Unrealized";
type Window = "7D" | "1M";
type Cohort = 20 | 50 | 100;

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
  accent: string;
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
    accent: "ice",
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
    accent: "gold",
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
    accent: "orange",
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
    accent: "violet",
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
    accent: "blue",
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
    accent: "coral",
    followers: "6.2K",
    winRate: "81%",
    ranks: {
      "7D": { Followers: 79, PnL: 88, "Win rate": 3, Unrealized: 76 },
      "1M": { Followers: 79, PnL: 65, "Win rate": 2, Unrealized: 68 },
    },
  },
];

const commands = [
  ["/top 7d 10", "Rank traders by timeframe"],
  ["/trader @PoorGoat", "Inspect one trader"],
  ["/theses latest 10", "Find recent conviction"],
  ["/theses token PENGU", "Summarize token theses"],
  ["/token PENGU", "Open token intelligence"],
  ["/positions @PoorGoat", "Review open positions"],
  ["/position @PoorGoat PENGU", "Trace a position lifecycle"],
  ["/activity PENGU 24h", "Read chronological activity"],
  ["/convergence 24h", "Find shared conviction"],
  ["/compare PENGU BONK", "Compare tokens or traders"],
  ["/why SIGNAL-1842", "Explain a signal score"],
  ["/lifecycle PENGU", "Review post-signal changes"],
  ["/watchlist", "Review watched traders"],
  ["/watch add @PoorGoat", "Pin a trader"],
  ["/alerts", "Review alert rules"],
  ["/alert thesis rank<=20", "Create a thesis alert"],
] as const;

const defaultPrompts = [
  "What coins are the top 100 traders on FOMO talking about?",
  "Break down the top 10 theses from the last 24h",
];

function buildAnalysis(query: string, id: number): Analysis {
  const lower = query.toLowerCase();

  if (lower.startsWith("/top")) {
    return {
      id,
      query,
      heading: "Top traders — 7D",
      summary: "Ranked by net PnL, with win rate and sample size kept visible so short streaks do not look equivalent to durable performance.",
      facts: [
        "@PoorGoat — +$260.3K · 78% WR · 34 trades",
        "@theveeman — +$225.1K · 72% WR · 51 trades",
        "@MemeKingdom — +$180.6K · 69% WR · 47 trades",
      ],
      evidence: "Leaderboard snapshot · 14:32 UTC",
    };
  }

  if (lower.includes("break down") || lower.startsWith("/theses")) {
    return {
      id,
      query,
      heading: "Thesis brief — last 24h",
      summary: "The strongest repeated argument is consumer distribution, followed by AI-attention beta and Solana infrastructure cash flow.",
      facts: [
        "PENGU — 6 theses · 4 authors still hold · conviction strengthening",
        "FARTCOIN — 5 theses · 3 position increases · high volatility",
        "BONK — 4 theses · broad agreement · no watched exits",
      ],
      evidence: "31 theses · 18 ranked traders · positions checked 2m ago",
    };
  }

  if (lower.startsWith("/trader") || lower.startsWith("/positions")) {
    return {
      id,
      query,
      heading: "@PoorGoat — trader profile",
      summary: "A high-consistency 7D leader with six open positions and three strong theses this week.",
      facts: [
        "7D rank #1 · +$260.3K net PnL",
        "78% win rate across 34 closed trades",
        "PENGU remains open · $242.6K visible value · +$23.23K unrealized",
      ],
      evidence: "Profile, leaderboard, theses, and balance snapshots",
    };
  }

  if (lower.startsWith("/why")) {
    return {
      id,
      query,
      heading: "Why SIGNAL-1842 scored 87",
      summary: "The score is driven by source quality, explicit conviction, a still-open position, and independent confirmation.",
      facts: [
        "+25 · Thesis from 7D rank #4",
        "+20 · Clear catalyst and high conviction",
        "+37 · Open position plus three-trader convergence · −3 liquidity risk",
      ],
      evidence: "Score components are inspectable; no hidden ranking factor",
    };
  }

  if (lower.startsWith("/convergence") || lower.startsWith("/token") || lower.includes("what coins")) {
    return {
      id,
      query,
      heading: "Ranked-trader token consensus",
      summary: "PENGU leads current discussion breadth; FARTCOIN has the fastest position growth; BONK has the most stable holder agreement.",
      facts: [
        "PENGU — 6 theses · 4 open sources · 82% bullish",
        "FARTCOIN — 5 theses · 3 increases · $184K largest visible source",
        "BONK — 4 theses · 4 still hold · 71% bullish",
      ],
      evidence: "Top 100 · 7D PnL · last 24h",
    };
  }

  return {
    id,
    query,
    heading: "Evidence-linked analysis",
    summary: "I matched the request against ranked traders, recent theses, and current position state.",
    facts: [
      "PENGU has the broadest thesis agreement among the selected cohort",
      "No watched source exit was detected in the current window",
      "Use /why SIGNAL-1842 for the complete score breakdown",
    ],
    evidence: "Demo response · source freshness 2m",
  };
}

export default function Home() {
  const [cohort, setCohort] = useState<Cohort>(20);
  const [rankBy, setRankBy] = useState<RankMetric>("PnL");
  const [window, setWindow] = useState<Window>("7D");
  const [selectedHandle, setSelectedHandle] = useState("PoorGoat");
  const [query, setQuery] = useState("");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [commandsOpen, setCommandsOpen] = useState(false);
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

  const visibleCommands = useMemo(() => {
    const typed = query.trim().toLowerCase();
    if (!typed.startsWith("/") || typed === "/") return commands;
    return commands.filter(([command]) => command.toLowerCase().startsWith(typed));
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
  }

  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runQuery(query);
  }

  function chooseCommand(command: string) {
    setQuery(command);
    setCommandsOpen(false);
    setCommandIndex(0);
    requestAnimationFrame(() => document.getElementById("message")?.focus());
  }

  function updateQuery(value: string) {
    setQuery(value);
    setCommandIndex(0);
    setCommandsOpen(value.startsWith("/"));
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

    if (event.key === "Enter") {
      event.preventDefault();
      chooseCommand(visibleCommands[commandIndex]?.[0] ?? visibleCommands[0][0]);
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
        <div className="live-state"><span /> Live data · 14:32 UTC</div>
      </header>

      <div className="workspace">
        <aside className="feed-pane" aria-label="FOMO thesis feed">
          <div className="pane-heading">
            <div>
              <p className="eyebrow">LIVE FEED</p>
              <h1>Trader theses</h1>
            </div>
            <span className="result-count">{visibleTheses.length} matching</span>
          </div>

          <div className="filter-stack" aria-label="Thesis ranking filters">
            <div className="filter-row">
              <span className="filter-label">Cohort</span>
              <div className="segments" aria-label="Trader cohort">
                {([100, 50, 20] as Cohort[]).map((value) => (
                  <button aria-pressed={cohort === value} className={cohort === value ? "selected" : ""} key={value} onClick={() => setCohort(value)}>Top {value}</button>
                ))}
              </div>
            </div>
            <div className="filter-row filter-row-scroll">
              <span className="filter-label">Rank by</span>
              <div className="filter-options">
                {(["Followers", "PnL", "Win rate", "Unrealized"] as RankMetric[]).map((value) => (
                  <button aria-pressed={rankBy === value} className={rankBy === value ? "selected" : ""} key={value} onClick={() => setRankBy(value)}>{value}</button>
                ))}
              </div>
            </div>
            <div className="filter-row compact">
              <span className="filter-label">Window</span>
              <div className="segments narrow" aria-label="Ranking window">
                {(["7D", "1M"] as Window[]).map((value) => (
                  <button aria-pressed={window === value} className={window === value ? "selected" : ""} key={value} onClick={() => setWindow(value)}>{value}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="feed-list">
            {visibleTheses.length ? visibleTheses.map((thesis) => {
              const rank = thesis.ranks[window][rankBy];
              return (
                <article
                  className={`thesis-card ${selectedHandle === thesis.handle ? "active" : ""}`}
                  key={thesis.handle}
                >
                  <div className="thesis-author">
                    <div className={`avatar ${thesis.accent}`}>{thesis.initials}</div>
                    <div className="author-copy">
                      <div className="author-line">
                        <strong>@{thesis.handle}</strong>
                        <span className="thesis-badge">Thesis</span>
                        <time>{thesis.age}</time>
                      </div>
                      <span className="rank-line">#{rank} · Top {cohort} by {window} {rankBy}</span>
                    </div>
                  </div>
                  <p className="thesis-copy">{thesis.copy}</p>
                  <div className="position-card">
                    <div className={`token-mark ${thesis.accent}`}>{thesis.token.slice(0, 2)}</div>
                    <div className="token-copy">
                      <strong>{thesis.token}</strong>
                      <span>{thesis.tokenName} · Open</span>
                    </div>
                    <div className="position-value">
                      <strong>{thesis.position}</strong>
                      <span>{thesis.pnl}</span>
                    </div>
                  </div>
                  <div className="engagement">
                    <span>♡ {thesis.likes}</span>
                    <span>{thesis.replies} replies</span>
                    <button onClick={() => { setSelectedHandle(thesis.handle); chooseCommand(`/theses trader @${thesis.handle}`); }}>Use in chat</button>
                  </div>
                </article>
              );
            }) : (
              <div className="filtered-empty">
                <strong>No theses match this cohort</strong>
                <span>Choose a broader cohort or another ranking metric.</span>
              </div>
            )}
          </div>
        </aside>

        <section className="chat-pane" aria-label="Thesis analysis chat">
          <div className="chat-heading">
            <div>
              <p className="eyebrow">ANALYSIS</p>
              <h2>Ask the market</h2>
            </div>
            <div className="chat-actions">
              <button className="quiet-button" onClick={() => { setQuery("/"); setCommandsOpen(true); setCommandIndex(0); requestAnimationFrame(() => document.getElementById("message")?.focus()); }}>Commands</button>
              <button className="quiet-button" onClick={() => setAnalyses([])}>Clear</button>
            </div>
          </div>

          <div className="conversation" aria-live="polite" ref={conversationRef}>
            <div className="welcome-block">
              <span className="context-label">TOP {cohort} · {window} {rankBy.toUpperCase()} · LAST 24H</span>
              <h3>What are FOMO&apos;s best traders talking about?</h3>
              <p>Ask naturally or use a command. Every answer stays linked to the traders, theses, and live positions behind it.</p>
              <div className="prompt-pair">
                {defaultPrompts.map((prompt) => <button key={prompt} onClick={() => runQuery(prompt)}>{prompt}</button>)}
              </div>
            </div>

            <div className="assistant-response">
              <div className="response-meta"><span>Thesis Scout</span><time>Now</time></div>
              <p>Top traders are clustering around three themes: consumer memes, AI-linked attention trades, and Solana beta.</p>
              <ol className="signal-list">
                <li><div><span className="signal-rank">01</span><strong>PENGU</strong><small>Consumer crypto</small></div><div className="signal-proof"><strong>6 theses</strong><span>4 still hold · 82% bullish</span></div></li>
                <li><div><span className="signal-rank">02</span><strong>FARTCOIN</strong><small>AI meme beta</small></div><div className="signal-proof"><strong>5 theses</strong><span>3 increased · 76% bullish</span></div></li>
                <li><div><span className="signal-rank">03</span><strong>BONK</strong><small>Solana beta</small></div><div className="signal-proof"><strong>4 theses</strong><span>4 still hold · 71% bullish</span></div></li>
              </ol>
              <div className="evidence-line"><span>Based on 31 theses from 18 ranked traders</span><button onClick={() => chooseCommand("/theses latest 31")}>View evidence</button></div>
            </div>

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

          <form className="composer" onSubmit={submitQuery}>
            <div className="composer-inner">
              {commandsOpen && query.startsWith("/") && (
                <div className="slash-menu" aria-label="Available commands">
                  <div className="slash-menu-heading">
                    <span>Commands</span>
                    <small>{visibleCommands.length ? `${Math.min(5, visibleCommands.length)} shown · ${visibleCommands.length} total` : "No matches"}</small>
                  </div>
                  <div className="slash-command-list" id="command-menu" ref={commandListRef} role="listbox">
                    {visibleCommands.map(([command, description], index) => (
                      <button
                        aria-selected={commandIndex === index}
                        className={commandIndex === index ? "selected" : ""}
                        key={command}
                        onClick={() => chooseCommand(command)}
                        onMouseEnter={() => setCommandIndex(index)}
                        role="option"
                        type="button"
                      >
                        <code>{command}</code>
                        <span>{description}</span>
                      </button>
                    ))}
                    {!visibleCommands.length && <p className="command-empty">No command starts with “{query}”.</p>}
                  </div>
                </div>
              )}
              <label htmlFor="message">Ask about traders, tokens, positions, or signals</label>
              <div className="composer-row">
                <input
                  aria-controls={commandsOpen ? "command-menu" : undefined}
                  aria-expanded={commandsOpen}
                  aria-haspopup="listbox"
                  autoComplete="off"
                  id="message"
                  onChange={(event) => updateQuery(event.target.value)}
                  onKeyDown={handleComposerKey}
                  placeholder="Ask a question or type / for commands"
                  value={query}
                />
                <button disabled={!query.trim()} type="submit">Send</button>
              </div>
              <span className="composer-hint">Context: @{selectedThesis.handle} · {selectedThesis.token} · Demo data, not financial advice</span>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
