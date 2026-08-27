const { Jimp } = require("jimp");
const path = require("path");

const files = [
  "flat15-1.jpg",
  "flat15-2.jpg",
  "flat15-3.jpg",
  "flat15-4.png",
  "flat15-5.jpg",
];

const assetsDir = path.resolve("src/assets");
const publicDir = path.resolve("public");

async function processImage(filename) {
  const filePath = path.join(assetsDir, filename);
  console.log(`Processing ${filename}...`);
  
  const image = await Jimp.read(filePath);

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // If pixel is near-black background (R, G, B all < 55)
    if (r < 55 && g < 55 && b < 55) {
      this.bitmap.data[idx + 0] = 255; // Red
      this.bitmap.data[idx + 1] = 255; // Green
      this.bitmap.data[idx + 2] = 255; // Blue
      this.bitmap.data[idx + 3] = 255; // Alpha
    }
  });

  const outAssets = path.join(assetsDir, filename);
  const outPublic = path.join(publicDir, filename);

  await image.write(outAssets);
  await image.write(outPublic);
  console.log(`Successfully converted background to white for ${filename}`);
}

async function main() {
  for (const f of files) {
    await processImage(f);
  }
}

main().catch(console.error);
