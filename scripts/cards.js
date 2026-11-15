// Draws the profile banner, numbers card and languages card into assets/.
// Run: GITHUB_TOKEN=... node scripts/cards.js   (the workflow runs it weekly)
const fs = require('fs');
const path = require('path');

const USER = 'akshayreddy9';
const OUT = path.join(__dirname, '..', 'assets');

const THEMES = {
  dark: { bg: '#0B1220', panel: '#111A2E', line: '#1E2A44', text: '#E6EDF7', muted: '#8B9BB4', accent: '#2DD4BF', accent2: '#FBBF24', photoBg: '#99F6E4', ink: '#0B1220' },
  light: { bg: '#F7FAFC', panel: '#FFFFFF', line: '#DDE5EE', text: '#0F172A', muted: '#55657E', accent: '#0D9488', accent2: '#D97706', photoBg: '#CCFBF1', ink: '#0F172A' },
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace";

// Real counts from the project repos; update them when the projects grow.
const NUMBERS = [
  { value: '76', label: 'API endpoints', sub: 'GGPay server' },
  { value: '35', label: 'app screens', sub: 'GGPay Android app' },
  { value: '15', label: 'DB migrations', sub: 'Craftkiya · Postgres RLS' },
  { value: '22', label: 'Python modules', sub: 'Banking AI assistant' },
];

const LANG_COLORS = {
  Python: '#3572A5', TypeScript: '#3178C6', JavaScript: '#F1E05A', CSS: '#663399',
  HTML: '#E34C26', PLpgSQL: '#94A3B8', 'Jupyter Notebook': '#DA5B0B', Batchfile: '#C1F12E',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Dithered portrait (scripts/portrait.js) in a round frame, tinted per theme through an alpha mask.
const PORTRAIT = fs.readFileSync(path.join(OUT, 'portrait.png')).toString('base64');

function banner(t) {
  const cx = 860, cy = 130, r = 112;
  // A small neural network on the right: three layers, every node linked to the next layer.
  const layers = [[85, 130, 175], [62, 107, 153, 198], [100, 160], [130]];
  const xs = [560, 610, 660, 705];
  const nodes = layers.map((ys, i) => ys.map((y) => [xs[i], y]));
  let edges = '';
  for (let i = 0; i < nodes.length - 1; i++)
    for (const [x1, y1] of nodes[i])
      for (const [x2, y2] of nodes[i + 1])
        edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const dots = nodes.flat().map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${i % 4 === 1 ? 6 : 5}" fill="${i % 4 === 1 ? t.accent2 : t.accent}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.line}" stroke-width="1"/></pattern>
    <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${t.bg}" stop-opacity="1"/><stop offset="1" stop-color="${t.bg}" stop-opacity="0.2"/></linearGradient>
  </defs>
  <rect width="1000" height="260" rx="18" fill="${t.bg}"/>
  <rect width="1000" height="260" rx="18" fill="url(#grid)" opacity="0.6"/>
  <rect width="1000" height="260" rx="18" fill="url(#fade)"/>
  <g stroke="${t.accent}" stroke-opacity="0.28" stroke-width="1.2">${edges}</g>
  ${dots}
  <mask id="pm" style="mask-type:alpha"><image href="data:image/png;base64,${PORTRAIT}" x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" style="image-rendering:pixelated"/></mask>
  <clipPath id="pc"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
  <circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="${t.accent}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="3 6"/>
  <g clip-path="url(#pc)">
    <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${t.photoBg}"/>
    <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${t.ink}" mask="url(#pm)"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.accent}" stroke-width="3"/>
  <text x="56" y="78" font-family="${MONO}" font-size="15" font-weight="600" letter-spacing="2.5" fill="${t.accent}">AI ENGINEER  ·  FULL-STACK DEVELOPER</text>
  <text x="54" y="148" font-family="${SANS}" font-size="64" font-weight="800" fill="${t.text}">Akshay</text>
  <text x="56" y="188" font-family="${SANS}" font-size="20" fill="${t.muted}">I train machine-learning models and ship them</text>
  <text x="56" y="215" font-family="${SANS}" font-size="20" fill="${t.muted}">inside real web and mobile apps.</text>
</svg>`;
}

function numbers(t) {
  const w = 1000, tile = (w - 3 * 16) / 4;
  const tiles = NUMBERS.map((n, i) => {
    const x = i * (tile + 16);
    return `<g transform="translate(${x},0)">
    <rect width="${tile}" height="150" rx="14" fill="${t.panel}" stroke="${t.line}"/>
    <rect x="22" y="24" width="28" height="4" rx="2" fill="${i % 2 ? t.accent2 : t.accent}"/>
    <text x="22" y="88" font-family="${SANS}" font-size="46" font-weight="800" fill="${t.text}">${esc(n.value)}</text>
    <text x="22" y="114" font-family="${SANS}" font-size="16" font-weight="600" fill="${t.text}">${esc(n.label)}</text>
    <text x="22" y="134" font-family="${MONO}" font-size="12" fill="${t.muted}">${esc(n.sub)}</text>
  </g>`;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="150" viewBox="0 0 ${w} 150">
  ${tiles}
</svg>`;
}

function languages(t, langs) {
  const total = langs.reduce((s, l) => s + l.bytes, 0) || 1;
  let x = 24, bar = '';
  const barW = 952;
  langs.forEach((l, i) => {
    const wSeg = i === langs.length - 1 ? 24 + barW - x : Math.round((l.bytes / total) * barW);
    bar += `<rect x="${x}" y="64" width="${Math.max(wSeg, 2)}" height="14" fill="${l.color}"/>`;
    x += wSeg;
  });
  const legend = langs.map((l, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const lx = 24 + col * 320, ly = 116 + row * 30;
    return `<circle cx="${lx + 6}" cy="${ly - 5}" r="6" fill="${l.color}"/>
    <text x="${lx + 20}" y="${ly}" font-family="${SANS}" font-size="15" fill="${t.text}">${esc(l.name)} <tspan fill="${t.muted}">${((l.bytes / total) * 100).toFixed(1)}%</tspan></text>`;
  }).join('\n    ');
  const h = 116 + Math.ceil(langs.length / 3) * 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${h}" viewBox="0 0 1000 ${h}">
  <rect width="1000" height="${h}" rx="14" fill="${t.panel}" stroke="${t.line}"/>
  <text x="24" y="42" font-family="${SANS}" font-size="18" font-weight="700" fill="${t.text}">Languages across my repos</text>
  <clipPath id="r"><rect x="24" y="64" width="${barW}" height="14" rx="7"/></clipPath>
  <g clip-path="url(#r)">${bar}</g>
    ${legend}
</svg>`;
}

async function gh(url) {
  const headers = { 'User-Agent': USER, Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(`https://api.github.com${url}`, { headers });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

async function fetchLanguages() {
  const repos = (await gh(`/users/${USER}/repos?per_page=100&type=owner`)).filter((r) => !r.fork && r.name !== USER);
  const sums = {};
  for (const repo of repos)
    for (const [name, bytes] of Object.entries(await gh(`/repos/${USER}/${repo.name}/languages`)))
      sums[name] = (sums[name] || 0) + bytes;
  return Object.entries(sums)
    .filter(([name]) => name !== 'Batchfile')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bytes]) => ({ name, bytes, color: LANG_COLORS[name] || '#8B9BB4' }));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const langs = await fetchLanguages();
  for (const [name, t] of Object.entries(THEMES)) {
    fs.writeFileSync(path.join(OUT, `banner-${name}.svg`), banner(t));
    fs.writeFileSync(path.join(OUT, `numbers-${name}.svg`), numbers(t));
    fs.writeFileSync(path.join(OUT, `languages-${name}.svg`), languages(t, langs));
  }
  console.log('languages:', langs.map((l) => l.name).join(', '));
})();
