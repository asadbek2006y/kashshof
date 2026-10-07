import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Critical journeys. Conversations run in "Private guided" mode (the default), which never calls
 * a language model — so wording is deterministic whatever the API's Gemini configuration is.
 */

const STORY_EN = "I'm raising two children alone in Tashkent and I lost my job last month. I need financial support for my family.";
const EXIT = /google\.com/;

async function startConversation(page: Page, locale: string, text: string) {
  await page.goto(`/${locale}/ask`);
  await expect(page.getByTestId('mode-private')).toBeChecked();
  await page.getByTestId('chat-input').fill(text);
  await page.getByTestId('chat-submit').click();
  await expect(page.getByTestId('assistant-message').first()).toBeVisible();
}

async function completeEnglishMatch(page: Page) {
  await startConversation(page, 'en', STORY_EN);
  await expect(page.getByText('How old are you?')).toBeVisible();
  await page.getByTestId('quick-replies').getByRole('button', { name: '25–34' }).click();
  await expect(page.getByTestId('chat-results').getByTestId('match-card').first()).toBeVisible();
}

async function stubExit(page: Page) {
  await page.route('https://www.google.com/**', (route) => route.fulfill({ body: '<title>Google</title>ok' }));
}

// 1
test('the language can be changed from any page', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/\/ru$/);
  // Phones use a compact select instead of the button group.
  await page.setViewportSize({ width: 360, height: 760 });
  await page.getByTestId('language-select').selectOption('uz');
  await expect(page).toHaveURL(/\/uz$/);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole('group', { name: 'Til' }).getByRole('button', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Вам не нужно');
});

test('switching language keeps the in-memory conversation', async ({ page }) => {
  await startConversation(page, 'en', 'I need food');
  await expect(page.getByTestId('quick-replies')).toBeVisible();
  await page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/\/ru\/ask$/);
  // Same conversation, now rendered in Russian (scripted messages are i18n keys).
  await expect(page.getByTestId('transcript')).toContainText('I need food');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Найти помощь');
});

