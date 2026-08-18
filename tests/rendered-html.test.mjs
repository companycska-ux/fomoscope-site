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

test("server-renders the Fomoscope product site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /fomoscope/i);
  assert.match(html, /Know who moved/);
  assert.match(html, /FOMO live tape/);
  assert.match(html, /Six feeds\. One decision model\./);
  assert.match(html, /One feed\. Five ways in\./);
  assert.match(html, /Watch free\. Pay for your own lane\./);
  assert.match(html, /From zero to data in three moves\./);
  assert.match(html, /Questions, answered plainly\./);
  assert.match(html, /Preview data/);
  assert.doesNotMatch(html, /FOMO Thesis Scout/i);
  assert.doesNotMatch(html, /Building your site|Your site is taking shape/);
});

test("uses dense comparison and progressive-disclosure patterns", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const explorerItems: ExplorerItem\[\]/);
  assert.match(page, /const useCases: UseCase\[\]/);
  assert.match(page, /aria-pressed=\{selected\}/);
  assert.match(page, /role="table"/);
  assert.match(page, /<details>/);
  assert.match(css, /\.console-grid\s*\{[^}]*grid-template-columns:/s);
  assert.match(css, /\.leader-row\s*\{/s);
  assert.match(css, /\.explorer-layout\s*\{[^}]*grid-template-columns:/s);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter|box-shadow/);
});
