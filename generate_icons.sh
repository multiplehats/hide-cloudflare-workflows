#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "This script requires ImageMagick to be installed."
    echo "Please install it and try again."
    exit 1
fi

# Generate icons of different sizes
convert -background none -size 16x16 icon.svg icon16.png
convert -background none -size 48x48 icon.svg icon48.png
convert -background none -size 128x128 icon.svg icon128.png

echo "Icons generated successfully!"