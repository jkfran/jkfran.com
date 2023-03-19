---
layout: post
title: "Introducing Killport: A Simple CLI Tool to Free Ports in Linux"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/226195669-85263e2b-6953-4476-8e42-5892dcce28dd.png
---


Discover how to easily kill processes listening on ports in Linux with Killport

## Introduction

Today, I am excited to announce the release of a new open-source project called [Killport](https://github.com/jkfran/killport). Killport is a simple command-line interface (CLI) tool designed to help you easily free up ports in Linux. If you've ever encountered the issue of a port being occupied by an unknown process or you want to quickly kill a process listening on a specific port, Killport is here to save the day!

In this blog post, we'll discuss how Killport can help you resolve common port-related issues and demonstrate how to install and use it on your Linux system.

## Why Killport?

As developers, we often work with applications that require specific ports to function properly. Occasionally, these ports may be occupied by other processes, causing conflicts and preventing our applications from running smoothly.

Searching for the process that's listening on a specific port and then killing it can be a cumbersome task, especially when you're in the middle of development or troubleshooting. That's where Killport comes in. It simplifies the process of freeing up a port by automatically finding and terminating the process that's occupying it.

## Installing Killport

The easiest way to install Killport on your Linux system is by running the following command:

```sh
curl -sL https://bit.ly/killport | sh
```

This command will download the Killport installation script and execute it, installing the Killport binary in your `$HOME/.local/bin` directory.

You can also find binary releases for various Linux architectures on the [Killport GitHub releases page](https://github.com/jkfran/killport/releases).

## Using Killport

Using Killport is straightforward. Simply run the following command, replacing `<port>` with the port number you want to free:

```sh
killport <port>
```

For example, to kill the process listening on port 8080, you would run:

```sh
killport 8080
```

Killport will then identify the process occupying the specified port and terminate it, freeing up the port for your application to use.

## Conclusion

Killport is a handy CLI tool that makes it easy to free up ports in Linux by killing the processes listening on them. By simplifying this task, Killport saves you time and helps you maintain a smooth development workflow. Give it a try, and let us know what you think!

Don't forget to star and contribute to the [Killport GitHub repository](https://github.com/jkfran/killport) if you find it useful!
