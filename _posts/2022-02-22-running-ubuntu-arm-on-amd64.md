---
layout: post
title:  "Running Ubuntu ARM64 on AMD64"
author: jkfran
categories: [ blog ]
image: https://user-images.githubusercontent.com/6353928/155136689-7f3ccb69-608a-43b6-a294-59f4bdb83ce4.png
---

Hi there! Here is a basic guide and easy way to run Ubuntu ARM64 or any Docker container in different architectures.


## Requirements

The only requirement is to have Docker installed. Because I run Linux (Ubuntu), I prefer to install it with the [docker snap](https://snapcraft.io/docker). If you have it already, you can skip this section.

To install it:
```
sudo snap install docker
```

To fix the permissions:
```
sudo addgroup --system Docker
sudo adduser $USER docker
newgrp Docker
sudo snap disable Docker
sudo snap enable Docker
```

## Running images from different architectures

By default, you can't run images that are not for your host architecture on Docker:
![image](https://user-images.githubusercontent.com/6353928/155134822-e4aa01c7-0852-4df3-85a7-902cf3afde30.png)

However, it is possible to set up Docker to use QEMU, an emulator to run these images, and there is an easy way to do it.

```
docker run --privileged --rm tonistiigi/binfmt --install all
```

This simple container will configure your host for you, automatically setting up Qemu for Docker. For more details, you can check their [GitHub repo](https://github.com/tonistiigi/binfmt).
 
 And we are done! In this case, I am running an Ubuntu image for ARM64:
 
```
docker run -it --rm --platform linux/arm64 arm64v8/ubuntu sh
```
 
 
 ![image](https://user-images.githubusercontent.com/6353928/155136139-5beddb9c-738e-4ce8-b4f1-830118d9d375.png)

