import { expect, test } from '@playwright/test';

/**
 * Live Gemini (ADK) flow. Needs the API running with GEMINI_API_KEY set and ASSISTANT_ENGINE
 * not "scripted"; opt in with E2E_GEMINI=1 because it calls a paid, non-deterministic model.
 */
test.skip(!process.env.E2E_GEMINI, 'Set E2E_GEMINI=1 to run against the live Gemini engine');

test('AI-assisted mode answers from the program database, in the chosen language', async ({ page }) => {
  test.setTimeout(90_000);
  const engines: string[] = [];
  page.on('response', async (r) => {
    if (r.url().endsWith('/api/v1/assistant/turn')) engines.push(((await r.json()) as { engine: string }).engine);
  });
  await page.goto('/uz/ask');
  await page.getByTestId('mode-ai').check({ force: true });
  await page.getByTestId('chat-input').fill('Men Toshkentda yashayman, ikki farzandim bor, ishsizman. Oziq-ovqat uchun yordam kerak.');
  await page.getByTestId('chat-submit').click();
  await expect(page.getByTestId('assistant-message').first()).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId('ai-provider-notice')).toHaveAttribute('data-mode', 'ai');

  // Whatever the model says, the cards come from the matching engine.
  if (!(await page.getByTestId('chat-results').count())) {
    await page.getByTestId('chat-input').fill('Yoshim 30 da. Dasturlarni ko‘rsating.');
    await page.getByTestId('chat-input').press('Enter');
  }
  await expect(page.getByTestId('chat-results').getByTestId('match-card').first()).toBeVisible({ timeout: 45_000 });
  expect(engines).toContain('gemini');
});
