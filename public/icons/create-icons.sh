
#!/bin/bash
# This script creates icons for PWA from a source image
# You need to have ImageMagick installed for this to work

SOURCE_IMAGE="../../src/assets/logo.png"

# Create the different sized icons
for size in 72 96 128 144 152 192 384 512; do
  convert $SOURCE_IMAGE -resize ${size}x${size} icon-${size}x${size}.png
done

echo "Icons created successfully"
