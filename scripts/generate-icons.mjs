// Genera les icones PWA (tema piscina/aigua) com a PNG reals,
// sense dependències externes, fent servir només `zlib` de Node.
//
//   node scripts/generate-icons.mjs
//
// Produeix: public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
// i public/apple-touch-icon.png (180).

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ---- Utilitats PNG -------------------------------------------------------

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function pngFromRGBA(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Afegeix el byte de filtre (0) al començament de cada fila.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Dibuix de la icona --------------------------------------------------

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Dibuixa una icona quadrada amb tema d'aigua:
// fons amb degradat blau, ones blanques i una gota d'aigua centrada.
function drawIcon(size, { padding = 0 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);

  // Colors (coincideixen amb la paleta "aigua" de Tailwind).
  const top = [0x54, 0xc0, 0xff]; // aigua-400
  const bottom = [0x13, 0x69, 0xdc]; // aigua-700
  const white = [0xff, 0xff, 0xff];

  const inner = padding; // marge per icones "maskable"
  const r = size * 0.18; // radi de cantonada arrodonida

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Fora del marge segur: transparent (per maskable es deixa el fons).
      const fx = x - inner;
      const fy = y - inner;
      const inSize = size - inner * 2;

      let inside = fx >= 0 && fy >= 0 && fx < inSize && fy < inSize;

      // Cantonades arrodonides (només quan no hi ha padding maskable).
      if (inside && padding === 0) {
        const corners = [
          [r, r],
          [size - r, r],
          [r, size - r],
          [size - r, size - r],
        ];
        for (const [cx, cy] of corners) {
          const inCornerBox =
            (x < r || x > size - r) && (y < r || y > size - r);
          if (inCornerBox) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy > r * r) inside = false;
          }
        }
      }

      if (!inside) {
        rgba[idx] = 0;
        rgba[idx + 1] = 0;
        rgba[idx + 2] = 0;
        rgba[idx + 3] = 0;
        continue;
      }

      // Degradat vertical de fons.
      const t = fy / inSize;
      let cr = lerp(top[0], bottom[0], t);
      let cg = lerp(top[1], bottom[1], t);
      let cb = lerp(top[2], bottom[2], t);

      // Ones blanques (ripples) a la part inferior.
      const u = fx / inSize;
      const v = fy / inSize;
      for (const [yc, amp, freq, w] of [
        [0.62, 0.035, 9, 0.022],
        [0.74, 0.03, 7, 0.02],
        [0.86, 0.025, 11, 0.018],
      ]) {
        const wave = yc + Math.sin(u * Math.PI * freq) * amp;
        if (Math.abs(v - wave) < w) {
          cr = lerp(cr, white[0], 0.85);
          cg = lerp(cg, white[1], 0.85);
          cb = lerp(cb, white[2], 0.85);
        }
      }

      // Gota d'aigua centrada a la part superior.
      const cx = inSize * 0.5;
      const cy = inSize * 0.36;
      const rad = inSize * 0.17;
      const ddx = fx - cx;
      const ddy = fy - cy;
      // Forma de gota: cercle a baix, punta a dalt.
      const dropTop = cy - rad * 1.9;
      let isDrop = false;
      if (ddx * ddx + ddy * ddy <= rad * rad) {
        isDrop = true; // cos circular
      } else if (fy < cy && fy >= dropTop) {
        // triangle cap a la punta superior
        const prog = (fy - dropTop) / (cy - dropTop); // 0 a dalt, 1 a baix
        const halfW = rad * prog * prog;
        if (Math.abs(ddx) <= halfW) isDrop = true;
      }
      if (isDrop) {
        cr = white[0];
        cg = white[1];
        cb = white[2];
        // petit reflex blau dins la gota
        const hl = (fx - cx + rad * 0.35) ** 2 + (fy - cy + rad * 0.35) ** 2;
        if (hl < (rad * 0.28) ** 2) {
          cr = lerp(white[0], top[0], 0.5);
          cg = lerp(white[1], top[1], 0.5);
          cb = lerp(white[2], top[2], 0.5);
        }
      }

      rgba[idx] = Math.round(cr);
      rgba[idx + 1] = Math.round(cg);
      rgba[idx + 2] = Math.round(cb);
      rgba[idx + 3] = 255;
    }
  }

  return pngFromRGBA(size, size, rgba);
}

// ---- Genera els fitxers --------------------------------------------------

mkdirSync(join(root, "public", "icons"), { recursive: true });

const outputs = [
  ["public/icons/icon-192.png", drawIcon(192)],
  ["public/icons/icon-512.png", drawIcon(512)],
  // Maskable: deixa ~20% de marge segur perquè no es retalli el motiu.
  ["public/icons/icon-maskable-512.png", drawIcon(512, { padding: 51 })],
  ["public/apple-touch-icon.png", drawIcon(180)],
];

for (const [rel, buf] of outputs) {
  const out = join(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  console.log(`✓ ${rel} (${buf.length} bytes)`);
}
