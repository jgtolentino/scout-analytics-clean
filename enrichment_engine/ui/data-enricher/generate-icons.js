// Simple script to generate PWA icons
// This creates placeholder icons - replace with actual logo designs

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSvgIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#6366f1"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#ffffff" opacity="0.9"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold" fill="#6366f1" text-anchor="middle" dy=".3em">DE</text>
</svg>`;
};

// Sizes needed for PWA
const sizes = [96, 192, 512];

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');

// Generate SVG icons
sizes.forEach(size => {
  const svgContent = createSvgIcon(size);
  const filename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svgContent);
  console.log(`Created ${filename}`);
});

// Create a simple favicon.ico placeholder
const faviconSvg = createSvgIcon(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
console.log('Created favicon.svg');

console.log('\nIcon generation complete!');
console.log('Note: These are placeholder icons. For production, convert to PNG and replace with your actual logo.');