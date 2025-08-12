#!/bin/bash

set -e

# ISIZE="32" /Applications/Inkscape.app/Contents/MacOS/inkscape --export-width="$ISIZE" --export-filename=icon-$ISIZE.png icon.svg
# Cannot parse integer value “” for --export-width

SIZE=( 16 32 48 128 )
INKSCAPE_PATH=/Applications/Inkscape.app/Contents/MacOS/inkscape

for i in "${SIZE[@]}"; do
  "$INKSCAPE_PATH" --export-width="${i}" --export-filename="icon-${i}.png" icon.svg
done