#!/bin/bash
# Optimize a blog image and upload it (with responsive variants) to the
# blog-images GitHub release.
#
# Produces three JPEG files per input image:
#   <name>.jpg      — max 1200×675, used as the 1200w srcset source
#   <name>-800w.jpg — max  800w,    proportionally scaled
#   <name>-400w.jpg — max  400w,    proportionally scaled
#
# Requirements:
#   sips  — macOS built-in
#   gh    — GitHub CLI, authenticated
#
# Usage:
#   ./scripts/optimize-images.sh path/to/photo.png                 # name derived from filename
#   ./scripts/optimize-images.sh path/to/photo.png --name my-post  # explicit name
#   ./scripts/optimize-images.sh a.png b.jpg                       # multiple images
set -e

REPO="jkfran/jkfran.com"
RELEASE_TAG="blog-images"
MAX_WIDTH=1200
MAX_HEIGHT=675
JPEG_QUALITY=85
WORKDIR=$(mktemp -d)

trap 'rm -rf "$WORKDIR"' EXIT

# ── helpers ──────────────────────────────────────────────────────────────

die() { echo "Error: $*" >&2; exit 1; }

slug_from_path() {
  basename "$1" | sed 's/\.[^.]*$//' | tr '[:upper:]' '[:lower:]' | tr ' _' '--'
}

resize_to_fit() {
  local src="$1" dst="$2" max_w="$3" max_h="$4"

  local w h
  w=$(sips -g pixelWidth  "$src" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$src" | awk '/pixelHeight/{print $2}')

  if [ "$w" -le "$max_w" ] && [ "$h" -le "$max_h" ]; then
    sips -s format jpeg -s formatOptions "$JPEG_QUALITY" "$src" --out "$dst" >/dev/null 2>&1
  else
    local scale_w scale_h new_w new_h
    scale_w=$(echo "scale=6; $max_w / $w" | bc)
    scale_h=$(echo "scale=6; $max_h / $h" | bc)

    if [ "$(echo "$scale_w < $scale_h" | bc -l)" -eq 1 ]; then
      new_w=$max_w; new_h=$(echo "$h * $scale_w / 1" | bc)
    else
      new_h=$max_h; new_w=$(echo "$w * $scale_h / 1" | bc)
    fi

    sips -z "$new_h" "$new_w" "$src" --out "$dst" -s format jpeg -s formatOptions "$JPEG_QUALITY" >/dev/null 2>&1
  fi
}

resize_width() {
  local src="$1" dst="$2" target_w="$3"

  local w h
  w=$(sips -g pixelWidth  "$src" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$src" | awk '/pixelHeight/{print $2}')

  if [ "$w" -le "$target_w" ]; then
    cp "$src" "$dst"
  else
    local new_h
    new_h=$(echo "$h * $target_w / $w" | bc)
    sips -z "$new_h" "$target_w" "$src" --out "$dst" -s format jpeg -s formatOptions "$JPEG_QUALITY" >/dev/null 2>&1
  fi
}

dims() { sips -g pixelWidth -g pixelHeight "$1" 2>/dev/null | awk '/pixel/{d=d sep $2; sep="x"} END{print d}'; }
fsize() { ls -lh "$1" | awk '{print $5}'; }

# ── arg parsing ──────────────────────────────────────────────────────────

FILES=()
EXPLICIT_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) EXPLICIT_NAME="$2"; shift 2 ;;
    --help|-h)
      sed -n '2,/^set/{ /^#/s/^# *//p; }' "$0"
      exit 0
      ;;
    -*) die "Unknown option: $1" ;;
    *)  FILES+=("$1"); shift ;;
  esac
done

[ ${#FILES[@]} -eq 0 ] && die "No input files. Usage: $0 <image> [--name slug]"
[ ${#FILES[@]} -gt 1 ] && [ -n "$EXPLICIT_NAME" ] && die "--name can only be used with a single image"

command -v gh  >/dev/null || die "gh CLI not found. Install from https://cli.github.com"
gh auth status >/dev/null 2>&1 || die "gh not authenticated. Run: gh auth login"

# ── process each image ───────────────────────────────────────────────────

for input in "${FILES[@]}"; do
  [ -f "$input" ] || die "File not found: $input"

  name="${EXPLICIT_NAME:-$(slug_from_path "$input")}"
  full="$WORKDIR/${name}.jpg"
  w800="$WORKDIR/${name}-800w.jpg"
  w400="$WORKDIR/${name}-400w.jpg"

  echo "── $name ──"

  orig_w=$(sips -g pixelWidth "$input" | awk '/pixelWidth/{print $2}')
  orig_h=$(sips -g pixelHeight "$input" | awk '/pixelHeight/{print $2}')
  echo "  Input:  ${orig_w}x${orig_h} ($(fsize "$input"))"

  # 1. Optimize original → max 1200×675
  resize_to_fit "$input" "$full" "$MAX_WIDTH" "$MAX_HEIGHT"
  echo "  1200w:  $(dims "$full") ($(fsize "$full"))"

  # 2. Generate responsive variants from the optimized original
  resize_width "$full" "$w800" 800
  echo "  800w:   $(dims "$w800") ($(fsize "$w800"))"

  resize_width "$full" "$w400" 400
  echo "  400w:   $(dims "$w400") ($(fsize "$w400"))"

  # 3. Upload to GitHub release
  echo "  Uploading to $REPO release/$RELEASE_TAG ..."
  gh release upload "$RELEASE_TAG" "$full" "$w800" "$w400" \
    --repo "$REPO" --clobber >/dev/null 2>&1
  echo "  Done!"

  # 4. Print front-matter snippet
  echo ""
  echo "  Add to your post front matter:"
  echo "  image: https://github.com/$REPO/releases/download/$RELEASE_TAG/${name}.jpg"
  echo ""
done
