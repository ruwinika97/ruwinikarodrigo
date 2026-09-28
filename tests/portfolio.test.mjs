import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { mkdir } from 'node:fs/promises';

let server, browser, page, baseURL;
const pageErrors = [];
before(async () => {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  baseURL = 'http://127.0.0.1:' + server.httpServer.address().port;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(baseURL, { waitUntil: 'networkidle' });
});
after(async () => { await browser?.close(); await server?.close(); });

test('CV-based content and working PDF download', async () => {
  await expect(page).toHaveTitle(/Ruwinika Rodrigo/);
  await expect(page.locator('h1')).toContainText('Beautifully built.');
  await expect(page.locator('.project-card')).toHaveCount(9);
  const response = await page.request.get(baseURL + '/ruwinika-rodrigo-cv.pdf');
  assert.equal(response.status(), 200);
  assert.ok((await response.body()).subarray(0, 5).toString().startsWith('%PDF'));
  await expect(page.locator('.email-row > a')).toHaveAttribute('href', 'mailto:truwinikarodrigo@gmail.com');
});
test('project filters update visible results and pressed states', async () => {
  await page.getByRole('button', { name: 'UI / UX', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'UI / UX', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(5);
  await page.getByRole('button', { name: /All work/ }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(9);
});

test('automation filter isolates the three new automation and AI projects', async () => {
  await page.getByRole('button', { name: 'Automation & AI', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  for (const id of ['copilot', 'capex', 'documents']) await expect(page.locator('[data-project="' + id + '"]')).toBeVisible();
  await page.getByRole('button', { name: /All work/ }).click();
});
test('contact form validates input and prepares an encoded email draft', async () => {
  const form = page.getByRole('form', { name: 'Contact Ruwinika' });
  await form.getByRole('button', { name: 'Prepare message' }).click();
  await expect(page.locator('#contact-draft')).toBeHidden();
  await page.getByLabel('Your name').fill('Alex & Taylor');
  await page.getByRole('textbox', { name: /Email address/ }).fill('alex@example.com');
  await page.getByLabel('Your message').fill('Hello Ruwinika, let us discuss a design & engineering project.');
  await page.getByLabel('What do you have in mind?').selectOption('Frontend engineering');
  await form.getByRole('button', { name: 'Prepare message' }).click();
  await expect(page.locator('#contact-status')).toContainText('Your draft is ready');
  const link = new URL(await page.locator('#contact-send').getAttribute('href'));
  assert.equal(link.protocol, 'mailto:');
  assert.equal(link.pathname, 'truwinikarodrigo@gmail.com');
  assert.equal(link.searchParams.get('subject'), 'Portfolio enquiry: Frontend engineering');
  assert.ok(link.searchParams.get('body').includes('Alex & Taylor'));
  assert.ok(link.searchParams.get('body').includes('alex@example.com'));
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy message' }).click();
  assert.ok((await page.evaluate(() => navigator.clipboard.readText())).includes('Alex & Taylor'));
  await page.getByLabel('Your message').fill('An updated project message.');
  await expect(page.locator('#contact-draft')).toBeHidden();
  await page.getByLabel('Your name').fill('   ');
  await form.getByRole('button', { name: 'Prepare message' }).click();
  assert.equal(await page.getByLabel('Your name').evaluate(el => el.validity.valid), false);
  await page.getByLabel('Your name').fill('Alex');
  await form.getByRole('button', { name: 'Prepare message' }).click();
  await expect(page.locator('#contact-draft')).toBeVisible();
});

test('all project dialogs open, trap focus, dismiss, and return focus', async () => {
  for (const id of ['sharepoint', 'procurement', 'copilot', 'capex', 'documents', 'olympic', 'music', 'performance', 'leave']) {
    const trigger = page.locator('[data-project="' + id + '"]');
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#dialog-title')).not.toBeEmpty();
    await expect(page.locator('.dialog-note')).toContainText(/illustrative|deliverables/);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')), true);
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});
test('theme preference persists after reload', async () => {
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
});
test('copy-email action places the correct address on the clipboard', async () => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toContainText('Email copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'truwinikarodrigo@gmail.com');
});
test('responsive layouts fit the viewport and mobile navigation works', async () => {
  for (const width of [320, 375, 390, 520, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const measurements = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    assert.ok(measurements.content <= measurements.viewport, 'Horizontal overflow at ' + width + ': ' + JSON.stringify(measurements));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About me' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
  await expect(page).toHaveURL(/#about$/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
});
test('reduced motion disables animation and keeps content visible', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.sculpture-ring').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await page.locator('.research-section').evaluate(el => getComputedStyle(el).opacity), '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});
test('capture desktop and mobile visuals without runtime errors', async () => {
  await mkdir('artifacts', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'artifacts/desktop-hero.png', animations: 'disabled' });
  for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 650) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'artifacts/desktop-full.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/mobile-hero.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/light-hero.png', animations: 'disabled' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#contact').screenshot({ path: 'artifacts/contact-desktop.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#contact').screenshot({ path: 'artifacts/contact-mobile.png', animations: 'disabled' });
  assert.deepEqual(pageErrors, []);
});


