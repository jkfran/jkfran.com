---
layout: post
title: "Stadia Died in 2023. My Controller Didn't."
author: jkfran
categories: [projects]
description: "The Stadia Controller's Wi-Fi mode has pointed at a dead cloud since 2023. How I became that cloud on my LAN, and Stadiacast, the server that came out of it."
image: https://github.com/jkfran/jkfran.com/releases/download/blog-images/stadia-controller-revival.jpg
---

Google shut Stadia down on January 18, 2023. The hardware didn't get the memo. The Stadia Controller is a genuinely nice gamepad: solid build, great layout, real triggers, and a Broadcom Wi-Fi/Bluetooth radio that was, in happier times, one of the best ways to play on a Chromecast. After the shutdown Google shipped an optional firmware update that turns it into a plain Bluetooth controller, and the Wi-Fi mode, the reason the hardware existed, went dark with the service.

**TL;DR:** [Stadiacast](https://github.com/jkfran/stadiacast) is an MIT-licensed server you run on your own network that stands in for the Stadia cloud. The controller joins your Wi-Fi, connects, stays on, reports every button, stick and trigger, and rumbles on request, with no firmware modification:

```sh
curl -d '{"left":40000,"right":40000,"ms":1500}' http://192.168.2.1/_rumble
```

[Skip to the end](#what-exists-now) if you just want to try it. The rest is how it got there: a firmware dead end, a protocol nobody documented, and a controller that kept powering itself off for no visible reason.

---

## First attempt

A Bluetooth HID controller presents whatever identity its firmware tells it to, and hosts do no cryptographic check of it. So the obvious first idea: flash the Stadia Controller with firmware that makes it _present as an Xbox Wireless Controller_. Microsoft's vendor ID, the Xbox report map, native support everywhere, rumble included.

The controller is an NXP i.MX RT1061, a 600 MHz Cortex-M7 with no internal flash; the code executes in place out of 16 MB of external NOR flash, and the firmware in it is plaintext, not encrypted, which is the only reason any of this story was possible. It even has codenames: `bruce` is the Bluetooth firmware, `gotham` the Wi-Fi one. Google shipped a controller with a superhero continuity.

Secure boot, however, is enabled and locked. The chip verifies Google's RSA signature at every boot stage, from ROM to bootloader to app, and the key is not public. A byte patch breaks the signature because the signature covers the whole image, and every software route around the check turned out to be closed.

So the firmware stays Google's. The last thing I did on that side was download the last Wi-Fi firmware the controller ever received, `ota.282115`, not to flash it but to read it: if I couldn't replace the firmware, maybe I could become the cloud.

## Getting it to talk to my server

The Wi-Fi firmware speaks protobuf to a handful of Google endpoints. To make the controller talk to _me_ instead, I had to solve three problems: get it on my network, see what it does there, and make it trust my server.

**Getting it on the network.** In pairing mode the controller exposes a Google setup service over BLE, and the provisioning protocol turned out to be, of all things, **JSON over GATT**, in a firmware that speaks protobuf everywhere else. Scan the networks, read the results in gzip-paged chunks, fetch the device's RSA public key, encrypt the Wi-Fi password with it, write a little JSON blob to one characteristic. Two gotchas: the security enums must be copied verbatim from the target network's own scan entry (a plausible-but-wrong pair parses fine and then fails silently), and the controller rotates its BLE address every time it enters pairing mode, so you match it by its Fast Pair service data, not by address. The success signal is not a GATT response. The device just leaves BLE and shows up as a DHCP client.

**Seeing what it does.** My home router won't let me point DNS where I want, so the Mac became the network: an Internet Sharing hotspot makes it the controller's router, DHCP server and DNS server. With working internet, the controller's entire network life is **3.3 seconds**: DHCP, IPv6, connectivity check, config, update check, one analytics upload, all to the real Google servers, all successful, then the light goes off.

When I redirected the Google names to a local server with a self-signed certificate, every connection died with TLS alert `unknown_ca`. The controller pinged its gateway every 2 seconds, retried its analytics upload on schedule, and dropped off the network at +6:09 on both runs, to the second: a timeout, not a crash.

**Making it trust me.** Chain validation is enforced, so I needed a certificate chaining to a root in the controller's trust store. The firmware's TLS code only validates the chain: there is no hostname check. So you don't need a certificate for `googleapis.com`; any Google Trust Services certificate for a domain you own works for every endpoint. GTS is a public CA with a free issuance flow, and before long I had a real certificate for my own domain, verified against the trust store extracted from the controller itself.

## Why it powered off after nine seconds

With the certificate in place, the controller completed the entire connection sequence with my receiver: TLS, `RegisterController` carrying a full WebRTC offer, the GMsg long poll, ICE, DTLS. Then, on all but two boots, it powered its application down about nine seconds after power-on: blinking while connecting, two short rumbles and a solid light for a second, then off. Sometimes the radio stayed up for minutes afterwards, a zombie session sending STUN keepalives to nobody.

About ten theories followed, one real boot each, all wrong. The instructive one: releasing a held GMsg poll earlier moved the power-off _earlier_, not later. The held poll was accidentally keeping the controller alive, and the debugging instinct was exactly backwards.

The answer came from static analysis of the firmware, checked against the wire: **every one of the controller's HTTPS requests, and its analytics uploader, run serially on a single thread.** The analytics batcher's first flush lands at about 5.9 seconds of uptime, and whether it gets queued before or after the `v1:ResolveDiscovery` request (the one that hands the connection to the app) decides the whole boot: in every capture, a completed upload was followed by the power-off within about 0.3 seconds, before discovery had finished. The two good boots were not anything I did: the controller had simply booted about 150 milliseconds early, ResolveDiscovery made it onto the thread first, and the flush waited. I had been winning and losing a race by a tenth of a second.

First attempt at a fix: refuse the analytics hostname in DNS. The controller then asks **8.8.8.8 directly**, a hardcoded fallback resolver, and ships its telemetry to the real Google server through my own NAT. The upload goes through, so the controller powers off as before, now with a privacy problem on top.

Second attempt: keep DNS pointing at the receiver, and have the receiver's TLS callback answer _that one ClientHello_, the analytics host and only that one, with a fatal alert. The upload fails in milliseconds, gets requeued a minute out, fails again, and the queued ResolveDiscovery finally goes first. The controller stayed on. Side effect: its analytics now go nowhere.

## Input and rumble

The controller was alive but silent: it answered none of my requests for its state. Every byte of every record was right except the message id. I was sending on the game session's channel id, which the display link silently drops; valid ids there are 1 to 255. I moved mine to `0x75`. The controller's own records arrive on `0x74`.

Next boot: ResolveDiscovery, state, READY, and the first input notification. I pressed Y, B, A, X, and each one arrived, decoded, in order. Then the mapping: 17 buttons, two sticks, two triggers, and one surprise. Bits 0 to 15 of the button mask are the XInput `wButtons` layout, bit for bit, so a virtual XInput device should need no translation at all.

Rumble was the last piece: the motors aren't reachable on the display link at all. They live only on the _game streaming_ session, a second UDP connection the controller opens after a `StartGame`, on its own port, with its own ICE and DTLS, a 7-character ICE username limit, and a 5-second haptics watchdog that stops the motors unless you re-send the level. With all of that in place:

```sh
curl -d '{"left":40000,"right":40000,"ms":1500}' http://192.168.2.1/_rumble
```

The controller in my hands buzzed, and acknowledged the vibration series 8 milliseconds later.

## The certificate never expires

I had built an automated renewal pipeline before the firmware's TLS code showed it was unnecessary: the firmware never checks certificate dates. It walks the chain up to a Google Trust Services root and stops there. Its clock restarts at 1970 on every boot and takes its time from my server, and none of that has mattered to a single handshake so far. So: issue the certificate once and keep the files. The renewal code is gone from the project, and the first real expiry, in January 2027, is the one test left.

<img src="https://github.com/jkfran/jkfran.com/releases/download/blog-images/stadia-certificate-gap.png" alt="What the Stadia Controller firmware checks in a server certificate: the chain to a Google Trust Services root is checked, the hostname and the validity dates are not" width="1200" height="675" loading="lazy">

## How it was done

Most of this work was done with AI coding agents: a coordinating session that spawned per-task sessions, with the hard problems sent to parallel research agents whose findings were reconciled against the packet captures. The one workflow habit worth passing on is to have every session write its findings to the project's docs first and treat the chat reply as a pointer, so a session that gets cut off mid-answer loses nothing. Everything in this post was then checked against a real controller.

## What exists now

[Stadiacast](https://github.com/jkfran/stadiacast) answers the boot endpoints, does the WebRTC handshake, keeps the controller alive (including the one TLS alert that matters), decodes every button, stick and trigger, and runs a game session so you can rumble it over HTTP. No Google account, and nothing leaves your LAN. Several controllers can connect at once, each with its own session; I've had two real ones running side by side. It ships with a _fake controller_ that reproduces the firmware's network behavior, so the whole path is tested over loopback without hardware: 112 tests, on Linux and macOS, Python 3.11 to 3.14.

Stadiacast is an independent interoperability project, not affiliated with or endorsed by Google. Stadia is a trademark of Google LLC.

```text
 Stadia Controller (Wi-Fi)                      your PC / Mac running the receiver
 ─────────────────────────                      ──────────────────────────────────
 DNS  *.googleapis.com ─────────────────────▶   DNS sink: answers with the receiver's IP
 HTTPS boot: generate_204, stadiaconfig,
       Omaha update check, Clearcut logs ─────▶  boot-time endpoints (GTS certificate)
 HTTPS v1:RegisterController,
       v1:DiscoverDisplay (WebRTC offer) ─────▶  discovery RPCs, answer queued on GMsg
 HTTPS /gmsg long poll ◀──────────────────────   GMsg push channel: the WebRTC answer
 UDP   STUN + DTLS (display link) ◀──────────▶   RTC endpoint: display RPC handshake → READY
 DTLS  WireHeader2 0x74/0x75 RPCs, input ────▶   decoded input events (JSON Lines log)
 DTLS  second session for game streaming ◀───▶   game session: input + rumble (haptics)
```

### What you need

- A Stadia Controller **running its Wi-Fi firmware**. Google's post-shutdown Bluetooth firmware replaces the Wi-Fi mode, but the switch is not one-way: the firmware images are Google-signed, the controller accepts older ones, and the community keeps both the images and a flashing tool around, so a controller in Bluetooth mode can be put back on the Wi-Fi firmware. Google's own switch tool, kept alive until the end of 2025, [went offline in January 2026](https://9to5google.com/2026/01/20/google-stadia-controller-conversion-tool-dead/).
- A macOS or Linux machine that can be the controller's DNS server. A hotspot hosted by that machine is the simplest setup, and it is what I use.
- A free Google Trust Services certificate for a domain you own. The [setup guide](https://github.com/jkfran/stadiacast/blob/main/docs/setup.md) walks through the whole flow, including the one-time Bluetooth provisioning that puts the controller on your network.
- Python 3.11 or newer.

### Try it

```sh
git clone https://github.com/jkfran/stadiacast.git
cd stadiacast
uv sync --all-extras
# put your GTS certificate in certs/ and provision the controller once (setup guide), then:
tools/start_receiver.sh      # then wake the controller: a one-second press of the Stadia button
```

The console shows one line per input report, `GET /_status` shows the session state, and `POST /_rumble` does what it says. Everything the firmware does on the wire, confirmed versus assumed, is written up in the [protocol notes](https://github.com/jkfran/stadiacast/blob/main/docs/protocol.md). The first release is [v0.1.0](https://github.com/jkfran/stadiacast/releases/tag/v0.1.0).

### What it is not yet

Today the decoded input lands in a log and a Python API. Two things are next, in this order: automatic first-boot setup (detect a controller in BLE setup mode and provision it without manual steps), and feeding the input to a virtual gamepad on the PC, where that XInput-layout button mask is sitting there waiting. If either of those is your kind of problem, [issues and pull requests](https://github.com/jkfran/stadiacast/issues) are very welcome, and the protocol notes should give you a running start.

Custom firmware is not on the list: the controller's update image carries an RSA-4096 signature rooted in Google's key over every application byte, so anything but Google's own firmware would need Google's private key.

If you have a Stadia Controller in a drawer: it's a really good gamepad, and it's yours. Give it a network.
