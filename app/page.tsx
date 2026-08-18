"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Bot,
  Braces,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  Copy,
  Database,
  Eye,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  ListFilter,
  Menu,
  MessageCircle,
  Radar,
  Radio,
  RadioTower,
  Route,
  Send,
  ShieldCheck,
  Terminal,
  Trophy,
  Users,
  WalletCards,
  Webhook,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Period = "24H" | "7D" | "30D" | "ALL";
type CodeLanguage = "curl" | "javascript";

type Leader = {
  rank: string;
  handle: string;
  wallet: string;
  followers?: string;
  pnl: string;
  bar: number;
};

type ActivityItem = {
  kind: "buy" | "sell" | "thesis";
  handle: string;
  token: string;
  amount: string;
  age: string;
  result?: string;
  thesis?: string;
};

type ExplorerItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  question: string;
  summary: string;
  endpoint: string;
  proof: Array<{ label: string; value: string; note: string }>;
};

type UseCase = {
  id: string;
  label: string;
  icon: LucideIcon;
  heading: string;
  summary: string;
  source: string;
  operation: string;
  output: string;
  endpoints: string[];
  proof: string;
};

const leaders: Leader[] = [
  { rank: "01", handle: "@SerAvocado", wallet: "BgKj…G1UW", followers: "65,578", pnl: "+$489.0K", bar: 100 },
  { rank: "02", handle: "@Quanterty", wallet: "Bj6u…MyfY", followers: "94,548", pnl: "+$378.7K", bar: 77 },
  { rank: "03", handle: "@MemeKingdom", wallet: "85nH…4CKU", followers: "72,761", pnl: "+$319.1K", bar: 65 },
  { rank: "04", handle: "@397397", wallet: "A8sn…fEhj", followers: "43,947", pnl: "+$318.2K", bar: 65 },
  { rank: "05", handle: "@Dxranteth", wallet: "6Yz7…AJf5", pnl: "+$315.6K", bar: 64 },
  { rank: "06", handle: "@fmpumpguy", wallet: "6FYw…Kv9b", pnl: "+$294.5K", bar: 60 },
  { rank: "07", handle: "@Rowdy", wallet: "6Y3j…VDYA", pnl: "+$280.8K", bar: 57 },
  { rank: "08", handle: "@theveeman", wallet: "3Gq2…a7LF", pnl: "+$225.1K", bar: 46 },
];

const liveActivity: ActivityItem[] = [
  { kind: "buy", handle: "@xindaee", token: "67COIN", amount: "$1.6K", age: "1m" },
  { kind: "thesis", handle: "@lonekyro", token: "ONYX", amount: "$51.3K", age: "1m", thesis: "Battle tested overnight. Conviction remains open." },
  { kind: "buy", handle: "@Themonkequant", token: "ANSEM", amount: "$1.9K", age: "1m" },
  { kind: "sell", handle: "@_Cats_96", token: "PUMP", amount: "$2.9K", age: "2m", result: "+$15.7" },
  { kind: "buy", handle: "@PaikCapital", token: "PUMP", amount: "$42.3K", age: "3m" },
  { kind: "sell", handle: "@sologuy", token: "67", amount: "$0", age: "3m", result: "+$661" },
  { kind: "sell", handle: "@cometcalls", token: "BULLSHIT", amount: "$3.0K", age: "3m", result: "−$3.0K" },
  { kind: "sell", handle: "@countzero", token: "CATE", amount: "$2.6K", age: "3m", result: "−$10.3" },
];

