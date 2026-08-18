# Fomoscope

On-chain trader intelligence for products, workflows, and agents.

[Open the deployed site](https://fomoscope-intelligence.luboweb3.chatgpt.site)

## Product surface

- Ranked FOMO trader performance with dense comparison controls
- Sequenced buys, sells, theses, and position context
- Data-object explorer for leaderboards, activity, theses, positions, convergence, and clans
- Delivery through the web dashboard, REST API, Telegram, and MCP
- Responsive pricing, quickstart, and product documentation surfaces

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm test
```

The test command builds the vinext application and verifies the rendered product site.

## Architecture

The site uses React 19, vinext, TypeScript, Lucide icons, and the OpenAI Sites runtime. Product source lives under `app/`; deployment metadata lives in `.openai/hosting.json`.