// 2–4
for (const [locale, text] of [
  ['uz', 'Men Samarqandda yashayman, 22 yoshdaman, talabaman. Universitet kontraktini to‘lashga pulim yetmayapti.'],
  ['ru', 'Я мать-одиночка из Ферганы, мне 30 лет, двое детей, не работаю. Нужны продукты.'],
  ['en', 'I am 30, I live in Fergana and I am raising two children alone. I need food.'],
] as const) {
  test(`a conversation in ${locale} reaches explained matches`, async ({ page }) => {
    await startConversation(page, locale, text);
    const cards = page.getByTestId('chat-results').getByTestId('match-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().getByTestId('reason-list')).toBeVisible();
  });
}

// 5, 7, 9
test('normal matching shows labelled, explained results without percentages @mobile', async ({ page }) => {
  await completeEnglishMatch(page);
  await expect(page.getByTestId('situation-summary')).toContainText('Tashkent city');
  await page.getByTestId('see-all-results').click();
  await expect(page).toHaveURL(/\/en\/results$/);
  const cards = page.getByTestId('match-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards.first()).toContainText('Strong potential match');
  await expect(cards.first().getByTestId('next-step')).toBeVisible();
  // A program whose conditions can't be assessed yet says so.
  await expect(page.locator('[data-fit="needs_info"]').first()).toContainText('More information needed');
  // Fit is never a score. (Official program descriptions may quote real percentages, e.g. benefit rates.)
  for (const part of ['match-badge', 'reason-list', 'next-step']) {
    for (const text of await page.getByTestId(part).allTextContents()) expect(text).not.toContain('%');
  }
});

// 6
test('match explanations are exactly the deterministic matcher output', async ({ page }) => {
  await completeEnglishMatch(page);
  const response = page.waitForResponse((r) => r.url().endsWith('/api/v1/matches') && r.request().method() === 'POST');
  await page.getByTestId('see-all-results').click();
  const matches = (await (await response).json()) as { program: { id: string }; fit: string; reasons: unknown[] }[];
  expect(matches.length).toBeGreaterThan(0);
  const cards = page.getByTestId('match-card');
  await expect(cards).toHaveCount(matches.length);
  for (const [i, match] of matches.slice(0, 3).entries()) {
    const card = cards.nth(i);
    await expect(card).toHaveAttribute('data-program', match.program.id);
    await expect(card).toHaveAttribute('data-fit', match.fit);
    // The first three are expanded: one rendered line per reason the matcher returned.
    await expect(card.getByTestId('reason-list').locator('li')).toHaveCount(match.reasons.length);
  }
});

// 8
test('every result and program exposes its official source', async ({ page }) => {
  await completeEnglishMatch(page);
  const firstCard = page.getByTestId('chat-results').getByTestId('match-card').first();
  await expect(firstCard.getByTestId('source-link')).toHaveAttribute('href', /^https?:\/\//);
  await firstCard.getByTestId('view-details').click();
  await expect(page.getByTestId('source-link').first()).toHaveAttribute('href', /^https?:\/\//);
  await expect(page.getByTestId('source-link').first()).toHaveAttribute('target', '_blank');
  // The program page explains this session's match, from memory.
  await expect(page.getByTestId('match-evidence')).toBeVisible();
  await expect(page.getByTestId('data-status')).toContainText('Not yet');
});

// 10
test('preparing an application says plainly that nothing was submitted', async ({ page }) => {
  await page.goto('/en/apply/ezgu-amal-child-treatment');
  await expect(page.getByRole('button', { name: /submit/i })).toHaveCount(0);
  await page.getByTestId('next-step-button').click();
  await page.getByTestId('apply-documents').getByText('Medical report').click();
  await page.getByTestId('next-step-button').click();
  // Validation: a reason is required, and the error is announced with the field.
  await page.getByTestId('draft-statement').click();
  await expect(page.getByText('Write a few words about why you’re asking for support.')).toBeVisible();
  await page.getByLabel('Why are you asking for support?').fill('My son needs treatment we cannot afford.');
  await page.getByTestId('draft-statement').click();
  await expect(page.getByTestId('statement')).toHaveValue(/Ezgu Amal/);
  await page.getByTestId('statement').fill('Edited by me.');
  await expect(page.getByTestId('statement')).toHaveValue('Edited by me.');
  await page.getByTestId('next-step-button').click();
  await expect(page.getByTestId('apply-final')).toContainText('Nothing has been submitted.');
  await expect(page.getByTestId('apply-final').getByTestId('source-link')).toBeVisible();
});

// 11
test('a safety phrase switches to the deterministic safety experience', async ({ page }) => {
  await startConversation(page, 'en', 'My husband is threatening me and I need somewhere safe.');
  const panel = page.getByTestId('safety-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: /112/ })).toHaveAttribute('href', 'tel:112');
  await expect(page.getByTestId('conversation-progress')).toHaveCount(0);
  // Safety information comes before anything else in the conversation.
  const panelBox = await panel.boundingBox();
  const transcriptBox = await page.getByTestId('transcript').boundingBox();
  expect(panelBox!.y).toBeLessThan(transcriptBox!.y);
  await page.getByTestId('quick-replies').getByRole('button', { name: 'Find safe services' }).click();
  await expect(page.getByTestId('chat-results').getByTestId('match-card').first()).toBeVisible();
  // Sensitive circumstances are never echoed back on screen.
  await expect(page.getByTestId('situation-summary')).toHaveCount(0);
  await page.getByTestId('safety-page-link').click();
  await expect(page).toHaveURL(/\/en\/safety$/);
});

// 12, 14
test('Quick exit leaves, replaces the page and forgets the conversation @mobile', async ({ page }) => {
  await stubExit(page);
  await startConversation(page, 'en', 'I need food');
  await page.evaluate(() => sessionStorage.setItem('hamroh.chat', 'left over from an old version'));
  await page.getByTestId('quick-exit').click();
  await expect(page).toHaveURL(EXIT);
  // `replace`, not `push`: Back doesn't return to the conversation.
  await page.goBack().catch(() => undefined);
  expect(page.url()).not.toContain('/en/ask');
  await page.goto('/en/ask');
  await expect(page.getByTestId('mode-chooser')).toBeVisible();
  await expect(page.getByTestId('transcript')).toHaveCount(0);
  const leftovers = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('hamroh.')));
  expect(leftovers).toEqual([]);
});

// 13
test('pressing Esc twice triggers Quick exit', async ({ page }) => {
  await stubExit(page);
  await page.goto('/en/explore');
  // The shortcut is attached on hydration; retry until it is.
  await expect(async () => {
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(EXIT, { timeout: 1000 });
  }).toPass();
});

// 15, 16
test('the story never reaches a URL or browser storage, and a refresh clears it', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await completeEnglishMatch(page);
  await page.getByTestId('see-all-results').click();
  await expect(page).toHaveURL(/\/en\/results$/);
  await expect(page.getByTestId('match-card').first()).toBeVisible();

  for (const url of [...urls, page.url()]) {
    expect(url).not.toMatch(/raising|Tashkent|lost%20my%20job|children/i);
  }
  const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }));
  expect(stored).not.toContain('raising two children');
  expect(stored).not.toContain('tashkent_city');

  // Privacy contract: the conversation lives in memory only, so a reload starts fresh.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let’s find support that may fit');
  await page.goto('/en/ask');
  await expect(page.getByTestId('mode-chooser')).toBeVisible();
});

