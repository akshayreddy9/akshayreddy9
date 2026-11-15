// One-off: turns a photo into a 1-bit Floyd–Steinberg dithered portrait (assets/portrait.png)
// that cards.js embeds in the banner. Needs: npm i --no-save jpeg-js pngjs
// Run: node scripts/portrait.js path/to/photo.jpg
const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const SIZE = 150; // output pixels per side; the banner draws it at 220px
const CROP = { x: 90, y: 20, size: 1100 }; // square around head and shoulders in the source photo

const src = jpeg.decode(fs.readFileSync(process.argv[2]));

// Area-average the crop down to SIZE x SIZE luminance values (0..1).
const lum = new Float32Array(SIZE * SIZE);
const step = CROP.size / SIZE;
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    let sum = 0, n = 0;
    for (let sy = Math.floor(CROP.y + y * step); sy < CROP.y + (y + 1) * step; sy++)
      for (let sx = Math.floor(CROP.x + x * step); sx < CROP.x + (x + 1) * step; sx++) {
        const i = (sy * src.width + sx) * 4;
        sum += (0.2126 * src.data[i] + 0.7152 * src.data[i + 1] + 0.0722 * src.data[i + 2]) / 255;
        n++;
      }
    lum[y * SIZE + x] = sum / n;
  }

// Sharpen (unsharp mask) so eyes and beard survive the downscale.
const blur = new Float32Array(lum.length);
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    let sum = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < SIZE && xx >= 0 && xx < SIZE) { sum += lum[yy * SIZE + xx]; n++; }
      }
    blur[y * SIZE + x] = sum / n;
  }
for (let i = 0; i < lum.length; i++) lum[i] += 0.8 * (lum[i] - blur[i]);

// Stretch contrast between the 2nd and 98th percentile, then lift the midtones so skin reads light.
const sorted = Array.from(lum).sort((a, b) => a - b);
const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
for (let i = 0; i < lum.length; i++) lum[i] = Math.pow(Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo))), 0.55);

// Floyd–Steinberg: an "ink" pixel wherever the photo is dark.
const ink = new Uint8Array(SIZE * SIZE);
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    const i = y * SIZE + x, v = lum[i], out = v < 0.5 ? 0 : 1, err = v - out;
    ink[i] = out ? 0 : 1;
    if (x + 1 < SIZE) lum[i + 1] += (err * 7) / 16;
    if (y + 1 < SIZE) {
      if (x > 0) lum[i + SIZE - 1] += (err * 3) / 16;
      lum[i + SIZE] += (err * 5) / 16;
      if (x + 1 < SIZE) lum[i + SIZE + 1] += err / 16;
    }
  }

// Ink is opaque black and everything else transparent; cards.js tints it per theme.
const png = new PNG({ width: SIZE, height: SIZE });
for (let i = 0; i < ink.length; i++) png.data.set([0, 0, 0, ink[i] ? 255 : 0], i * 4);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'portrait.png'), PNG.sync.write(png));
console.log('wrote assets/portrait.png');
