const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPNG(width, height, colorFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk("IHDR", ihdrData);

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = colorFn(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }
  const compressed = zlib.deflateSync(Buffer.concat(rawRows));
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Icon rendering logic with brand colors: Terracotta brown (#6f4627 -> 111, 70, 39), Warm cream (#faf6f2), Gold (#d4af37)
function renderBukuAjaibIcon(isMaskable) {
  return function(x, y, w, h) {
    const nx = x / w;
    const ny = y / h;
    const cx = 0.5;
    const cy = 0.5;
    const dx = nx - cx;
    const dy = ny - cy;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    // If not maskable, round the corners with a nice radius
    if (!isMaskable) {
      const cornerR = 0.22;
      const qx = Math.max(0, Math.abs(dx) - (0.5 - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (0.5 - cornerR));
      if (Math.sqrt(qx * qx + qy * qy) > cornerR) {
        return [0, 0, 0, 0]; // transparent outside
      }
    }

    // Background gradient: #6f4627 (top left) to #432813 (bottom right)
    const bgT = (nx + ny) * 0.5;
    const bgR = Math.round(111 * (1 - bgT) + 67 * bgT);
    const bgG = Math.round(70 * (1 - bgT) + 40 * bgT);
    const bgB = Math.round(39 * (1 - bgT) + 19 * bgT);

    // Book motif in the center (scale inside 0.2 - 0.8)
    const inBookY = ny >= 0.35 && ny <= 0.72;
    const inBookLeft = nx >= 0.22 && nx <= 0.48 && inBookY;
    const inBookRight = nx >= 0.52 && nx <= 0.78 && inBookY;
    const inBookSpine = nx >= 0.48 && nx <= 0.52 && inBookY;

    if (inBookSpine) {
      // Red bookmark ribbon
      if (nx >= 0.49 && nx <= 0.51 && ny >= 0.33 && ny <= 0.76) {
        return [196, 69, 54, 255]; // crimson ribbon
      }
      return [140, 98, 57, 255];
    }

    if (inBookLeft) {
      // Subtle ruled lines on left page
      const lineY = Math.floor(ny * 25);
      if (lineY >= 11 && lineY <= 16 && (lineY % 2 === 0) && nx >= 0.26 && nx <= 0.44) {
        return [190, 170, 155, 255];
      }
      return [250, 246, 242, 255]; // Warm paper
    }

    if (inBookRight) {
      // Golden envelope seal icon on right page
      const envDx = nx - 0.65;
      const envDy = ny - 0.54;
      if (Math.abs(envDx) < 0.08 && Math.abs(envDy) < 0.05) {
        // Heart in center
        if (Math.sqrt(envDx * envDx + envDy * envDy) < 0.02) {
          return [212, 175, 55, 255]; // Gold heart seal
        }
        return [255, 255, 255, 255]; // Envelope body
      }
      return [245, 238, 230, 255]; // Right page
    }

    // Wedding Rings symbol above the book (ny ~ 0.22 to 0.31)
    const ringL = Math.sqrt((nx - 0.47) * (nx - 0.47) + (ny - 0.26) * (ny - 0.26));
    const ringR = Math.sqrt((nx - 0.53) * (nx - 0.53) + (ny - 0.26) * (ny - 0.26));
    if ((ringL >= 0.045 && ringL <= 0.062) || (ringR >= 0.045 && ringR <= 0.062)) {
      return [235, 195, 75, 255]; // Gold ring
    }

    return [bgR, bgG, bgB, 255];
  };
}

const outDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, renderBukuAjaibIcon(false)));

// Generate 512x512
console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, renderBukuAjaibIcon(false)));

// Generate 512x512 maskable (with safe zone, full bleed)
console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, renderBukuAjaibIcon(true)));

// Generate apple-touch-icon 180x180
console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, renderBukuAjaibIcon(false)));

// Generate favicon.ico (using 32x32 PNG header in ico format or 32x32 png)
console.log('Generating favicon.ico (32x32)...');
const png32 = createPNG(32, 32, renderBukuAjaibIcon(false));
// An ICO file header containing 1 PNG image:
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoDir = Buffer.alloc(16);
icoDir.writeUInt8(32, 0); // width
icoDir.writeUInt8(32, 1); // height
icoDir.writeUInt8(0, 2);  // color palette 0
icoDir.writeUInt8(0, 3);  // reserved
icoDir.writeUInt16LE(1, 4); // color planes
icoDir.writeUInt16LE(32, 6); // bpp
icoDir.writeUInt32LE(png32.length, 8); // image size
icoDir.writeUInt32LE(22, 12); // offset 6 + 16 = 22

fs.writeFileSync(path.join(outDir, 'favicon.ico'), Buffer.concat([icoHeader, icoDir, png32]));

console.log('All PWA assets generated successfully!');
