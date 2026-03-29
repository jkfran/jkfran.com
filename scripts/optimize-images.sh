#!/bin/bash
# Download all post images, resize to max 1200x675, convert to JPEG
set -e

MAX_WIDTH=1200
MAX_HEIGHT=675
TMPDIR=$(mktemp -d)

echo "Working in $TMPDIR"

process_image() {
  local name="$1"
  local url="$2"
  local outfile="$TMPDIR/${name}.jpg"

  echo "Downloading: $name"
  curl -sL -o "$TMPDIR/${name}_orig" "$url"

  w=$(sips -g pixelWidth "$TMPDIR/${name}_orig" | tail -1 | awk '{print $2}')
  h=$(sips -g pixelHeight "$TMPDIR/${name}_orig" | tail -1 | awk '{print $2}')
  echo "  Original: ${w}x${h}"

  if [ "$w" -gt "$MAX_WIDTH" ] || [ "$h" -gt "$MAX_HEIGHT" ]; then
    scale_w=$(echo "scale=4; $MAX_WIDTH / $w" | bc)
    scale_h=$(echo "scale=4; $MAX_HEIGHT / $h" | bc)

    if [ "$(echo "$scale_w < $scale_h" | bc -l)" -eq 1 ]; then
      new_w=$MAX_WIDTH
      new_h=$(echo "$h * $scale_w / 1" | bc)
    else
      new_h=$MAX_HEIGHT
      new_w=$(echo "$w * $scale_h / 1" | bc)
    fi

    echo "  Resizing to: ${new_w}x${new_h}"
    sips -z "$new_h" "$new_w" "$TMPDIR/${name}_orig" --out "$outfile" -s format jpeg -s formatOptions 85 >/dev/null 2>&1
  else
    echo "  Already within limits"
    sips -s format jpeg -s formatOptions 85 "$TMPDIR/${name}_orig" --out "$outfile" >/dev/null 2>&1
  fi

  rm "$TMPDIR/${name}_orig"
  size=$(ls -lh "$outfile" | awk '{print $5}')
  final_w=$(sips -g pixelWidth "$outfile" | tail -1 | awk '{print $2}')
  final_h=$(sips -g pixelHeight "$outfile" | tail -1 | awk '{print $2}')
  echo "  Final: ${final_w}x${final_h} ($size)"
}

process_local() {
  local name="$1"
  local path="$2"
  local outfile="$TMPDIR/${name}.jpg"

  echo "Copying local: $name"
  cp "$path" "$TMPDIR/${name}_orig"

  w=$(sips -g pixelWidth "$TMPDIR/${name}_orig" | tail -1 | awk '{print $2}')
  h=$(sips -g pixelHeight "$TMPDIR/${name}_orig" | tail -1 | awk '{print $2}')
  echo "  Original: ${w}x${h}"

  if [ "$w" -gt "$MAX_WIDTH" ] || [ "$h" -gt "$MAX_HEIGHT" ]; then
    scale_w=$(echo "scale=4; $MAX_WIDTH / $w" | bc)
    scale_h=$(echo "scale=4; $MAX_HEIGHT / $h" | bc)

    if [ "$(echo "$scale_w < $scale_h" | bc -l)" -eq 1 ]; then
      new_w=$MAX_WIDTH
      new_h=$(echo "$h * $scale_w / 1" | bc)
    else
      new_h=$MAX_HEIGHT
      new_w=$(echo "$w * $scale_h / 1" | bc)
    fi

    echo "  Resizing to: ${new_w}x${new_h}"
    sips -z "$new_h" "$new_w" "$TMPDIR/${name}_orig" --out "$outfile" -s format jpeg -s formatOptions 85 >/dev/null 2>&1
  else
    echo "  Already within limits"
    sips -s format jpeg -s formatOptions 85 "$TMPDIR/${name}_orig" --out "$outfile" >/dev/null 2>&1
  fi

  rm "$TMPDIR/${name}_orig"
  size=$(ls -lh "$outfile" | awk '{print $5}')
  final_w=$(sips -g pixelWidth "$outfile" | tail -1 | awk '{print $2}')
  final_h=$(sips -g pixelHeight "$outfile" | tail -1 | awk '{print $2}')
  echo "  Final: ${final_w}x${final_h} ($size)"
}

process_local "hello-world" "assets/images/hello-world.png"
process_image "converting-iphone-bot" "https://user-images.githubusercontent.com/6353928/150762225-08079e98-97fb-4c00-bdd1-0d0ce59c3cb3.png"
process_image "ubuntu-arm-docker" "https://user-images.githubusercontent.com/6353928/155136689-7f3ccb69-608a-43b6-a294-59f4bdb83ce4.png"
process_image "solid-principles-python" "https://user-images.githubusercontent.com/6353928/156574349-a8e92eda-c016-4a51-9c8c-6776cefd7f49.png"
process_image "big-o-notation-python" "https://user-images.githubusercontent.com/6353928/158666789-b37d45a7-e213-4a4f-a21d-efdc94aacf5e.png"
process_image "logitech-mx-master" "https://user-images.githubusercontent.com/6353928/161268803-b3a16b4a-2d80-47e0-9f55-c8b656cbe3ea.png"
process_image "firefox-deb-ubuntu" "https://user-images.githubusercontent.com/6353928/165127566-5ed7bd3d-f787-4996-801f-9e871c9544b3.png"
process_image "pipewire-airpods-ubuntu" "https://user-images.githubusercontent.com/6353928/166063808-49214484-38ec-4d42-8e92-45c45a1b5a38.png"
process_image "keychron-keyboard-linux" "https://user-images.githubusercontent.com/6353928/170081400-318ce365-e8ed-40f8-99ed-f211f47a5872.png"
process_image "raspberry-pi-arcade" "https://user-images.githubusercontent.com/6353928/194561045-81b72eb8-84e1-4c67-a34d-65420871c8ef.png"
process_image "redis-docker" "https://user-images.githubusercontent.com/6353928/205102657-c1d7d9ae-1925-4f70-9700-215789fa0fbe.png"
process_image "azure-kubernetes-vm" "https://user-images.githubusercontent.com/6353928/225109979-9c3ddf33-eda8-461f-8d55-44fc809b13ff.png"
process_image "killport" "https://user-images.githubusercontent.com/6353928/226195669-85263e2b-6953-4476-8e42-5892dcce28dd.png"
process_image "sentry-python" "https://user-images.githubusercontent.com/6353928/226624793-ab4a4fca-81b0-4b24-85a1-982594f9441e.png"
process_image "vector-embedding-databases" "https://github.com/jkfran/jkfran.com/assets/6353928/c709f19e-ebab-49a1-a5f1-6a13475d5f33"
process_image "self-hosted-vector-database" "https://github.com/jkfran/jkfran.com/assets/6353928/8c5d0db8-eb7e-4c36-b952-bba82a29529f"
process_image "mlflow-custom-metrics" "https://github.com/jkfran/jkfran.com/assets/6353928/a8ed0521-a89e-4606-9922-13c5df584fd6"

echo ""
echo "All images processed in $TMPDIR"
ls -lh "$TMPDIR"/*.jpg
