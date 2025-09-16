#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

async function makeLottieFromSequence({
  imagesDir,
  outPath,
  fps = 60,
  width = 1880,
  height = 920,
  urlPrefix = "images/",
}) {
  try {
    // Read image files
    const files = await readdir(imagesDir);
    const imageFiles = files
      .filter((file) => /\.(webp|png|jpg|jpeg)$/i.test(file))
      .sort(naturalSort);

    if (imageFiles.length === 0) {
      throw new Error(`No image files found in ${imagesDir}`);
    }

    const n = imageFiles.length;
    const cx = width / 2.0;
    const cy = height / 2.0;

    // Build data structure
    const data = {
      v: "5.5.9",
      fr: fps,
      ip: 0,
      op: n,
      w: width,
      h: height,
      nm: "image-sequence",
      ddd: 0,
      assets: [],
      layers: [],
    };

    // Build assets
    for (let i = 0; i < imageFiles.length; i++) {
      const ext = path.extname(imageFiles[i]).toLowerCase().slice(1);
      data.assets.push({
        id: `image_${i}`,
        w: width,
        h: height,
        u: urlPrefix,
        p: imageFiles[i],
        e: 0,
      });
    }

    // Build layers
    for (let i = 0; i < imageFiles.length; i++) {
      const ext = path.extname(imageFiles[i]).toLowerCase().slice(1);
      data.layers.push({
        ddd: 0,
        ind: i + 1,
        ty: 2,
        nm: imageFiles[i],
        cl: ext,
        refId: `image_${i}`,
        sr: 1,
        ks: {
          p: { a: 0, k: [cx, cy, 0] },
          a: { a: 0, k: [cx, cy, 0] },
        },
        ao: 0,
        ip: i,
        op: i + 1,
        st: i,
        bm: 0,
      });
    }

    // Ensure output directory exists
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Write file
    await writeFile(outPath, JSON.stringify(data, null, 0), "utf8");

    console.log(`✓ Wrote ${outPath}`);
    console.log(`   frames: ${n}, fps: ${fps}, size: ${width}x${height}`);
    console.log(`   assets url prefix: ${urlPrefix}`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];

    if (key === "images-dir") options.imagesDir = value;
    else if (key === "out") options.outPath = value;
    else if (key === "fps") options.fps = parseFloat(value);
    else if (key === "width") options.width = parseInt(value);
    else if (key === "height") options.height = parseInt(value);
    else if (key === "url-prefix") options.urlPrefix = value;
  }

  if (!options.imagesDir || !options.outPath) {
    console.log(`
Usage: node scripts/make-lottie.js \\
    --images-dir ./public/animations/images \\
    --out ./public/animations/data.json \\
    --fps 60 \\
    --width 1880 \\
    --height 920
    `);
    process.exit(1);
  }

  makeLottieFromSequence(options);
}

module.exports = { makeLottieFromSequence };