const explorerItems: ExplorerItem[] = [
  {
    id: "leaderboards",
    label: "Leaderboards",
    icon: Trophy,
    question: "Who is outperforming now?",
    summary: "Rank traders or clans across 1D, 7D, 30D, and all-time windows with the performance context needed to compare them.",
    endpoint: "GET /traders?window=7d",
    proof: [
      { label: "Rank", value: "#01", note: "Current order" },
      { label: "Net PnL", value: "+$489K", note: "7-day result" },
      { label: "Identity", value: "Wallet + handle", note: "Stable source" },
    ],
  },
  {
    id: "activity",
    label: "Live activity",
    icon: Radio,
    question: "What changed, and when?",
    summary: "Read buys, sells, swaps, and theses in one ordered tape with trader identity, token, size, chain, and timing attached.",
    endpoint: "GET /events?limit=50",
    proof: [
      { label: "Sequence", value: "1m → now", note: "Ordered events" },
      { label: "Action", value: "Buy / Sell", note: "Explicit state" },
      { label: "Context", value: "$ + chain", note: "Decision-ready" },
    ],
  },
  {
    id: "theses",
    label: "Token theses",
    icon: MessageCircle,
    question: "What are strong traders saying?",
    summary: "Connect the original thesis to its author, token, engagement, timestamp, and the source position that confirms or weakens it.",
    endpoint: "GET /events?type=thesis",
    proof: [
      { label: "Author", value: "Ranked", note: "Source quality" },
      { label: "Position", value: "Open", note: "Behavior check" },
      { label: "Timing", value: "Before / after", note: "Thesis order" },
    ],
  },
  {
    id: "positions",
    label: "Positions & PnL",
    icon: WalletCards,
    question: "Does the source still hold?",
    summary: "Inspect entry, current value, realized and unrealized PnL, reductions, and exits for each watched wallet position.",
    endpoint: "GET /traders/{id}/positions",
    proof: [
      { label: "Entry", value: "$1.5K", note: "Starting value" },
      { label: "Current", value: "$1.2K", note: "Visible exposure" },
      { label: "State", value: "Reduced", note: "Lifecycle" },
    ],
  },
  {
    id: "convergence",
    label: "Convergence",
    icon: Route,
    question: "Who else is moving into the same token?",
    summary: "Detect when several ranked traders focus on one token, then inspect who moved first, who followed, and who still holds.",
    endpoint: "GET /convergence?window=1h",
    proof: [
      { label: "Sources", value: "7 traders", note: "Distinct wallets" },
      { label: "Window", value: "3m42s", note: "Shared activity" },
      { label: "Still hold", value: "6 / 7", note: "Current state" },
    ],
  },
  {
    id: "clans",
    label: "Clans",
    icon: Users,
    question: "Which groups are producing results?",
    summary: "Compare FOMO clans as social trading groups without losing the members and performance that explain each rank.",
    endpoint: "GET /clans?window=7d",
    proof: [
      { label: "Board", value: "79 clans", note: "7-day set" },
      { label: "Members", value: "Per clan", note: "Source group" },
      { label: "Result", value: "Net PnL", note: "Comparable" },
    ],
  },
];

const useCases: UseCase[] = [
  {
    id: "agents",
    label: "Agents",
    icon: Bot,
    heading: "Give every answer market memory.",
    summary: "Ground research agents and copilots in who moved, what they said, and whether conviction remains open.",
    source: "Trader activity",
    operation: "Add evidence",
    output: "Agent answer",
    endpoints: ["GET /traders", "GET /events"],
    proof: "Source-linked context",
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: BellRing,
    heading: "Notify on meaning, not noise.",
    summary: "Trigger Telegram, Slack, Discord, or internal alerts when a ranked source posts, buys, reduces, or exits.",
    source: "Live events",
    operation: "Match rule",
    output: "Alert channel",
    endpoints: ["GET /events", "GET /tokens"],
    proof: "Event-driven delivery",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Gauge,
    heading: "Build private views from clean objects.",
    summary: "Compose private rankings, clan scoreboards, and wallet-level position views without scraping a public interface.",
    source: "Ranked accounts",
    operation: "Aggregate",
    output: "Private view",
    endpoints: ["GET /clans", "GET /traders/{id}/positions"],
    proof: "Normalized JSON",
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: Webhook,
    heading: "Make market events operational.",
    summary: "Add FOMO data to ETL jobs, monitoring systems, newsletters, and research reports as one dependable step.",
    source: "FOMO object",
    operation: "Transform",
    output: "Your pipeline",
    endpoints: ["GET /traders", "GET /events"],
    proof: "One HTTP step",
  },
  {
    id: "trading",
    label: "Trading tools",
    icon: Activity,
    heading: "Put trader intent beside market state.",
    summary: "Use flows, hot tokens, and position changes as documented inputs for a bot, terminal, or execution interface.",
    source: "Flow + positions",
    operation: "Evaluate",
    output: "Decision tool",
    endpoints: ["GET /heat", "GET /tokens"],
    proof: "Structured inputs",
  },
  {
    id: "research",
    label: "Research",
    icon: Clipboard,
    heading: "Publish with the source trail intact.",
    summary: "Turn ordered theses and trader actions into recaps and research while keeping the evidence attached.",
    source: "Theses + moves",
    operation: "Synthesize",
    output: "Research brief",
    endpoints: ["GET /events", "GET /convergence"],
    proof: "Auditable output",
  },
];

