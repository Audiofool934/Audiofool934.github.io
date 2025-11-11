---
layout: '../../../layouts/MarkdownPostLayout.astro'
title: 'Orthogonal List vs. Triplet'
pubDate: '2024-11-18'
description: 'Comparing Orthogonal List and Triplet for Sparse Matrix Representation'
author: 'Audiofool'
image:
    url: '/images/alog/Orthlist-vs_Triplet.jpeg'
    alt: 'Orthlist-vs_Triplet'
tags: ["blogging", "science", "DSA", "learning", "CS", "notes"]
---

## Sparse Matrix:

> In the field of numerical analysis, a sparse matrix is a matrix populated primarily with zeros as elements of the table

> There is no strict definition regarding the proportion of zero-value elements for a matrix to qualify as sparse but a common criterion is that the number of non-zero elements is roughly equal to the number of rows or columns

e.g. a sparse matrix:

$$
A = 
\begin{bmatrix}
0 & 0 & 3 & 0 \\
4 & 0 & 0 & 0 \\
0 & 5 & 0 & 0 \\
0 & 0 & 0 & 6
\end{bmatrix}
$$

## Sparse Matrix Representation:

### Triplet Representation:

#### Defination

显然，直接用二维数组存储并不是一个好的选择——大量的$0$浪费了存储空间.其实，只有非零的元素
$$
\{a_{i_{k}j_{l}}\}
$$
提供了“信息”，因此能否只存储这些非零元素？——每个非零元素包含两个信息：元素的值和元素的位置（行、列），因此，可以直观的想到用三元组来存储每个矩阵中的非零元素，即
$$
\{(row, col, val)\} = \{(i_k, j_l, a_{i_{k}j_{l}})\}
$$

```cpp
template<typename T>
class TripletList {
private:
    struct Triplet {
        int row, col;
        T value;
        Triplet(int r, int c, T v) : row(r), col(c), value(v) {}
    }
    vector<Triplet> triplets;
    int numRows, numCols, numNonZeros;
    
public:
    TripletList();
    TripletList(const vector<vector<T>> &inArray);
    vector<Triplet> getTriblets() { return triplets; }
    TripletList<T> transpose();
    TripletList<T> multiplyMatrix(const TripletList<T>& mat);
    vector<vector<T>> transformTo2DArray();
    void printMatrix();
    void makeEmpty();
}
```

#### Operations

将二维稀疏矩阵转换为三元组存储：

只需遍历矩阵，将非零元素的行号、列号和值存储到三元组中，即可实现稀疏矩阵的压缩存储.

```cpp
template<typename T>
TripletList<T>::TripletList(const vector<vector<T>>& inArray) : numRows(inArray.size()), numCols(inArray.size() > 0 ? inArray[0].size() : 0) {
    for (int i = 0; i < numRows; i++) {
        for (int j = 0; j < numCols; j++) {
            if (inArray[i][j] != T(0)) {
                triplets.emplace_back(i, j, inArray[i][j]);
            }
        }
    }
}
```

转置一个用三元组表示的稀疏矩阵：

转置矩阵的三元组表示，只需将原矩阵的行列号互换，如果要保持行序优先，将新行号进行排序即可.

```cpp
template<typename T>
TripletList<T> TripletList<T>::transpose() {
    for (auto& triplet : triplets) {
        std::swap(triplet.row, triplet.col);
    }

    std::sort(triplets.begin(), triplets.end(), [](const Triplet& a, const Triplet& b) {
        return (a.row < b.row) || (a.row == b.row && a.col < b.col);
    });

    std::swap(numRows, numCols);
}
```

（两个行序优先存储的三元组表示的）稀疏矩阵乘法：

```cpp
template<typename T>
void TripletList<T>::multiplyMatrix(const TripletList<T>& otherMatrix) {
    if (numCols != otherMatrix.numRows) {
        throw std::invalid_argument("Matrix dimensions do not match for multiplication.");
    }

    TripletList<T> result;
    result.numRows = numRows;
    result.numCols = otherMatrix.numCols;

    for (const auto& a : triplets) {
        for (const auto& b : otherMatrix.triplets) {
            if (a.col == b.row) {
                bool found = false;
                for (auto& c : result.triplets) {
                    if (c.row == a.row && c.col == b.col) {
                        c.value += a.value * b.value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    result.triplets.emplace_back(a.row, b.col, a.value * b.value);
                }
            }
        }
    }

    *this = result;
}
```

最坏情况时间复杂度会达到$O(n^3)$，问题在于每次相乘都需要<span style="color:red">线性遍历</span>找到匹配项！即，三元组表示稀疏矩阵时，只能选择“行序”或“列序”优先存储，选择一种后，另一种操作效率就会降低！

