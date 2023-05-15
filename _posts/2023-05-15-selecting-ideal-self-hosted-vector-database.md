---
layout: post
title: "Selecting the Ideal Self-Hosted Vector Database"
author: jkfran
categories: [blog]
image: https://github.com/jkfran/jkfran.com/assets/6353928/8c5d0db8-eb7e-4c36-b952-bba82a29529f

---

As an MLOps engineer, I was recently entrusted with the responsibility of choosing the most suitable Vector Database to address one of our crucial Data Science needs. In this case, it was the need for seamless integration with the widely-used [Langchain](https://python.langchain.com/en/latest/index.html) library. My task was to make the selection from the MLOps perspective, aiming to identify a self-hosted vector database that would meet the requirements.
After a preliminary selection from the most popular vector/embedding databases, the potential candidates are Milvus, Pinecone, Qdrant, and PGVector (Postgres). With these options at hand, I had the opportunity to evaluate each database in terms of:
- Scale
- Performance
- Disaster recovery

In this blog post, I'll walk you through my research process, offering insights into the various aspects I considered and revealing why we eventually decided on Qdrant. Let's dive into the journey of this decision-making process.

---

## Milvus: A Renowned Name with Robust Architecture

The first port of call on our journey was Milvus, an esteemed entity in the realm of vector databases. With a multi-layered, robust architecture, it has gained significant traction on GitHub, cementing its position in the landscape of popular vector databases.

At its core, Milvus boasts a design that is both comprehensive and sophisticated. Its default configuration deploys a considerable number of pods, reflecting an impressive level of scalability and resilience. However, this also means that it demands substantial resources, which, while suitable for some, proved to be a bit too resource-intensive for our specific needs.

Despite the undeniable merits of Milvus, including its high performance, scalable architecture, and strong community support, it felt like a larger tool than we required for our particular scenario. As a result, its advanced functionality and the operational overhead associated with managing such a system seemed somewhat disproportionate to our use case.

While Milvus undoubtedly excels in many dimensions, it underscored the importance of aligning the capabilities of a tool with our project's specific needs, a lesson we carried forward in our quest for the optimal vector database.


## Pinecone: A Powerful Proprietary Solution

Our exploration then led us to Pinecone, a fully managed vector database renowned for adeptly handling unstructured search engine requirements. Pinecone distinguishes itself with its intuitive features and streamlined operations, which were evident in the recent 2.0 release.

The standout feature in this new release was the introduction of single-stage filtering. This innovation greatly simplifies data querying, allowing users to retrieve relevant data more efficiently, without the need for multiple filtering stages. This unique aspect undoubtedly adds value, especially for teams seeking streamlined and efficient data management.

However, despite Pinecone scoring highly on most of our key considerations – such as performance, scale, and data persistence – it fell short in a couple of critical areas for us. Firstly, Pinecone is a proprietary paid solution and not an open-source platform. Secondly, Pinecone does not provide a self-hosted option. This was a crucial requirement for us, as we were specifically seeking a self-hosted vector database to maintain greater control over our data and operations.

In conclusion, while Pinecone's impressive capabilities and innovative features make it an excellent choice for many, it was not the perfect fit for our specific scenario due to its proprietary nature and lack of a self-hosting option. But, I can see Pinecone as the perfect choice for companies that need a solution but don't want to deal with self-hosting this kind of service.


## Qdrant: A Robust Rust-built Vector Database

The next milestone on our exploration was Qdrant, a vector database built entirely in Rust. As we delved deeper into our research, it quickly became evident that Qdrant was a formidable contender in the arena of vector databases.

One of the key aspects that set Qdrant apart was its dynamic query planning. This feature allows for more efficient processing of queries, resulting in quicker retrieval of relevant information. The payload data indexing feature also emerged as a major highlight, contributing to faster data access and improved search capabilities.

Another standout element was Qdrant's Scalar Quantization feature. Often mentioned in discussions and articles, this feature is noted for its significant role in enhancing performance and efficiency. It achieves this by reducing the size of stored vectors while maintaining their distinct characteristics, leading to optimized resource utilization.

A major attraction of Qdrant was its ease to run container. This allows for smooth deployment and management of Qdrant within a Kubernetes environment, which is particularly beneficial for teams using container orchestration systems.

Despite the many strong points of Qdrant, our research did uncover some online concerns like missing [authentication in the Qdrant API](https://github.com/qdrant/qdrant/issues/1739), this feature was addressed [recently](https://github.com/qdrant/qdrant/pull/1745). But, it is in the development branch. However, this is a minor issue for us since we are not exposing the database to the outside. This is a relatively new Database and offers excellent performance, making it an enticing choice for our needs.

In the end, the combination of dynamic query planning, payload data indexing, Scalar Quantization, and seamless Kubernetes integration swayed us in Qdrant's favor. Despite minor concerns, its robust performance, efficiency, and compatibility made it an ideal choice for our specific requirements.


## PGVector: A Trusted Postgres Extension with Scaling Challenges

Finally, we turned our attention to PGVector, an extension of the widely trusted PostgreSQL database. PostgreSQL's reputation as a robust and reliable solution for many businesses initially made PGVector an intriguing option in our quest for the ideal vector database.

However, upon further research, a few limitations came to light. One significant concern was that scaling PGVector within a Kubernetes cluster could pose challenges. Kubernetes is often used for managing containerized workloads and services, and any difficulties in scaling within this environment could hinder operational efficiency.

Another aspect where PGVector seemed to falter was performance. Compared to its competitors, search operations in PGVector were reported to be slower. While this might not be an issue for smaller scale projects, it could potentially become a bottleneck in more demanding scenarios, affecting the overall efficiency of data retrieval.

On a positive note, with Postgres there are plenty of tools and integrations already available online, a key factor in our evaluation was disaster recovery, and Postgres definetly scores high in this category. However, the lower performance and scalability scores made it less appealing compared to the other options we were considering.

In conclusion, despite its roots in the well-regarded PostgreSQL database, the challenges related to scaling and performance led us to explore other options.

---

## The Final Choice: Qdrant - A Winning Combination of Performance and Scalability

After conducting comprehensive research and carefully evaluating our options, we found Qdrant to be the ideal choice for our specific needs. This Rust-built vector database showcased superior performance and exhibited a significant edge over its competitors in a number of key areas.

Qdrant's seamless scalability within a Kubernetes environment was a major factor in our decision, as it ensures the database can grow and adapt to our evolving needs. Moreover, standout features like dynamic query planning and payload data indexing further solidified its position as our top choice. These features collectively contribute to efficient data retrieval and improved search capabilities, which are critical to our operations.

For those setting off on a similar journey in the world of vector databases, we plan to use the [official Helm chart](https://github.com/qdrant/qdrant-helm/) for deploying Qdrant in our Kubernetes clusters. This resource provides a reliable, streamlined approach to deployment, simplifying the integration process.

In conclusion, this exploration through the landscape of vector databases has been a valuable and enlightening experience. I'm eager to see how Qdrant's robust capabilities will enhance our operations at Builder.ai. I hope that sharing our journey will provide useful insights for others navigating the complexities of vector database selection. Until next time, happy coding!