const channels = [
  { icon: Globe2, name: "Web dashboard", use: "Watch the tape", setup: "None", action: "Open dashboard", href: "/leaderboard" },
  { icon: Braces, name: "REST API", use: "Build products", setup: "API key", action: "Read the docs", href: "/setup#quickstart" },
  { icon: MessageCircle, name: "Telegram bot", use: "Query in chat", setup: "@FomoScopeBot", action: "Bot guide", href: "/setup#telegram" },
  { icon: Send, name: "Telegram channel", use: "Receive signals", setup: "One tap", action: "Join channel", href: "https://t.me/fomoscopealerts" },
  { icon: Layers3, name: "MCP server", use: "Ground AI tools", setup: "Server URL", action: "Connect MCP", href: "/setup#mcp" },
];

const plans = [
  {
    name: "Free",
    eyebrow: "Browse",
    price: "$0",
    cadence: "Forever",
    summary: "For people watching live market activity.",
    rate: "30 req/min · shared IP",
    features: ["Live tape and leaderboards", "No signup or wallet", "All public data objects", "Browser-ready access"],
    action: "Watch live",
    href: "/leaderboard",
  },
  {
    name: "Starter",
    eyebrow: "Build",
    price: "20",
    unit: "USDC",
    cadence: "Per 30 days",
    summary: "For bots, side projects, and internal tools.",
    rate: "60 req/min · private key",
    features: ["Everything in Free", "Personal fsk_ API key", "Server-side access", "Rotate or revoke anytime"],
    action: "Get Starter",
    href: "/setup#unlock",
    recommended: true,
  },
  {
    name: "Pro",
    eyebrow: "Scale",
    price: "35",
    unit: "USDC",
    cadence: "Per 30 days",
    summary: "For active agents and productized dashboards.",
    rate: "100 req/min · private key",
    features: ["Everything in Starter", "More polling headroom", "Same key controls", "Prepay 1–24 months"],
    action: "Get Pro",
    href: "/setup#unlock",
  },
];

const faqs = [
  { question: "What exactly am I buying?", answer: "Access to normalized FOMO trader intelligence: leaderboards, live moves, positions, token theses, and convergence signals through one documented REST API." },
  { question: "Why pay when Free has the same data?", answer: "Free is designed for people browsing the website and shares a rate-limit bucket by public IP. Paid plans give your application its own key and isolated request capacity for servers, bots, and products." },
  { question: "Is $SCOPE required?", answer: "No. Browsing is free and paid API plans use USDC. $SCOPE is part of Fomoscope’s product-funding model, not an access requirement or promise of financial return." },
  { question: "Can I rotate or revoke my key?", answer: "Yes. Starter and Pro keys can be rotated or revoked through a wallet challenge without losing remaining prepaid time." },
  { question: "Is Fomoscope affiliated with FOMO?", answer: "No. Fomoscope is an independent data reseller and is not endorsed by or affiliated with FOMO or fomo.family." },
];

const codeSamples: Record<CodeLanguage, string> = {
  curl: `curl -H "Authorization: Bearer fsk_live_xxxxxxxx" \\\n  "https://api.fomoscope.xyz/traders?window=7d&limit=20"`,
  javascript: `const response = await fetch(
  "https://api.fomoscope.xyz/traders?window=7d&limit=20",
  { headers: { Authorization: "Bearer fsk_live_xxxxxxxx" } }
);

const { items } = await response.json();`,
};

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Fomoscope home">
      <Radar aria-hidden="true" />
      <span>fomoscope</span>
    </a>
  );
}

