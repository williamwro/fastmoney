
#!/bin/bash
# This script creates money-themed icons for PWA
# You need to have ImageMagick installed for this to work

# Create a temporary SVG with a wallet icon
cat > temp_icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet">
  <rect width="20" height="16" x="2" y="4" rx="2" fill="#3b82f6"/>
  <path d="M22 10v4a2 2 0 0 1-2 2h-4v-6h4a2 2 0 0 1 2 2Z" fill="#ffffff"/>
  <path d="M18 16h-4v-6h4" fill="#ffffff"/>
</svg>
EOF

# Create the different sized icons
for size in 72 96 128 144 152 192 384 512; do
  convert -background none temp_icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done

# Create favicon.ico
convert temp_icon.svg -resize 32x32 -background none favicon.ico

# Remove the temporary SVG
rm temp_icon.svg

echo "Money-themed icons created successfully"