// 17
test('when AI assistance fails, the conversation continues with guided questions', async ({ page }) => {
  await page.route('**/api/v1/assistant/info', (route) => route.fulfill({ json: { aiAvailable: true } }));
  // Simulate Gemini being down: the server answers this "AI" turn with its scripted engine.
  await page.route('**/api/v1/assistant/turn', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    expect(body.assistantMode).toBe('ai');
    await route.continue({ postData: JSON.stringify({ ...body, assistantMode: 'private' }) });
  });
  await page.goto('/en/ask');
  await page.getByText('AI-assisted', { exact: true }).click();
  await expect(page.getByTestId('mode-ai')).toBeChecked();
  await page.getByTestId('chat-input').fill('I need food');
  await page.getByTestId('chat-submit').click();
  await expect(page.getByText('Continuing with guided questions')).toBeVisible();
  await expect(page.getByTestId('quick-replies')).toBeVisible();
});

test('private guided mode is the default and never asks for AI processing', async ({ page }) => {
  const modes: unknown[] = [];
  await page.route('**/api/v1/assistant/turn', async (route) => {
    modes.push((route.request().postDataJSON() as { assistantMode?: string }).assistantMode);
    await route.continue();
  });
  await startConversation(page, 'en', 'I need food');
  expect(modes).toEqual(['private']);
  await expect(page.getByTestId('ai-provider-notice')).toHaveAttribute('data-mode', 'private');
});

