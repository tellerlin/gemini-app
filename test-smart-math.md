# 数学公式智能识别测试

## 测试你观察到的模式

**$\和$= \和$+ \和$- \模式测试：**

- $\frac{\partial}{\partial t}$：表示对时间的偏导数
- $= \left( \mathcal{C} \circ \mathcal{D} \right)$：等号开头的表达式  
- $+ \sum_{k=1}^N \mathcal{L}_k$：加号开头的表达式
- $- \mathbf{G} \otimes \left( \mathbf{H} \odot \mathbf{\Sigma} \right)$：减号开头的表达式

## 块级公式测试

$
\frac{\partial}{\partial t} \left( \int_{\Omega_t} \nabla \cdot \left( \mathbf{A}(x,t) \mathbf{u}(x,t) \right) \mathrm{d}x \right) + \sum_{k=1}^N \mathcal{L}_k \left[ \mathbf{F}_k \left( \mathbf{M}_k^{-1} \mathbf{J}_k(t) \right) \right] - \mathbf{G} \otimes \left( \mathbf{H} \odot \mathbf{\Sigma} \right) = \left( \mathcal{C} \circ \mathcal{D} \right) \left[ \mathcal{P}_t \left( \mathbf{Q} \right) \right] + \xi(t)
$

## 内联数学符号测试

- 时间变量 $t$ 和空间变量 $x$
- 希腊字母 $\lambda$、$\Omega$、$\xi$
- 矩阵符号 $\mathbf{A}(x,t)$ 和 $\mathbf{u}(x,t)$

## 不应该被处理的内容

- 价格：这个商品售价$300，打折后$250
- 代码：`$PATH` 和 `$HOME` 环境变量
- 普通文本：我有$100美元

## 复杂数学表达式

- $\mathcal{L}_k \left[ \mathbf{F}_k \left( \mathbf{M}_k^{-1} \mathbf{J}_k(t) \right) \right]$
- $\nabla \cdot \left( \mathbf{A}(x,t) \mathbf{u}(x,t) \right)$
- $\mathbf{G} \otimes \left( \mathbf{H} \odot \mathbf{\Sigma} \right)$