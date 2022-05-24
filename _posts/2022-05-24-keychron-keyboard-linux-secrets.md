---
layout: post
title: "Keychron keyboard special shortcuts and Linux function keys"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/170081400-318ce365-e8ed-40f8-99ed-f211f47a5872.png
---

# Special Shortcuts

| Shortcut    | Description |
| ----------- | ----------- |
| `FN + B` | Battery level (RGB versions - if the power is above 70%, the charging indicator is green; at 30%~70 %, the charging indicator will be blue; when it is under 30%, the charging indicator will keep flashing.) |
| `FN + +` | Faster LEDs |
| `FN + -` | Slower LEDs |
| `FN + S + O` (4 seconds) | Disable auto-sleep mode |
| `FN + X + L` (4 seconds) | Switch between function and multimedia keys |
| `FN + J + Z` (4 seconds) | Factory reset |
| `FN + Left/Right Arrow` | Change LED Colours for current effect |
| `FN + Caps Lock + P` | Hold these three keys together for 6 seconds, The Caps Lock key will no longer follow the backlight mode, it will be used to indicate the status of capital/ small letters. Repeat to return to following other keys' |
| `FN + L + Light` | Hold these three keys together for 6 seconds it will lock the light effect you are using now. To unlock the light effect, press these three keys together for 6 seconds again. Please make sure to hold the fn and L key first then hold the light effect key. |
| `FN + I + D` | Hold these three keys together for 6 seconds, and the function of the del key will be reversed to insert. Then the short press the key to get insert, press fn key combination will get the del function. Hold these three keys together for 6 seconds again to change back to the default. |
| `FN + S + L + R` | Set the auto sleep time to 10 mins |
| `FN + S + L + T` | Set the auto sleep time to 20 mins |
| `FN + S + L + Y` | Set the auto sleep time to 30 mins |
| `FN + Light` | Turn lights on / off |
| `FN + Q` (4 seconds) | Activate discoverable mode |
| `FN + 1 / 2 / 3` | Change connected device (up to 3 devices) |
| `FN + K + C` (4 seconds) | The function of F5/F6 will switch to the normal F5/F6 function under the Mac system, and the keyboard backlight control will adjust to FN+F5/F6. And vice versa. |


# Linux Function Keys

On Linux, the Keychron K2 doesn't register any of the F1-F12 function keys as actual F keys, instead, treating them as multimedia keys by default. Here's how to fix it!

## To fix it:

Set the keyboard to Windows mode via the side switch and use the `Fn + X + L` shortcut to set the function key row to "Function" mode.

Run: `echo 0 | sudo tee /sys/module/hid_apple/parameters/fnmode`

Once complete, the F1-F12 keys should work properly, and holding Fn turns them into multimedia keys.

## To persist this change:

Run this to add a module option for hid_apple:

`echo "options hid_apple fnmode=0" | sudo tee -a /etc/modprobe.d/hid_apple.conf`

For ubuntu: `sudo update-initramfs -u`

For Arch: `mkinitcpio -P`

I hope this helps.