// 18
test('a keyboard-only user can complete matching', async ({ page }) => {
  await page.goto('/en/ask');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const input = page.getByTestId('chat-input');
  for (let i = 0; i < 40 && !(await input.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  await page.keyboard.type(STORY_EN);
  await page.keyboard.press('Enter');
  const chip = page.getByTestId('quick-replies').getByRole('button', { name: '25–34' });
  await expect(chip).toBeVisible();
  for (let i = 0; i < 60 && !(await chip.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(chip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('chat-results').getByTestId('match-card').first()).toBeVisible();
});

test('a fictional demo situation runs a private guided conversation', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByTestId('demo-situations')).toContainText('Fictional');
  await page.getByTestId('demo-legal').click();
  await expect(page).toHaveURL(/\/en\/ask$/);
  await expect(page.getByTestId('transcript')).toContainText('legal advice');
  await expect(page.getByTestId('ai-provider-notice')).toHaveAttribute('data-mode', 'private');
});

test('browsing works without the assistant, with filters and an honest empty state', async ({ page }) => {
  await page.goto('/en/explore');
  const total = await page.getByTestId('program-card').count();
  expect(total).toBeGreaterThan(5);
  await page.getByTestId('filter-category').selectOption('legal');
  await expect(page.getByTestId('program-card').first()).toBeVisible();
  expect(await page.getByTestId('program-card').count()).toBeLessThan(total);
  await page.getByTestId('program-search').fill('zzzz-no-such-program');
  await expect(page.getByTestId('empty-state')).toContainText('No programs match these filters');
  expect(page.url()).not.toContain('zzzz');
});

test('saving a program keeps it on this device until cleared', async ({ page }) => {
  await page.goto('/en/programs/ezgu-amal-child-treatment');
  await expect(page.getByTestId('program-documents')).toContainText('Medical report');
  await page.getByRole('button', { name: 'Save', exact: true }).locator('visible=true').first().click();
  await page.goto('/en/saved');
  await expect(page.getByTestId('saved-list')).toContainText('cancer or blood-disease treatment');
  await page.getByRole('button', { name: 'Clear saved programs' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('the home hero plays a calm, muted video on desktop with a working pause control', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones get the still poster');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await expect(page.getByTestId('hero-poster')).toBeVisible();
  await expect(page.getByTestId('hero-media')).toHaveAttribute('data-video', 'on');
  const video = page.getByTestId('hero-video');
  await expect(video).toHaveJSProperty('muted', true);
  await expect(video).toHaveAttribute('aria-hidden', 'true');
  expect(await video.evaluate((v: HTMLVideoElement) => v.loop)).toBe(false);
  const toggle = page.getByTestId('hero-video-toggle');
  await expect(toggle).toHaveText('Pause background video');
  await toggle.click();
  await expect(toggle).toHaveText('Play background video');
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  // The headline and main action stay on top and readable.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('cta-find-support')).toBeInViewport();
  // Urgent help is never placed over the moving hero.
  await expect(page.getByTestId('home-hero').getByTestId('home-urgent')).toHaveCount(0);
  await expect(page.getByTestId('home-urgent')).toBeVisible();
});

for (const [name, setup] of [
  ['prefers reduced motion', { reducedMotion: 'reduce' as const, viewport: { width: 1440, height: 900 } }],
  ['is a phone', { viewport: { width: 390, height: 844 } }],
] as const) {
  test(`the hero shows only the still image when the visitor ${name}`, async ({ browser }) => {
    const context = await browser.newContext(setup);
    const page = await context.newPage();
    const videoRequests: string[] = [];
    page.on('request', (r) => r.url().includes('/media/hero-navruz.') && videoRequests.push(r.url()));
    await page.goto('/en');
    // A fresh context may hit the dev server while it is still compiling; production serves this at once.
    await expect(page.getByTestId('hero-poster')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('hero-video')).toHaveCount(0);
    expect(videoRequests).toEqual([]);
    await context.close();
  });
}

test('the hero falls back to the still image when the video fails or data saving is on', async ({ browser }) => {
  // Failed load.
  let context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let page = await context.newPage();
  await page.route('**/media/hero-navruz.*', (route) => route.abort());
  await page.goto('/en');
  await expect(page.getByTestId('hero-media')).toHaveAttribute('data-video', 'off');
  await expect(page.getByTestId('hero-poster')).toBeVisible();
  await context.close();
  // Save-Data.
  context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }));
  page = await context.newPage();
  await page.goto('/en');
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('hero-video')).toHaveCount(0);
  await context.close();
});

test('every photo is captioned, attributed and listed on the credits page', async ({ page }) => {
  await page.goto('/en');
  for (const id of ['photo-dasturkhan', 'photo-motherChild']) {
    const figure = page.getByTestId(id);
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator('img')).toHaveAttribute('alt', /.{20,}/);
    await expect(figure.locator('figcaption')).toContainText('CC BY-SA');
  }
  await page.getByRole('link', { name: 'Photo credits' }).click();
  await expect(page).toHaveURL(/\/en\/credits$/);
  await expect(page.getByTestId('media-credits').locator('li')).toHaveCount(3);
  await expect(page.getByTestId('media-credits')).toContainText('Lokk1y');
});

