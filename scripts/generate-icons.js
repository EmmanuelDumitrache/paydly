/**
 * Script to generate icon files from SVG
 * This requires sharp to be installed: npm install sharp --save-dev
 * 
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed. Please run: npm install sharp --save-dev');
  process.exit(1);
}

const svgPath = path.join(__dirname, '../app/icon.svg');
const outputDir = path.join(__dirname, '../app');

// Read the SVG
const svgBuffer = fs.readFileSync(svgPath);

// Generate different sizes
const sizes = [
  { name: 'apple-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating icon files...');
  
  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }
  
  // Generate favicon.ico (multi-resolution)
  // Note: sharp doesn't support ICO directly, so we'll create a 32x32 PNG as favicon
  // For a true ICO file, you'd need a tool like imagemagick or an online converter
  const faviconPath = path.join(outputDir, 'favicon-32x32.png');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('✓ Generated favicon-32x32.png');
  console.log('\nNote: For favicon.ico, you may need to use an online converter or imagemagick');
  console.log('to combine multiple sizes into a single ICO file.');
}

generateIcons().catch(console.error);