### Orthogonal List Representation:

#### Defination

from https://www.geeksforgeeks.org/orthogonal-linked-list/

An Orthogonal Linked List is a data structure composed of fundamental elements called Nodes (similar to linked lists). Each node in an orthogonal Linked List points to 4 other nodes, namely up, down, left and right.

```
Input:
    matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
    }

Output: 
    A Node pointing to the top-left corner of the orthogonal linked list.
    
       ^      ^      ^
       |      |      |
    <--1 <--> 2 <--> 3-->
       ^      ^      ^
       |      |      |
       v      v      v
    <--4 <--> 5 <--> 6-->
       ^      ^      ^
       |      |      |
       v      v      v
    <--7 <--> 8 <--> 9-->
       |      |      |
       v      v      v
```

将十字链表应用到稀疏矩阵的场景中，可以实现高效的稀疏矩阵存储和操作.十字链表的核心思想是，通过**行链表**和**列链表**的交叉结构，实现对稀疏矩阵的高效**索引**和**操作**.（可以发现，三元组压缩与十字链表压缩很大的区别在于“索引”的性能）

从[这里](https://hsuloong.github.io/data-structure/sparse-matrix-orthogonal-linked-list.html)学习了相关代码

```cpp
template<typename T>
class OrthList {
private:
    struct OrthAtom {
        int row, col;
        T ele;
        OrthAtom *rowNext, *colNext;
        OrthAtom() : row(0), col(0), ele(T(0)), rowNext(nullptr), colNext(nullptr) {}
    };

    vector<OrthAtom> rowDummy, colDummy;

public:
    OrthList();
    OrthList(const vector<vector<T>> &inArray);
    ~OrthList();
    void insertNode(int row, int col, T value);
    OrthList<T> transpose();
    OrthList<T> multiplyMatrix(const OrthList<T>& mat);
    vector<vector<T>> transformTo2DArray();
    void printMatrix();
    void printSparseMatrix();
    void makeEmpty();
};
```

构建十字链表的关键在于**插入节点**，需要找到非空元素的行、列位置，然后插入到行链表和列链表中.

```cpp
template<typename T>
OrthList<T>::OrthList(const vector<vector<T>>& inArray) : rowDummy(inArray.size()), colDummy(inArray.size() > 0 ? inArray[0].size() : 0) {
    if (inArray.size() > 0 && inArray[0].size() > 0) {
        for (int i = 0; i < int(inArray.size()); i++) {
            for (int j = 0; j < int(inArray[i].size()); j++) {
                if (inArray[i][j] != T(0)) {
                    insertNode(i, j, inArray[i][j]);
                }
            }
        }
    }
}

template<typename T>
void OrthList<T>::insertNode(int row, int col, T value) {
    OrthAtom* rowIter = &rowDummy[row];
    OrthAtom* colIter = &colDummy[col];
    
    // 找到非空元素的行、列位置
    while (rowIter->rowNext && rowIter->rowNext->col < col) 
        rowIter = rowIter->rowNext;
    while (colIter->colNext && colIter->colNext->row < row) 
        colIter = colIter->colNext;

    OrthAtom* newNode = new OrthAtom();

    // 0-based index
    newNode->row = row;
    newNode->col = col;
    newNode->ele = value;

    // 插入到行链表
    newNode->rowNext = rowIter->rowNext;
    rowIter->rowNext = newNode;

    // 插入到列链表
    newNode->colNext = colIter->colNext;
    colIter->colNext = newNode;
}
```

转置一个用十字链表表示的稀疏矩阵：

```cpp
template<typename T>
OrthList<T> OrthList<T>::transpose() {
    OrthList<T> transposedMatrix;
    transposedMatrix.rowDummy.resize(colDummy.size());
    transposedMatrix.colDummy.resize(rowDummy.size());

    for (int i = 0; i < int(rowDummy.size()); i++) {
        OrthAtom* cycleIter = rowDummy[i].rowNext;
        while (cycleIter != nullptr) {
            transposedMatrix.insertNode(cycleIter->col, cycleIter->row, cycleIter->ele);
            cycleIter = cycleIter->rowNext;
        }
    }

    return transposedMatrix;
}
```

两个十字链表表示的稀疏矩阵相乘：

```cpp
template<typename T>
OrthList<T> OrthList<T>::multiplyMatrix(const OrthList<T>& otherMatrix) {

    if (colDummy.size() != otherMatrix.rowDummy.size()) {
        throw std::invalid_argument("无法相乘！请检查矩阵维数");
    }

    OrthList<T> resultMatrix;
    resultMatrix.rowDummy.resize(rowDummy.size());
    resultMatrix.colDummy.resize(otherMatrix.colDummy.size());


    // 用于累积当前行的列结果
    vector<T> tmpAccumulate(otherMatrix.colDummy.size(), T(0));

    for (size_t i = 0; i < rowDummy.size(); i++) {
        std::fill(tmpAccumulate.begin(), tmpAccumulate.end(), T(0));

        // 获取当前行的第一个节点
        OrthAtom* firstIter = rowDummy[i].rowNext;

        while (firstIter != nullptr) {
            int rowIndex = firstIter->col;

            OrthAtom* secondIter = otherMatrix.rowDummy[rowIndex].rowNext;

            // 对应的 otherMatrix 行与当前行元素相乘并累加
            while (secondIter != nullptr) {
                tmpAccumulate[secondIter->col] += firstIter->ele * secondIter->ele;
                secondIter = secondIter->rowNext;
            }

            firstIter = firstIter->rowNext;
        }

        // 将非零的累积结果插入结果矩阵
        for (size_t j = 0; j < tmpAccumulate.size(); j++) {
            if (tmpAccumulate[j] != T(0)) {
                resultMatrix.insertNode(i, j, tmpAccumulate[j]);
            }
        }
    }

    return resultMatrix;
}
```

## Remarks

- 对比

| **对比维度**      | **Triplet**                             | **Orthogonal List**                         |
|------------------|--------------------------------------------|-----------------------------------------|
| **存储复杂度**    | $ O(nnz) $，其中 $ nnz $ 为非零元素个数       | $ O(nnz) + O(rows + cols) $          |
| **乘法复杂度**    | $ O(nnz_A \cdot nnz_B) $ （两稀疏矩阵）      | $ O(nnz_A + nnz_B) $                 |
| **动态操作性能**  | 不适合动态操作，需重建三元组                   | 适合动态修改，链表操作较为灵活             |
| **适用场景**      | 小规模、静态稀疏矩阵                          | 大规模、动态稀疏矩阵                      |
| **优点**       | 实现简单，适合小规模矩阵 | 高效处理稀疏矩阵，动态操作灵活 |
| **缺点**       | 遍历开销大，动态操作复杂 | 实现复杂，头结点额外开销 |


- **十字链表更快的关键原因**在于它额外存储了 **行链表** 和 **列链表** 的结构信息，从而能够快速定位和遍历矩阵中的非零元素，而不像三元组那样需要线性搜索整个列表.

三元组仅存储非零元素的信息，通常以一个列表表示：
- 每个元素存储 $ (row, col, value) $.
- 没有额外的索引机制，只能通过遍历整个列表寻找特定行或列的非零元素.

十字链表为每一行和每一列分别维护一个链表：
- **行链表**：每一行有一个链表，存储该行的所有非零元素，元素按列号排序.
- **列链表**：每一列有一个链表，存储该列的所有非零元素，元素按行号排序.
进而通过这种交叉结构：
1. **快速遍历行**：通过行链表直接获取指定行的所有非零元素，而无需遍历整个矩阵.
2. **快速遍历列**：通过列链表直接获取指定列的所有非零元素，同样无需遍历整个矩阵.


具体到操作：
**三元组**

在三元组中，计算 $ C[i][m] = \sum_{k} A[i][k] \cdot B[k][m] $ 的步骤：
1. 遍历三元组，找到 $ A[i][k] $ 中所有 $ i $ 行的非零元素（需要完整遍历 $ A $ 的三元组）.
2. 对于每个 $ A[i][k] $，再次遍历 $ B $ 的三元组，找到所有 $ B[k][m] $（需要完整遍历 $ B $ 的三元组）.
3. 两次线性遍历导致时间复杂度为 $ O(nnz_A \cdot nnz_B) $.

**十字链表的操作**

在十字链表中，计算 $ C[i][m] = \sum_{k} A[i][k] \cdot B[k][m] $ 的步骤：
1. 从行链表直接找到 $ A[i][k] $ 的所有非零元素，复杂度为 $ O(nnz_A / rows) $（每行的平均非零元素数）.
2. 对于每个 $ A[i][k] $，从列链表直接找到 $ B[k][m] $ 的所有非零元素，复杂度为 $ O(nnz_B / cols) $（每列的平均非零元素数）.
3. 整体复杂度为 $ O(nnz_A \cdot nnz_B / n) $，<span style="color:blue">即非零元素的匹配操作被优化为稀疏度相关</span>

十字链表通过行链表和列链表的索引机制，使得查找操作从 **全局搜索** 降为 **局部搜索**，大幅减少不必要的遍历