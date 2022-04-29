---
layout: post
title: "Connecting my AirPods on Ubuntu 22.04 with PipeWire"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/166060821-e95d6c25-67a6-48da-aede-e6fd662691c1.png
---


I had some pain after doing a fresh install of Ubuntu 22.04 with my AirPods. So I will share my system configuration, including how to switch from ALSA to PipeWire.


# What is PipeWire

PipeWire is a server for handling audio and video streams and hardware on Linux. In April 2021, Fedora became the first Linux distribution to ship PipeWire for audio by default through its release 34 and guess what? PipeWire is pre-installed out-of-the-box on Ubuntu 22.04 and automatically runs as a background service, but it is not the default audio server.

Official site: https://pipewire.org/

You can check yourself if PipeWire is running:
```
systemctl --user status pipewire pipewire-session-manager
```

# How to enable it

Install the client package:
```
sudo apt install pipewire-audio-client-libraries libspa-0.2-bluetooth libspa-0.2-jack
```

The project maintainer now recommends a more advanced session manager when using Pipewire as a system sound server, so:
```
sudo apt install wireplumber pipewire-media-session-
```

Copy conf files:
```
sudo cp /usr/share/doc/pipewire/examples/alsa.conf.d/99-pipewire-default.conf /etc/alsa/conf.d/
sudo cp /usr/share/doc/pipewire/examples/ld.so.conf.d/pipewire-jack-*.conf /etc/ld.so.conf.d/
sudo ldconfig
```

Remove the Bluetooth package:
```
sudo apt remove pulseaudio-module-bluetooth
```

Edit your `/etc/bluetooth/main.conf` and uncomment the ControllerMode line with the value `bredr`:
![image](https://user-images.githubusercontent.com/6353928/166062425-b0cf16cb-3989-456b-8f2d-85b54309cfec.png)


And, finally enable the media session by running this command:
```
systemctl --user --now enable wireplumber.service
```

Restart your system, and done!

After all this, I connected my AirPods from the settings app without any issues. If it is the first time you are connecting the AirPods to your computer, you need to press the button on the case for a few seconds.