function SectionHeading({ headingId, index, eyebrow, title, copy }: { headingId: string; index: string; eyebrow: string; title: string; copy: string }) {
  return (
    <header className="section-heading">
      <p className="section-index"><span>{index}</span>{eyebrow}</p>
      <div><h2 id={headingId}>{title}</h2><p>{copy}</p></div>
    </header>
  );
}

function ActivityGlyph({ kind }: { kind: ActivityItem["kind"] }) {
  if (kind === "buy") return <ArrowUpRight aria-hidden="true" />;
  if (kind === "sell") return <ArrowDownRight aria-hidden="true" />;
  return <MessageCircle aria-hidden="true" />;
}

export default function Home() {
  const [period, setPeriod] = useState<Period>("7D");
  const [explorerId, setExplorerId] = useState("leaderboards");
  const [useCaseId, setUseCaseId] = useState("agents");
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("curl");
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("now");

  const explorer = useMemo(() => explorerItems.find((item) => item.id === explorerId) ?? explorerItems[0], [explorerId]);
  const useCase = useMemo(() => useCases.find((item) => item.id === useCaseId) ?? useCases[0], [useCaseId]);

  useEffect(() => {
    const updateTime = () => setUpdatedAt(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    updateTime();
    const timer = window.setInterval(updateTime, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  async function copyCode() {
    await navigator.clipboard.writeText(codeSamples[codeLanguage]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main id="top">
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <Brand />
          <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            <a href="#live" onClick={() => setMobileMenuOpen(false)}>Live data</a>
            <a href="#data" onClick={() => setMobileMenuOpen(false)}>Data</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)}>Use cases</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="/setup" onClick={() => setMobileMenuOpen(false)}>Docs</a>
          </div>
          <div className="nav-actions">
            <a className="nav-icon" href="https://x.com/FomoScopexyz" aria-label="Fomoscope on X"><X aria-hidden="true" /></a>
            <a className="nav-icon" href="https://t.me/fomoscopealerts" aria-label="Fomoscope on Telegram"><Send aria-hidden="true" /></a>
            <a className="button button-primary nav-cta" href="#pricing"><KeyRound aria-hidden="true" />Get API access</a>
            <button className="mobile-menu-button" type="button" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero page-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="live-kicker"><span aria-hidden="true" />Live FOMO intelligence · 15 sec refresh</p>
          <h1 id="hero-title">Know who moved.<br />What they said.<br /><span>Who followed.</span></h1>
          <p className="hero-lede">Fomoscope turns leaderboards, trades, positions, and theses into one normalized API—so products and agents can act on evidence instead of watching a feed.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#pricing"><KeyRound aria-hidden="true" />Get an API key</a>
            <a className="button button-secondary" href="#live"><Eye aria-hidden="true" />Watch the live tape</a>
          </div>
        </div>

        <aside className="signal-route" aria-label="How Fomoscope data is delivered">
          <div className="route-head"><span>Signal route</span><code>GET /events</code></div>
          <div className="route-row"><RadioTower aria-hidden="true" /><span><strong>Capture</strong><small>FOMO activity</small></span><b>01</b></div>
          <div className="route-row"><ListFilter aria-hidden="true" /><span><strong>Normalize</strong><small>Evidence + sequence</small></span><b>02</b></div>
          <div className="route-row"><Braces aria-hidden="true" /><span><strong>Deliver</strong><small>JSON over HTTP</small></span><b>03</b></div>
          <div className="route-proof"><ShieldCheck aria-hidden="true" /><span><strong>No card to browse</strong><small>Key in under two minutes</small></span></div>
        </aside>
      </section>

      <section className="live-section page-shell" id="live" aria-labelledby="live-title">
        <div className="live-console">
          <header className="console-header">
            <div className="console-title"><Activity aria-hidden="true" /><strong id="live-title">FOMO live tape</strong><span>Preview data</span></div>
            <p className="stream-state"><span aria-hidden="true" />Streaming · updated <time>{updatedAt}</time></p>
          </header>

          <div className="console-grid">
            <section className="leaderboard" aria-labelledby="leaderboard-title">
              <header className="panel-toolbar">
                <div className="panel-title"><Trophy aria-hidden="true" /><div><h2 id="leaderboard-title">Top traders</h2><p>Ranked by net PnL</p></div></div>
                <div className="toolbar-filters">
                  <div className="segmented" aria-label="Leaderboard period">
                    {(["24H", "7D", "30D", "ALL"] as Period[]).map((item) => <button key={item} type="button" aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}
                  </div>
                </div>
              </header>

              <div className="leader-table" role="table" aria-label={`${period} trader leaderboard preview`}>
                <div className="leader-table-head" role="row"><span role="columnheader">#</span><span role="columnheader">Source</span><span role="columnheader">Signal</span><span role="columnheader">Net PnL · {period}</span></div>
                {leaders.map((leader) => (
                  <div className="leader-row" role="row" key={leader.handle}>
                    <span className="leader-rank" role="cell">{leader.rank}</span>
                    <span className="leader-source" role="cell"><strong>{leader.handle}</strong><code>{leader.wallet}</code></span>
                    <span className="leader-signal" role="cell"><i style={{ "--bar-size": `${leader.bar}%` } as CSSProperties} /><small>{leader.followers ? `${leader.followers} followers` : "Ranked source"}</small></span>
                    <span className="leader-pnl" role="cell"><ArrowUpRight aria-hidden="true" />{leader.pnl}</span>
                  </div>
                ))}
              </div>
            </section>

            <aside className="activity-feed" aria-labelledby="activity-title">
              <header className="panel-toolbar activity-toolbar">
                <div className="panel-title"><Radio aria-hidden="true" /><div><h2 id="activity-title">Live activity</h2><p>Buys · sells · theses</p></div></div>
                <span className="live-word"><span aria-hidden="true" />Live</span>
              </header>
              <ol className="activity-items">
                {liveActivity.map((item, index) => (
                  <li className={`activity-row ${item.kind}`} key={`${item.handle}-${item.token}-${index}`}>
                    <ActivityGlyph kind={item.kind} />
                    <div className="activity-text"><p><strong>{item.handle}</strong> <span>{item.kind === "thesis" ? "wrote on" : item.kind === "buy" ? "bought" : "sold"}</span> <b>{item.token}</b></p><small>{item.thesis ?? `${item.age} ago · Solana`}</small></div>
                    <div className="activity-amount"><strong>{item.amount}</strong>{item.result && <span className={item.result.startsWith("−") ? "negative" : "positive"}>{item.result}</span>}</div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>

          <footer className="console-footer">
            <div className="trend-line"><span><Activity aria-hidden="true" />Trending</span><b>ANSEM</b><b>EYE</b><b>BULLSHIT</b><b>67COIN</b><b>PUMP</b></div>
            <dl className="proof-metrics"><div><dt>Wallets</dt><dd>3,800+</dd></div><div><dt>Signals / 24h</dt><dd>6,000+</dd></div><div><dt>7d clans</dt><dd>79</dd></div></dl>
          </footer>
        </div>
      </section>

      <section className="section page-shell" id="data" aria-labelledby="data-title">
        <SectionHeading headingId="data-title" index="01" eyebrow="Data objects" title="Six feeds. One decision model." copy="Choose the question you need answered. Fomoscope keeps the source, timing, and current state attached." />
        <div className="explorer-layout">
          <nav className="explorer-rail" aria-label="Choose a Fomoscope data object">
            {explorerItems.map((item, index) => {
              const Icon = item.icon;
              const selected = item.id === explorer.id;
              return <button key={item.id} type="button" aria-pressed={selected} onClick={() => setExplorerId(item.id)}><Icon aria-hidden="true" /><span>{item.label}</span><small>0{index + 1}</small><ArrowRight aria-hidden="true" /></button>;
            })}
          </nav>
          <article className="explorer-detail" aria-live="polite" key={explorer.id}>
            <div className="detail-copy"><p className="detail-label">{explorer.label}</p><h3>{explorer.question}</h3><p>{explorer.summary}</p><code>{explorer.endpoint}</code></div>
            <dl className="proof-list">
              {explorer.proof.map((proof, index) => <div key={proof.label}><dt><span>0{index + 1}</span>{proof.label}</dt><dd><strong>{proof.value}</strong><small>{proof.note}</small></dd></div>)}
            </dl>
            <footer className="detail-foot"><Database aria-hidden="true" />Normalized object · source trail preserved</footer>
          </article>
        </div>
      </section>

      <section className="section section-ruled" id="use-cases" aria-labelledby="use-cases-title">
        <div className="page-shell">
          <SectionHeading headingId="use-cases-title" index="02" eyebrow="Use cases" title="Put the tape to work." copy="The same market objects can ground an answer, trigger an alert, or feed an automated decision." />
          <div className="use-case-layout">
            <nav className="use-case-rail" aria-label="Choose a use case">
              {useCases.map((item, index) => {
                const Icon = item.icon;
                const selected = item.id === useCase.id;
                return <button key={item.id} type="button" aria-pressed={selected} onClick={() => setUseCaseId(item.id)}><span className="use-case-number">0{index + 1}</span><Icon aria-hidden="true" /><strong>{item.label}</strong><ArrowRight aria-hidden="true" /></button>;
              })}
            </nav>
            <article className="use-case-detail" aria-live="polite" key={useCase.id}>
              <div className="use-case-copy"><p>{useCase.label}</p><h3>{useCase.heading}</h3><span>{useCase.summary}</span></div>
              <div className="flow-line" aria-label={`${useCase.source} to ${useCase.output}`}><div><small>Source</small><strong>{useCase.source}</strong></div><ArrowRight aria-hidden="true" /><div><small>Operation</small><strong>{useCase.operation}</strong></div><ArrowRight aria-hidden="true" /><div><small>Output</small><strong>{useCase.output}</strong></div></div>
              <footer className="use-case-foot"><div>{useCase.endpoints.map((endpoint) => <code key={endpoint}>{endpoint}</code>)}</div><span><Check aria-hidden="true" />{useCase.proof}</span></footer>
            </article>
          </div>
        </div>
      </section>

      <section className="section page-shell" id="interfaces" aria-labelledby="interfaces-title">
        <SectionHeading headingId="interfaces-title" index="03" eyebrow="Interfaces" title="One feed. Five ways in." copy="Browse it, query it, subscribe to it, or connect it directly to an AI tool." />
        <div className="channel-table" role="table" aria-label="Fomoscope delivery interfaces">
          <div className="channel-head" role="row"><span role="columnheader">Interface</span><span role="columnheader">Best for</span><span role="columnheader">Setup</span><span role="columnheader">Next step</span></div>
          {channels.map((channel) => {
            const Icon = channel.icon;
            return <a className="channel-row" href={channel.href} key={channel.name} role="row"><span className="channel-name" role="cell"><Icon aria-hidden="true" /><strong>{channel.name}</strong></span><span role="cell">{channel.use}</span><code role="cell">{channel.setup}</code><span className="channel-action" role="cell">{channel.action}<ArrowUpRight aria-hidden="true" /></span></a>;
          })}
        </div>
      </section>

      <section className="section section-ruled" id="pricing" aria-labelledby="pricing-title">
        <div className="page-shell">
          <SectionHeading headingId="pricing-title" index="04" eyebrow="Pricing" title="Watch free. Pay for your own lane." copy="Every plan sees the same data. Paid access gives your code an isolated key and more request capacity." />
          <div className="pricing-table">
            {plans.map((plan) => (
              <article className={`plan ${plan.recommended ? "recommended" : ""}`} key={plan.name}>
                <header className="plan-head"><p>{plan.eyebrow}{plan.recommended && <span>Recommended</span>}</p><h3>{plan.name}</h3><div className="plan-price"><strong>{plan.price}</strong>{plan.unit && <span>{plan.unit}</span>}</div><small>{plan.cadence}</small><p className="plan-summary">{plan.summary}</p></header>
                <p className="plan-rate"><Gauge aria-hidden="true" />{plan.rate}</p>
                <ul>{plan.features.map((feature) => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
                <a className={`button ${plan.recommended ? "button-primary" : "button-secondary"}`} href={plan.href}>{plan.action}<ArrowRight aria-hidden="true" /></a>
              </article>
            ))}
          </div>
          <div className="pricing-notes">
            <details><summary><span>Same dataset</span><strong>Paid plans buy access, isolation, and capacity.</strong><ChevronDown aria-hidden="true" /></summary><p>No exclusive event type or hidden history is gated by plan. Your key adds a private rate-limit bucket, reliable server-side access, rotation, revocation, and multi-month prepayment.</p></details>
            <details><summary><span>Power usage</span><strong>Extra sessions may carry a disclosed SOL fee.</strong><ChevronDown aria-hidden="true" /></summary><p>Higher-session workloads can create additional infrastructure cost. Any fee is shown before a session starts and pays for capacity, not hidden data.</p></details>
            <details><summary><span>$SCOPE</span><strong>Optional funding loop, never an access requirement.</strong><ChevronDown aria-hidden="true" /></summary><p>Creator rewards received from $SCOPE activity are committed to Fomoscope infrastructure and development. Holding $SCOPE is optional and does not guarantee returns or unreleased features.</p></details>
          </div>
        </div>
      </section>

      <section className="section page-shell" id="quickstart" aria-labelledby="quickstart-title">
        <SectionHeading headingId="quickstart-title" index="05" eyebrow="Quickstart" title="From zero to data in three moves." copy="Browse without a key, or create one when your application needs its own request lane." />
        <div className="quickstart-layout">
          <ol className="steps"><li><span>01</span><div><strong>Choose access</strong><p>Browse free, or pick Starter or Pro for server-side use.</p></div></li><li><span>02</span><div><strong>Create your key</strong><p>Paid keys appear immediately after the wallet checkout.</p></div></li><li><span>03</span><div><strong>Pull live objects</strong><p>One HTTP request returns normalized trader data.</p></div></li></ol>
          <div className="code-console">
            <header><div className="segmented code-switch" aria-label="Code language">{(["curl", "javascript"] as CodeLanguage[]).map((language) => <button key={language} type="button" aria-pressed={codeLanguage === language} onClick={() => { setCodeLanguage(language); setCopied(false); }}>{language}</button>)}</div><button className="copy-button" type="button" onClick={copyCode}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button></header>
            <pre><code>{codeSamples[codeLanguage]}</code></pre>
            <footer><Terminal aria-hidden="true" />Free browsing needs no key · attach one for higher limits</footer>
          </div>
        </div>
      </section>

      <section className="section faq-section page-shell" id="faq" aria-labelledby="faq-title">
        <SectionHeading headingId="faq-title" index="06" eyebrow="FAQ" title="Questions, answered plainly." copy="The access model, funding, and relationship to FOMO—without fine-print theater." />
        <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question}><summary><span>0{index + 1}</span><strong>{faq.question}</strong><ChevronDown aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="final-cta section-ruled">
        <div className="page-shell final-cta-inner">
          <div><p className="section-index"><span>07</span>Start now</p><h2>Watch the tape.<br /><span>Key your code.</span></h2></div>
          <div><p>Browse live FOMO activity for free. Move to a private API key when an agent, bot, or product needs reliable capacity.</p><div className="hero-actions"><a className="button button-primary" href="#pricing"><KeyRound aria-hidden="true" />Get API access</a><a className="button button-secondary" href="/setup"><Code2 aria-hidden="true" />Read the docs</a></div></div>
        </div>
      </section>

      <footer className="site-footer page-shell">
        <div className="footer-brand"><Brand /><p>On-chain trader intelligence for products, workflows, and agents.</p></div>
        <div className="footer-links"><a href="/leaderboard">Leaderboard</a><a href="#data">Data</a><a href="#pricing">Pricing</a><a href="/setup">Docs</a><a href="/keys">Keys</a></div>
        <div className="footer-legal"><p>Fomoscope is an independent data reseller and is not affiliated with or endorsed by FOMO or fomo.family. Market data is informational, not financial advice.</p><span>© 2026 fomoscope</span></div>
      </footer>
    </main>
  );
}
