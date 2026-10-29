import { test, expect, type Page } from "@playwright/test";

// The dashboard as a visitor uses it: every view renders without page errors or sideways scroll,
// Compare reads two real nodes and judges the diff, bad input is refused with a reason, runs and
// their on-chain record load, and the landing page reads its numbers live.

const VIEWS = ["new", "runs", "node", "compare", "doctor", "invariants", "registry"];
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (e) => list.push(e.message));
});
test.afterEach(({ page }) => expect(errors.get(page) ?? []).toEqual([]));

async function noSideScroll(page: Page) {
  const [sw, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(sw).toBeLessThanOrEqual(w);
}

for (const v of VIEWS) {
  test(`view #${v} renders`, async ({ page }) => {
    await page.goto(`/dashboard#${v}`);
    await expect(page.locator("header h1")).toHaveText(/\w/);
    await page.waitForTimeout(1500);
    await noSideScroll(page);
  });
}

test("sidebar navigation switches views", async ({ page, isMobile }) => {
  await page.goto("/dashboard");
  await expect(page.locator("header h1")).toHaveText("New run");
  if (isMobile) await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await page.getByRole("link", { name: "Compare" }).click();
  await expect(page).toHaveURL(/#compare$/);
  await expect(page.locator("header h1")).toHaveText("Compare");
});

async function compare(page: Page, a: string, b: string) {
  const inputs = page.locator("form input");
  await inputs.nth(0).fill(a);
  await inputs.nth(1).fill(b);
  await page.getByRole("button", { name: /^Compare/ }).click();
}

test("compare: a chain against itself has no changes and no risks", async ({ page }) => {
  await page.goto("/dashboard#compare");
  await page.getByRole("button", { name: "Mainnet → Mainnet" }).click();
  const stat = (label: string) => page.locator(`[data-stat="${label}"] .text-2xl`);
  await expect(stat("Changes")).toHaveText("0", { timeout: 90_000 });
  await expect(stat("Risks")).toHaveText("0");
  await expect(page.getByText("No compatibility risks.")).toBeVisible();
});

test("compare: mainnet → V3 is judged, worst first, with evidence", async ({ page }) => {
  await page.goto("/dashboard#compare");
  const first = page.locator("[data-slot=collapsible]").first();
  await expect(first).toBeVisible({ timeout: 90_000 });
  await expect(first.getByText("Critical")).toBeVisible();
  // The first risk is open: its reason and its before/after rows.
  await expect(first.getByRole("table")).toBeVisible();
  await expect(first.getByText("Before")).toBeVisible();
  // Every change, filterable.
  await page.getByPlaceholder("Filter by name").fill("Balances.constant");
  await expect(page.getByRole("cell", { name: /^Balances\.constant\./ }).first()).toBeVisible();
  await noSideScroll(page);
});

test("compare: refuses bad input with a reason", async ({ page }) => {
  await page.goto("/dashboard#compare");
  await compare(page, "https://mainnet.portaldot.io", "not a url");
  await expect(page.getByText("Use the WebSocket address: wss://mainnet.portaldot.io")).toBeVisible();
  await expect(page.getByText("Not a valid address (ws://… or wss://…)")).toBeVisible();
  await compare(page, "wss://no-such-node.portaldot.invalid", "wss://mainnet.portaldot.io");
  await expect(page.getByText("Could not connect to wss://no-such-node.portaldot.invalid")).toBeVisible({ timeout: 30_000 });
});

test("new run: lists the built runtimes and refuses a non-wasm file", async ({ page, request }) => {
  const runtimes = await (await request.get("/engine/runtimes.json")).json();
  await page.goto("/dashboard#new");
  for (const r of runtimes) await expect(page.getByRole("button", { name: new RegExp(`^${r.name}`) })).toBeVisible();
  await page.locator("input[type=file]").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(page.getByText("Choose a .wasm runtime")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start run" })).toBeEnabled();
});

test("supply: mainnet total issuance equals the sum of all accounts", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/dashboard#invariants");
  await expect(page.getByText("Conserved")).toBeVisible({ timeout: 200_000 });
});

test("doctor: public endpoints are checked layer by layer", async ({ page }) => {
  await page.goto("/dashboard#doctor");
  await expect(page.getByText(/^\d of \d healthy$/)).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("Runtime APIs").first()).toBeVisible();
});

const runs = !!process.env.CANARY_GH_TOKEN;
test("runs: lists runs and their verdicts", async ({ page }) => {
  test.skip(!runs, "needs CANARY_GH_TOKEN");
  await page.goto("/dashboard#runs");
  await expect(page.getByRole("row").filter({ hasText: "halve-reserved" }).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("Migration breaks balances").first()).toBeVisible({ timeout: 60_000 });
});

test("run page: verdict, risks and the on-chain record re-verified in the browser", async ({ page }) => {
  test.skip(!runs, "needs CANARY_GH_TOKEN");
  await page.goto("/dashboard#run/d4d8b7934db1");
  await expect(page.getByText("Migration breaks balances")).toBeVisible({ timeout: 60_000 });
  const record = page.locator("[data-slot=card]", { hasText: "On-chain record" });
  await expect(record.getByText("Verified")).toBeVisible({ timeout: 60_000 });
  await expect(record.getByText("9 of 9 files match result.json")).toBeVisible();
  await expect(record.getByRole("link", { name: /#234,189/ })).toHaveAttribute("href", /explorer\/query\/0xb8207aa6/);
  await noSideScroll(page);
});

test("landing: live numbers, and no dashboard stylesheet", async ({ page }) => {
  await page.goto("/");
  const sheets = await page.evaluate(() => [...document.querySelectorAll("link[rel=stylesheet]")].length);
  expect(sheets).toBe(1);
  expect(await page.locator("[data-sidebar]").count()).toBe(0);
  const count = page.locator(".text-title-h3").filter({ hasText: /^\d[\d,]*$|^…$/ }).first();
  await count.scrollIntoViewIfNeeded();
  await expect(count).toHaveText(/^\d[\d,]*$/, { timeout: 90_000 });
});
