// Generates llms-full.txt from the chat's knowledge base, so crawlers and AI Sarath read the same facts.
//   node scripts/llms.mjs
import { writeFileSync } from 'node:fs';
import { KB } from '../api/_kb.js';

const SITE = 'https://saraths-portfolio.vercel.app';
const lines = [
  '# Sarath Sundar Harisaravanan: all facts',
  '',
  '> The complete set of facts used by the AI chat on ' + SITE + '. Each section is one fact, with the homepage section it appears in.',
  '',
  'Keep team credit and award wording exactly as written below. Numbers are as stated by Sarath and are not independently benchmarked unless noted.',
  '',
];
for (const d of KB) {
  lines.push(`## ${d.title}`, '', d.text, '');
  const refs = [`${SITE}/${d.target}`];
  if (d.href) refs.push(d.href);
  lines.push(`Source: ${refs.join(' · ')}`, '');
}
writeFileSync(new URL('../llms-full.txt', import.meta.url), lines.join('\n'));
console.log(`llms-full.txt: ${KB.length} facts`);
