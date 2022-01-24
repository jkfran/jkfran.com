---
layout: post
title:  "Converting my old iPhone into a bot"
author: jkfran
categories: [ blog ]
image: https://user-images.githubusercontent.com/6353928/150762225-08079e98-97fb-4c00-bdd1-0d0ce59c3cb3.png
---

Hi there, I wanted to create a Twitter bot recently for personal purposes, but the data I wanted to tweet is from another iOS app that doesn't have any public API at the moment.

Instead of desisting, I tried to find possible solutions. One was to create an [Apple Shortcuts](https://support.apple.com/en-gb/guide/shortcuts/welcome/ios), but it wasn't an option because the possibilities they offer are limited. So it came to my mind that I needed to Jailbreak my old iPhone 6 and get the information I needed somehow.

## What is Jailbreaking?

Jailbreaking is the process of removing restrictions in iOS and allowing root access to the iOS file system so that it can run unsigned code or software that Apple has not approved.

It allows users to install jailbreak apps, tweaks and themes to customise their device's look and enhance the functionality.

## Is Jailbreaking an iPhone Legal?

Jailbreaking smartphones like iPhones, tablets, smart TVs and other all-purpose computing devices are exempted from the DMCA to allow users to gain root access to their device without breaching copyright law.

However, it is illegal to use your jailbreak for illicit activities like downloading paid apps for free or committing other cyber and copyright crimes.

## How to Jailbreak?

I think the best you can do is to visit [canijailbreak.com](https://canijailbreak.com/) and then figure it out from there. In my case, I used [Checkra1n](https://checkra.in/), it's open-source, and I liked that they offer a [client for linux](https://checkra.in/linux), so all you need is to connect your phone with your PC.

After the Jailbreak process, Cydia is installed on your device.

It is important to mention that I wouldn't do it on my main iPhone for security reasons. If you know what you are doing, a jailbroken iPhone is not more insecure, but the main issue is that you need to stick with older iOS versions.

![image](https://user-images.githubusercontent.com/6353928/150762168-e6352d3e-8254-4501-8ced-35c2d00ac8f8.png)

## Preparing our environment

[Cydia](https://en.wikipedia.org/wiki/Cydia) is a graphical user interface of APT for iOS. It enables users to find and install software not authorised by Apple on jailbroken devices.

Packages I needed to install in my use case:
- OpenSSH
- Autotouch (repo: `https://repo.autotouch.net/`)
- BundleIDsXII (repo: `https://repo.packix.com/`)
- Liberty Lite (repo: `ryleyangus.com/repo/`)

Something that cached my attention was how fast this phone was after installing and running iCleaner, and this phone was reset entirely before doing any of this.

### SSH into our phone

Once we have an SSH server installed, we are ready to start bashing:
![image](https://user-images.githubusercontent.com/6353928/150141263-678c6459-17aa-4f65-bb7a-6ea247bf5a8b.png)

**An important reminder is to change the default root password**


### Autotouch

I was really surprised by this tool; it allows you to script everything you can do with your phone, plus the execution of JavaScript/Lua code that will enable you to do everything, even access the official Apple SDK!

![image](https://user-images.githubusercontent.com/6353928/150153033-55902e45-58a6-42a1-9174-c5a2122b132d.png)

Official site: https://autotouch.net/ and docs: https://docs.autotouch.net/

It provides a web server option, where it is possible to access our phone scripts to create and run scripts remotely:
![image](https://user-images.githubusercontent.com/6353928/150154039-9bd76168-e673-43bb-9e14-e77ed545c209.png)


#### Scripting time

One thing to mention is that we can create easy scripts by recording our actions on the phone, but in this case, I wanted to create advanced scripts that can launch Apps directly and be more optimised.

One issue was that I needed the Bundle ID of my phone apps for my scripts. It is like a unique ID for each application on iOS, like: `com.apple.calculator`. It was a bit difficult to find a solution for this. I tried a bash script from Reddit to get them without any luck, then I found [this website](https://offcornerdev.com/bundleid.html) that list many apps IDs, but the app I needed wasn't there. In the end, I found a fork of BundleIDs called [BundleIDsXII](https://github.com/mass1ve-err0r/BundleIDsXII) that worked on my iOS version.

![image](https://user-images.githubusercontent.com/6353928/150164830-c7cfa88e-4798-45dc-8922-5240ce34a628.png)
_The ID of Twitter_

I made my script work as expected, being able to screenshot one application and post the image to Twitter. I think this is it for now. I found it very interesting, and I think it is an option to keep in mind, don't let your old iPhones stored in a drawer get unused.
