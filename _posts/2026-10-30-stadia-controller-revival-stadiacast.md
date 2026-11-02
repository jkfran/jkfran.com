---
layout: post
title: "Stadia Died in 2023. My Controller Didn't."
author: jkfran
categories: [projects]
description: "The Stadia Controller's Wi-Fi mode has pointed at a dead cloud since 2023. How I became that cloud on my LAN, and Stadiacast, the server that came out of it."
image: https://github.com/jkfran/jkfran.com/releases/download/blog-images/stadia-controller-revival.jpg
---

Google shut Stadia down on January 18, 2023. The hardware didn't get the memo.

The Stadia Controller is a genuinely nice gamepad: solid build, great layout, real triggers. Its Broadcom Wi-Fi/Bluetooth radio once made it one of the best ways to play on a Chromecast. After the shutdown, Google offered a firmware update that turned it into a regular Bluetooth controller. But its Wi-Fi mode, the reason the hardware existed in the first place, went dark with the service.

I wanted to bring that part back. Not by rebuilding Stadia, but by giving the controller something on my own network to talk to.

The result is [Stadiacast](https://github.com/jkfran/stadiacast), an MIT-licensed server that stands in for the Stadia cloud. With its original Wi-Fi firmware, the controller joins your network, connects to Stadiacast, stays on, and reports every button, stick and trigger. It can even rumble on request, without modifying the firmware:

```sh
curl -d '{"left":40000,"right":40000,"ms":1500}' http://192.168.2.1/_rumble
```

[Skip to Stadiacast](#stadiacast) if you just want to try it. It isn't a complete replacement for a PC gamepad yet: the input currently goes to a log and a Python API, rather than a virtual controller.

The rest is how it got there: a firmware dead end, a protocol nobody documented, and a controller that kept powering itself off for no visible reason.

---

## First idea: make it look like an Xbox controller

My first plan had nothing to do with running a server. I wanted to change the firmware so the Stadia Controller would present itself as an Xbox Wireless Controller over Bluetooth.

A Bluetooth HID controller announces whatever identity its firmware gives it; the host doesn't cryptographically verify that identity. In principle, using Microsoft's vendor ID and the Xbox input-report layout could give me native support, rumble included.

Inside the controller is an NXP i.MX RT1061: a 600 MHz Cortex-M7 with no internal flash. It executes code directly from 16 MB of external NOR flash. That firmware is stored in plaintext, which made it possible to read and understand it.

The firmware even has codenames: `bruce` for Bluetooth and `gotham` for Wi-Fi. Google shipped a controller with a superhero continuity.

Reading it, though, is very different from changing it. Secure boot is enabled and locked. At every boot stage, from ROM to bootloader to application, the chip verifies Google's RSA signature. Change a single byte in the signed image and the check fails. Google's private signing key isn't available, and every software route I investigated around the check was closed.

So the firmware had to stay Google's.

I downloaded the last Wi-Fi firmware the controller received, `ota.282115`, and changed the question: **if I couldn't replace the firmware, could I become the cloud it expected to find?**

## Getting it to talk to my server

The Wi-Fi firmware talks to a handful of Google endpoints using protobuf messages. To replace those services, I first had to solve three problems:

1. Get the controller onto my network.
2. Watch what it tried to do.
3. Make it trust my server.

### Getting it onto Wi-Fi

In pairing mode, the controller exposes a Google setup service over Bluetooth Low Energy (BLE). The provisioning protocol turned out to be, of all things, **JSON over GATT**: JSON exchanged through Bluetooth characteristics, in a firmware that uses protobuf almost everywhere else.

The setup sequence is:

1. Ask the controller to scan for Wi-Fi networks.
2. Read the results in gzip-compressed pages.
3. Fetch the controller's RSA public key and use it to encrypt the Wi-Fi password.
4. Write a JSON payload containing the network settings to a Bluetooth characteristic.

Two details made this less straightforward than it sounds. The security enum values must be copied exactly from the target network's scan entry. A plausible but incorrect pair is accepted, then fails silently.

The controller also changes its BLE address every time it enters pairing mode. To find it reliably, you need to match its Fast Pair service data rather than remember an address.

And there is no final Bluetooth response saying "connected." The controller simply leaves BLE and appears on the network as a DHCP client.

### Watching the boot sequence

My home router wouldn't let me point DNS where I wanted, so I used my Mac as the network instead. An Internet Sharing hotspot made it the controller's router, DHCP server and DNS server.

With working internet, the controller's entire network life lasted **3.3 seconds**. It got an address, set up IPv6, checked connectivity, fetched its configuration, checked for updates and uploaded analytics. All of those requests went to the real Google servers and succeeded.

Then the light went off.

Next, I redirected the Google hostnames to a local server with a self-signed certificate. Every connection failed with the TLS alert `unknown_ca`: the controller didn't trust my certificate.

It kept pinging its gateway every two seconds and retrying the analytics upload. On both runs, it left the network exactly six minutes and nine seconds after starting. That consistency pointed to a timeout, not a crash.

### Making it trust my server

The controller does check whether a certificate comes from a trusted certificate authority. I needed a certificate whose chain ended at a root in its trust store.

But the firmware's TLS code was missing another important check: **it never verifies that the certificate matches the hostname it asked for.**

That meant I didn't need a certificate for `googleapis.com`. A Google Trust Services (GTS) certificate for a domain I owned would work for those endpoints too.

GTS is a public certificate authority with a free issuance flow. I obtained a certificate for my own domain and verified it against the trust store extracted from the controller. Now my server could accept the controller's connections.

The firmware skips certificate date checks too. Its clock starts at 1970 on every boot and later gets the time from my server, but neither has affected a handshake: it checks the chain back to a trusted GTS root, not the hostname or validity dates.

That also meant the automated renewal pipeline I'd built appeared unnecessary, so I removed it. The certificate should only need to be issued once. **The real-world expiry test is still pending, though:** mine expires in January 2027. The firmware analysis says it should keep working after that; I haven't observed that first expiry yet.

<img src="https://github.com/jkfran/jkfran.com/releases/download/blog-images/stadia-certificate-gap-flow.png" alt="How the controller comes to trust a server on your LAN: it sends a TLS hello for a Google name, the LAN server presents a certificate for your own domain, and the firmware skips the hostname and validity checks and only verifies that the chain ends at a Google Trust Services root" width="1200" height="675" loading="lazy">

## Why it powered off after nine seconds

With the certificate in place, the controller got through the connection sequence:

- It established an encrypted HTTPS connection.
- It called `RegisterController`, carrying a WebRTC offer to negotiate the connection.
- It opened the GMsg long poll, an HTTP request my server could hold open until it had a message to deliver.
- It completed ICE, which establishes the UDP connection, and DTLS, which encrypts that traffic.

Then, on all but two boots, it shut its application down about nine seconds after power-on.

The pattern was always the same: blinking while connecting, two short rumbles, a solid light for a second, then darkness. Sometimes the radio stayed up for minutes afterwards, sending STUN keepalives for a session whose application was already gone.

I tried about ten theories, testing each with a real boot. All were wrong. One experiment was especially confusing: answering the held GMsg poll sooner made the controller turn off _sooner_. Keeping a request waiting was somehow keeping it alive.

The answer came from reading the firmware and checking what I found against the packet captures. **All of the controller's HTTPS requests, including analytics uploads, run one at a time on a single thread.**

At about 5.9 seconds after boot, the analytics batcher tries its first upload. Around the same time, the controller needs to send `v1:ResolveDiscovery`, the request that hands the connection over to the application.

The order mattered:

- **Analytics first:** in every capture, the completed upload was followed by shutdown within about 0.3 seconds, before discovery finished.
- **Discovery first:** the connection reached the application before the analytics upload got its turn.

Those two successful boots weren't the result of a fix. The controller had simply booted about 150 milliseconds earlier, letting discovery reach the queue first. I had been winning and losing a race by roughly a tenth of a second.

### Blocking analytics, but in the right place

My first fix was to refuse DNS queries for the analytics hostname. That didn't work. The controller has a hardcoded fallback: it asks **8.8.8.8 directly**.

It resolved the real Google server, sent the telemetry through my Mac's NAT, and powered off as before. Now I had a privacy problem as well as a connection problem.

The working fix was more specific. I kept DNS pointing at my receiver, but changed its TLS callback to reject the handshake for **only the analytics hostname**, answering that ClientHello with a fatal alert.

The upload now failed in milliseconds and was rescheduled a minute later. That freed the queue for `ResolveDiscovery`. Subsequent analytics attempts failed the same way.

The controller stayed on. As a useful side effect, its analytics went nowhere.

## Input and rumble

The controller was finally staying on, but it still wouldn't answer my requests for its state.

The problem was the message ID. I was using the game session's channel ID on the _display link_, the connection used for the initial handshake and input reporting. That link only accepts IDs from 1 to 255 and silently drops the rest.

I changed my outgoing ID to `0x75`. The controller's own records arrive on `0x74`.

On the next boot, the sequence finally reached `ResolveDiscovery`, state, `READY`, and the first input notification. I pressed Y, B, A, X. Each press arrived, decoded, in order.

From there I mapped 17 buttons, two sticks and two triggers. There was a welcome surprise: bits 0 to 15 of the button mask match the XInput `wButtons` layout exactly. That part should need no translation when feeding a virtual XInput device.

### Rumble needs a second connection

The motors aren't reachable through the display link at all. They only accept commands through the _game streaming_ session.

After a `StartGame` request, the controller opens a second UDP connection on its own port. It has its own ICE and DTLS negotiation, plus two details that are easy to miss:

- The ICE username can be at most seven characters long.
- A five-second haptics watchdog stops the motors unless you resend the vibration level.

Once that session was working, I sent:

```sh
curl -d '{"left":40000,"right":40000,"ms":1500}' http://192.168.2.1/_rumble
```

The controller in my hands buzzed. Eight milliseconds later, it acknowledged the vibration series.

## Stadiacast

[Stadiacast](https://github.com/jkfran/stadiacast) now handles the full path from boot to input and rumble:

- Answers the controller's boot-time requests.
- Completes the WebRTC handshake.
- Keeps the controller alive, including rejecting that one analytics TLS handshake.
- Decodes every button, stick and trigger.
- Runs a game session so you can trigger rumble over HTTP.

No Google account is needed, and nothing leaves your LAN during normal operation. The certificate setup is a separate, one-time step.

Several controllers can connect at once, each with its own session. I've had two real ones running side by side.

The project also ships with a _fake controller_ that reproduces the firmware's network behavior. That lets the whole connection path run over loopback, without hardware. The test suite has 112 tests and runs on Linux and macOS with Python 3.11 to 3.14.

Stadiacast is an independent interoperability project, not affiliated with or endorsed by Google. Stadia is a trademark of Google LLC.

For a more technical view, here's where each part of the connection ends up:

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

- A Stadia Controller **running its Wi-Fi firmware**.
- A macOS or Linux machine that can be the controller's DNS server. A hotspot hosted by that machine is the simplest setup, and it is what I use.
- A free Google Trust Services certificate for a domain you own.
- Python 3.11 or newer.

Already switched your controller to Bluetooth? That replaces Wi-Fi mode, but the switch isn't one-way. The controller accepts older Google-signed firmware, and the community maintains both the images and a flashing tool. You can put it back on the Wi-Fi firmware without creating or signing custom firmware. Google's own conversion tool [went offline in January 2026](https://9to5google.com/2026/01/20/google-stadia-controller-conversion-tool-dead/), after being kept available through the end of 2025.

The [setup guide](https://github.com/jkfran/stadiacast/blob/main/docs/setup.md) walks through the certificate setup and the one-time Bluetooth provisioning that puts the controller on your network.

### Try it

```sh
git clone https://github.com/jkfran/stadiacast.git
cd stadiacast
uv sync --all-extras
# put your GTS certificate in certs/ and provision the controller once (setup guide), then:
tools/start_receiver.sh      # then wake the controller: a one-second press of the Stadia button
```

Once connected, the console shows one line per input report. `GET /_status` shows the session state, and `POST /_rumble` controls the motors.

The [protocol notes](https://github.com/jkfran/stadiacast/blob/main/docs/protocol.md) document what the firmware does on the wire, including what is confirmed and what is still assumed. The first release is [v0.1.0](https://github.com/jkfran/stadiacast/releases/tag/v0.1.0).

### What it is not yet

Today, decoded input lands in a log and a Python API. **Stadiacast doesn't yet expose a virtual gamepad to PC games.** Getting the controller talking is done; turning those reports into a gamepad the operating system can use is still ahead.

Two things are next, in this order:

1. **Automatic first-boot setup:** detect a controller in BLE setup mode and provision it without manual steps.
2. **Virtual gamepad support:** feed the decoded input into a virtual controller on the PC. That XInput-layout button mask is sitting there waiting.

If either is your kind of problem, [issues and pull requests](https://github.com/jkfran/stadiacast/issues) are very welcome. The protocol notes should give you a running start.

Custom firmware isn't on the list. The update image carries an RSA-4096 signature, rooted in Google's key, covering every application byte. With the signature checks in place, a modified image would need Google's private signing key.

If you have a Stadia Controller in a drawer: it's a really good gamepad, and it's yours. Give it a network.
