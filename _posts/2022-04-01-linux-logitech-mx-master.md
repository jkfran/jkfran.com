---
layout: post
title: "Logitech MX Master on Linux"
author: jkfran
categories: [ blog ]
image: https://user-images.githubusercontent.com/6353928/161268803-b3a16b4a-2d80-47e0-9f55-c8b656cbe3ea.png
---

The basic functionality of the mouse should work with no particular configuration if using the unified receiver USB dongle. However, I miss the gestures of pressing my thumb and moving the mouse.

The mouse exists in 3 versions:

- Mx Master.
- Mx Master 2s.
- Mx Master 3.

The functionalities are the same in all three, I have the 2S, so one part of this guide will focus on this one.

# logiops

logiops is an unofficial driver for Logitech mice and keyboards. The source code can be found in [their GitHub repo](https://github.com/PixlOne/logiops).

## Installation

For Debian/Ubuntu systems, first get all the needed dependencies: `sudo apt install cmake libevdev-dev libudev-dev libconfig++-dev`.

Clone the repo:`git clone https://github.com/PixlOne/logiops.git`

Compile it:
```
mkdir build
cd build
cmake ..
make
```

And install it:
```
sudo make install
sudo systemctl enable --now logid
```

## Configuration

To enable the thumb gestures, we need to use a particular configuration. This one is for the Master MX 2S. Feel free to do any modifications:

This configuration needs to be save on `/etc/logid.cfg`:
```
devices: ({
  name: "Wireless Mouse MX Master 2S";

  // A lower threshold number makes the wheel switch to free-spin mode
  // quicker when scrolling fast.
  smartshift: {
    on: true;threshold: 15;
  };

  hiresscroll: {
    hires: true;invert: false;target: false;
  };

  // Higher numbers make the mouse more sensitive (cursor moves faster),
  // 4000 max for MX Master 3.
  dpi: 1000;

  buttons: (
    // Modify top button on the mouse, it could support gestures as well.
    // { cid: 0xc4; action = { type: "Keypress"; keys: ["BTN_BACK"];    }; },

    // Enable thumb gestures
    {
      cid: 0xc3;
      action = {
        type: "Gestures";
        gestures: ({
          direction: "Left";
          mode: "OnRelease";
          action = {
            type: "Keypress";
            keys: ["KEY_LEFTMETA", "KEY_COMMA"];
          };
        }, {
          direction: "Right";
          mode: "OnRelease";
          action = {
            type: "Keypress";
            keys: ["KEY_LEFTMETA", "KEY_DOT"];
          };
        }, {
          direction: "None";
          mode: "OnRelease";
          action = {
            type: "Keypress";
            keys: ["KEY_LEFTMETA"]
          };
        });
      };
    }
  );
});
```

As you can see, the gestures will be equivalent to pressing specific keys on my keyboard. In this case, I did it for my [PaperWM](https://github.com/paperwm/PaperWM) keymaps.

Now we need to restart the service with `sudo systemctl restart logid` and done!
