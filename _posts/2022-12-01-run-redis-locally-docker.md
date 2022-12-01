---
layout: post
title: "How to run Redis locally with Docker"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/205102657-c1d7d9ae-1925-4f70-9700-215789fa0fbe.png
---

In this post, I want to share just one command to run Redis locally. That's it, and it'll be quick and easy.

## Requirements

- Docker ([https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/))


## Get and run Redis


```bash
docker run -it -p 6379:6379 --rm --name my-redis redis
```

That's it!


![image](https://user-images.githubusercontent.com/6353928/205104552-7ae20743-10ae-4f7f-a521-d81d16291074.png)


## Redis client

I didn't have the opportunity to work with Redis before, so when I looked at the CLI client, the commands were completely new to me.
If you are looking for an easy way to view the data. I recommend [QRedis](https://github.com/tiagocoutinho/qredis).

### Installation
```bash
sudo pip3 install qredis
```

#### Connecting
```bash
qredis -p 6379
```

![image](https://user-images.githubusercontent.com/6353928/205104704-e6d2f91a-df9d-41c7-a69c-102410f61417.png)

Ah! Much better.
