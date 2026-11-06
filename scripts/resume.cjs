// Renders src/resume.html to resume.pdf (one US-letter page).  node scripts/resume.cjs
// Needs Playwright with Chromium; fonts load from Google Fonts.
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const root = path.join(__dirname, '..');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(root, 'src', 'resume.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(root, 'resume.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
  const pages = await p.evaluate(() => Math.ceil(document.body.scrollHeight / (11 * 96 - 0.6 * 96)));
  console.log('resume.pdf written; estimated pages:', pages);
  await b.close();
})();
