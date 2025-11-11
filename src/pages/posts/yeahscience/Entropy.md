---
layout: '../../../layouts/MarkdownPostLayout.astro'
title: 'Entropy'
pubDate: '2024-11-19'
description: 'a fleeting glimpse of information theory and a review on some courseworks'
author: 'Audiofool'
image:
    url: '/images/alog/Orthlist-vs_Triplet.jpeg'
    alt: 'Orthlist-vs_Triplet'
tags: ["blogging", "science", "DSA", "learning", "CS", "notes", "information theory", "huffman coding", "entropy", "probability", "cross-entropy"]
---

今年在几个课程中接触到了“熵”的概念——交叉熵损失（CEL, cross-entropy-loss），霍夫曼编码（Huffman coding），以及在*概率论*课程中由随机变量/向量不确定性引入的信息熵。

参考**Elements of information theory**，以及一些课程作业，简单回顾这几个概念，以及对信息论(information theory)进行一些简单了解


entropy，每个字母只出现了一次！

## 信息熵

---

考虑一个离散取值的随机试验$\alpha$，分布列$p_i, i=1,2,\cdots,n$. 我们希望找一个量来整体度量$\alpha$的不确定程度，记作$H(\alpha)$，当然它可以写成$H(p_1,p_2,\cdots,p_n)$，满足如下几个要求：

- $H$是$p_i$的连续函数
- 对于$n$个等概率结果的试验，$H$应是$n$的单调增加函数
- 一个试验分成相继的两个试验时，未分之前的$H$是分后的$H$的加权和（权为该试验涉及的结果对应的概率论之和）

唯一满足上述三个条件的$H$具有下列形式：

$$
H = -C\sum_{i=1}^{n}p_i\log p_i
$$

其中$C$是正的常数

---



## 关于信息论

![Relationship of information theory to other fields.](/images/alog/info_theo_n_other_fields.png)
Relationship of information theory to other fields.









reference:
```
@book{cover1999elements,
  title={Elements of information theory},
  author={Cover, Thomas M},
  year={1999},
  publisher={John Wiley \& Sons}
}
```