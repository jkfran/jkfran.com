---
layout: post
title: "Install Firefox from .deb (not from snap) on Ubuntu"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/165127566-5ed7bd3d-f787-4996-801f-9e871c9544b3.png
---

The latest Ubuntu LTS ships Firefox as a snap instead of a deb package. But if you prefer to install the browser in the traditional way like me, here is how you can do it.

The first step is to block the package from the Ubuntu repository:

```bash
$ cat /etc/apt/preferences.d/firefox-no-snap 
Package: Firefox*
Pin: release o=Ubuntu*
Pin-Priority: -1
```

Then make sure you remove Firefox:

```bash
sudo apt purge firefox
sudo snap remove Firefox
```

Now, let's add the Mozilla PPA to our system:
```bash
sudo add-apt-repository ppa:mozillateam/ppa
echo 'Unattended-Upgrade::Allowed-Origins:: "LP-PPA-mozillateam:${distro_codename}";' | sudo tee /etc/apt/apt.conf.d/51unattended-upgrades-firefox
```

Now we can install the deb package:
```bash
sudo apt update
sudo apt install firefox
```

And Voilà!
