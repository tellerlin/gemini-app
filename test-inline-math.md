# 内联数学公式测试

测试修复后的内联数学公式渲染。

## 应该被渲染为数学的内容

- 内联数学: $$\frac{\partial}{\partial t}$$ 表示对时间 $t$ 的偏导数。
- 积分: $$\int_{\Omega} d^3x$$ 在三维空间区域 $$\Omega$$ 上进行体积积分。
- 散度运算符: $$\nabla \cdot (\dots)$$ 作用于一个向量场。
- 向量场: $$\mathbf{A}(x,t)$$ 和 $$\mathbf{B}(x,t)$$ 两个随空间 $x$ 和时间 $t$ 变化的向量场。
- 向量叉乘: $$\times$$ 向量叉乘。
- 常数标量: $$\lambda$$ 一个常数标量。

## 应该被当作普通文本的内容

- 价格：这个商品售价$300，打折后$250。
- 变量名：在代码中，`$variable` 和 `$PATH` 是环境变量。
- 货币：我有$100美元。

## 混合内容测试

- 哈密顿算符 $$\hat{H}$$ 在量子力学中很重要，但$100的价格很便宜。
- 变分导数 $$\frac{\delta}{\delta \phi(x)}$$ 作用于场 $$\phi(x)$$，而不是$50的折扣。

## 代码块测试（不应该被数学处理）

```bash
export PATH=$PATH:/usr/local/bin
echo "Price: $price"
```

```python
cost = $300  # This should not be math
formula = r"$\int x dx$"  # This is a string
```