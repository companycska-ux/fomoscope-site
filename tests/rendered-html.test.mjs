import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the FOMO research workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /FOMO Thesis Scout/i);
  assert.match(html, /Important updates/);
  assert.match(html, /Ask the market/);
  assert.match(html, /All commands/);
  assert.match(html, /Preview data/);
  assert.match(html, /Right now/);
  assert.match(html, /My network/);
  assert.match(html, /\/thesis-first/);
  assert.match(html, /\/group create core/);
  assert.doesNotMatch(html, /Building your site|Your site is taking shape/);
});

test("keeps the command browser compact, complete, and keyboard-ready", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const commandGroups: CommandGroup\[\]/);
  assert.match(page, /Math\.min\(5, visibleCommands\.length\)/);
  assert.match(page, /event\.key === "ArrowDown" \|\| event\.key === "ArrowUp"/);
  assert.match(page, /event\.key === "Home" \|\| event\.key === "End"/);
  assert.match(page, /role="combobox"/);
  assert.match(page, /role="listbox"/);
  assert.match(css, /\.slash-command-list\s*\{[^}]*max-height:\s*210px[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.shortcut-groups\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.situation-row\s*>\s*p\s*\{[^}]*font-size:\s*13px/s);
  assert.match(css, /\.situation-row\s+dt\s*\{[^}]*font-size:\s*11px/s);
  assert.match(css, /\.situation-row\s+dd\s*\{[^}]*font-size:\s*11px[^}]*overflow-wrap:\s*anywhere/s);
  assert.doesNotMatch(css, /\.situation-row\s+dd\s*\{[^}]*white-space:\s*nowrap/s);
});