// 19
const AXE_PAGES = ['/en', '/en/ask', '/en/results', '/en/explore', '/en/programs/ezgu-amal-child-treatment', '/en/apply/ezgu-amal-child-treatment', '/en/safety', '/en/how-it-works', '/en/saved', '/en/credits', '/ru', '/uz/ask'];
for (const path of AXE_PAGES) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    // Let entrance animations finish so contrast is measured at full opacity.
    await page.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('the safety experience in the conversation has no serious accessibility violations', async ({ page }) => {
  await startConversation(page, 'en', 'My husband is threatening me and I need somewhere safe.');
  await expect(page.getByTestId('safety-panel')).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id)).toEqual([]);
});

// 20
test('mobile navigation reaches every main area @mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'bottom navigation is phone-only');
  await page.goto('/en');
  const nav = page.getByTestId('bottom-nav');
  await expect(nav).toBeVisible();
  for (const [name, url] of [
    ['Browse', /\/en\/explore$/],
    ['Saved', /\/en\/saved$/],
    ['Urgent', /\/en\/safety$/],
    ['Find', /\/en\/ask$/],
  ] as const) {
    await nav.getByRole('link', { name }).click();
    await expect(page).toHaveURL(url);
    await expect(nav.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
  }
});

test('no horizontal scrolling on small phones in any language', async ({ browser }) => {
  test.setTimeout(240_000); // 3 widths × 3 languages × 8 pages
  for (const width of [320, 360, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 760 } });
    for (const locale of ['uz', 'ru', 'en']) {
      for (const path of ['', '/credits', '/ask', '/explore', '/results', '/safety', '/how-it-works', '/programs/ezgu-amal-child-treatment', '/apply/ezgu-amal-child-treatment']) {
        await page.goto(`/${locale}${path}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${width}px /${locale}${path}`).toBeLessThanOrEqual(0);
      }
    }
    await page.close();
  }
});

test('an organization can create a draft program that stays private', async ({ page }) => {
  const title = `E2E program ${Date.now()}`;
  await page.goto('/en/org/new');
  await expect(page.locator('select option').first()).toBeAttached();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="summary"]').fill('Test program created by the end-to-end suite.');
  await page.getByRole('button', { name: 'Education', exact: true }).click();
  await page.getByTestId('org-submit').click();
  await expect(page).toHaveURL(/\/en\/org\?created=/);
  await expect(page.getByTestId('org-drafts')).toContainText(title);
  await page.goto('/en/explore');
  await page.getByTestId('program-search').fill(title);
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('the organization directory lists the imported organizations and hides funders @mobile', async ({ page }) => {
  await page.goto('/en/organizations');
  await expect(page.getByTestId('directory-count')).toHaveText('52 organizations');
  await page.getByTestId('directory-search').fill('karlar');
  await page.getByTestId('directory-search').press('Enter');
  await expect(page.getByTestId('directory-list').getByRole('link')).toHaveCount(1);
  await page.getByTestId('directory-list').getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('O‘zbekiston Karlar jamiyati');
  await expect(page.getByText("We haven't collected a description for this organization yet.")).toBeVisible();
  for (const q of ['Jahon banki', 'Mehr Nuri']) {
    await page.goto(`/en/organizations?q=${encodeURIComponent(q)}`);
    await expect(page.getByTestId('directory-count')).toHaveText('No organizations');
  }
});
