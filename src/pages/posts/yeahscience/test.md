---
layout: ../../../layouts/MarkdownPostLayout.astro
title: test
author: Astro Learner
description: "This post will show up on its own!"
image:
    url: "https://i.imgur.com/yucR1Ko.png"
    alt: "The word astro against an illustration of planets and stars."
pubDate: 2024-8-14
tags: []
---

add support for LaTeX in markdown blogs

$$
e^{i\pi} + 1 = 0
$$

$$
\begin{equation}
    \text{idf}(t, D) = \text{log}\left(\frac{N}{1 + |\{d: d \in D \text{ and } t \in d\}|}\right)
\end{equation}
$$

$$
\int_{a}^{b} f(x) \, dx = F(b) - F(a)
$$

```python
import numpy as np
print(np.pi)
```

```cpp
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

```bash
echo "Hello, World!"
```

```
Plot[Sin[x], {x, 0, 2 Pi}]
```