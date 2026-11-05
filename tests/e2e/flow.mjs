// End-to-end test of the web build, served the way GitHub Pages serves it
// (under /ovio./, with 404.html as the SPA fallback).
// Usage: npx expo export --platform web --output-dir dist && node tests/e2e/flow.mjs dist
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const BASE = '/ovio.';
const SHOTS = process.env.E2E_SHOTS; // optional folder for screenshots
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.json': 'application/json' };

const server = createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (!url.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let file = join(DIST, url.slice(BASE.length));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/html' }).end(readFileSync(join(DIST, existsSync(join(DIST, '404.html')) ? '404.html' : 'index.html')));
    return;
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const origin = `http://localhost:${server.address().port}${BASE}`;

const browser = await chromium.launch();
// colorScheme 'light' on purpose: ovio must still open dark by default.
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'it-IT', colorScheme: 'light' });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('dialog', (d) => d.accept()); // window.confirm: always "yes"

const vis = (l) => l.filter({ visible: true }).last();
const text = (t) => vis(page.getByText(t, { exact: true }));
const click = async (t) => { await text(t).click(); await page.waitForTimeout(500); };
const fill = async (placeholder, v) => vis(page.getByPlaceholder(placeholder, { exact: true })).fill(v);
const byLabel = (l) => vis(page.getByLabel(l, { exact: true }));
const see = async (t) => assert.ok(await text(t).isVisible(), `expected to see "${t}"`);
const shot = async (n) => { if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: join(SHOTS, `${n}.png`) }); } };
// Background of the largest painted element, e.g. 'rgb(17, 24, 39)' for Midnight.
const appBackground = () => page.evaluate(() => {
  let best = null, area = 0;
  for (const el of document.querySelectorAll('div')) {
    const bg = getComputedStyle(el).backgroundColor;
    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
    const r = el.getBoundingClientRect();
    if (r.width * r.height > area) { area = r.width * r.height; best = bg; }
  }
  return best;
});
const MIDNIGHT = 'rgb(17, 24, 39)';
const CLOUD = 'rgb(248, 249, 246)';
let step = '';
const run = async (name, fn) => { step = name; await fn(); console.log(`ok - ${name}`); };

try {
  await run('first run: create profile', async () => {
    await page.goto(origin);
    await vis(page.getByPlaceholder('Il tuo nome', { exact: true })).waitFor();
    assert.equal(await appBackground(), MIDNIGHT, 'dark by default even with a light system setting');
    await fill('Il tuo nome', 'Marco');
    await click('Inizia');
    await see('Nessun gruppo, per ora');
  });

  await run('create a group with two new people', async () => {
    await click('Crea un gruppo');
    await fill('Weekend a Lisbona', 'Lisbona');
    for (const n of ['Giulia', 'Luca']) { await fill('Nome', n); await click('Aggiungi'); }
    await click('Crea');
    await see('Ancora nessuna spesa');
  });

  await run('equal split: I pay 90 for three', async () => {
    await click('Nuova spesa');
    await fill('0,00', '90');
    await fill('Cena, benzina, affitto…', 'Cena');
    await see('30,00 €');
    await click('Salva');
    await see('Ti devono');
    await see('60,00 €');
  });

  await run('shares split: Giulia pays 60, Luca has 2 shares', async () => {
    await click('Nuova spesa');
    await fill('0,00', '60');
    await fill('Cena, benzina, affitto…', 'Taxi');
    await byLabel('Giulia').click();
    await byLabel('Quote').click();
    await byLabel('Quote di Luca').fill('2');
    await click('Salva');
    await see('45,00 €');
  });

  await run('balances are simplified correctly', async () => {
    await click('Saldi e totali');
    await see('Luca deve a te');
    await see('Luca deve a Giulia');
    await see('150,00 €');
    await shot('balances');
    await page.goBack();
    await page.waitForTimeout(500);
  });

  await run('delete is undoable', async () => {
    await click('Taxi');
    await click('Elimina spesa');
    await see('“Taxi” eliminata');
    await click('Annulla');
    await see('Taxi');
    await see('45,00 €');
  });

  await run('unsaved expense asks before discarding', async () => {
    await click('Nuova spesa');
    await fill('Cena, benzina, affitto…', 'Bozza');
    await click('Annulla'); // dialog auto-accepted: "Scarta"
    assert.equal(await text('Bozza').count(), 0);
    await see('Saldi e totali');
  });

  await run('outside a group: Luca owes me 10', async () => {
    await vis(page.getByText('Amici', { exact: true })).click();
    await page.waitForTimeout(500);
    await click('Luca');
    await click('Nuova spesa');
    await fill('0,00', '20');
    await fill('Cena, benzina, affitto…', 'Caffè');
    await click('Salva');
    await see('55,00 €'); // 45 in the group + 10 outside
  });

  await run('settle with a friend: "Tutto" clears group and loose balances', async () => {
    await click('Salda');
    await see('DOVE REGISTRARLO');
    await see('Fuori dai gruppi');
    await shot('settle-friend');
    await click('Registra 2 pagamenti');
    await see('Tutto pari');
  });

  await run('the group shows the payment too', async () => {
    await vis(page.getByText('Gruppi', { exact: true })).click();
    await page.waitForTimeout(500);
    await click('Lisbona');
    await see('Pagamento');
    await click('Saldi e totali');
    await see('Luca deve a Giulia');
    assert.equal(await text('Luca deve a te').count(), 0, 'Luca should no longer owe me in the group');
  });

  await run('appearance: Chiaro switches to Cloud, Scuro back to Midnight, and it is remembered', async () => {
    await page.goto(origin + 'account');
    await byLabel('Chiaro').waitFor();
    await byLabel('Chiaro').click();
    await page.waitForTimeout(400);
    assert.equal(await appBackground(), CLOUD);
    await shot('light');
    await page.reload();
    await byLabel('Scuro').waitFor();
    assert.equal(await appBackground(), CLOUD, 'light choice survives a reload');
    await byLabel('Scuro').click();
    await page.waitForTimeout(400);
    assert.equal(await appBackground(), MIDNIGHT);
  });

  await run('deep link reload keeps the data', async () => {
    await page.goto(origin + 'friends');
    await page.waitForTimeout(1500);
    await see('Giulia');
    await see('Luca');
  });

  const real = errors.filter((e) => !e.includes('renderToImageAsync'));
  assert.deepEqual(real, [], 'page errors');
  console.log('all e2e checks passed');
} catch (e) {
  console.error(`not ok - ${step}\n${e.message}`);
  if (SHOTS) await shot('failure');
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
