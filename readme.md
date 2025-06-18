# Boid Algorithm Simulator

一个基于JavaScript的鸟群算法（Boids Algorithm）模拟器，支持2D和3D可视化。该项目展示了生物群体行为的仿真，包括聚集、对齐和分离三种基本行为。

## 🌟 功能特点

- **双模式支持**: 支持2D Canvas和3D Three.js渲染
- **实时控制**: 可调节群体大小和行为参数
- **性能监控**: 内置性能监控系统，实时显示FPS、内存使用等
- **空间优化**: 使用空间网格优化算法，支持大规模群体模拟
- **响应式设计**: 适配不同屏幕尺寸
- **清晰的代码结构**: 模块化设计，易于扩展和维护

## 📁 项目结构

```
boid-algorithm/
├── index.html              # 主页面文件
├── package.json            # 项目配置文件
├── README.md              # 项目说明文档
├── docs/                  # 文档目录
│   └── readme.md         # 详细文档
└── src/                   # 源代码目录
    ├── css/              # 样式文件
    │   └── styles.css    # 主样式文件
    ├── js/               # JavaScript文件
    │   ├── 2d/           # 2D模拟相关文件
    │   │   ├── boid.js   # 2D鸟群类定义
    │   │   └── main.js   # 2D主程序
    │   ├── 3d/           # 3D模拟相关文件
    │   │   ├── boid3D.js # 3D鸟群类定义
    │   │   └── main3D.js # 3D主程序
    │   └── utils/        # 工具类
    │       ├── Vector3D.js           # 3D向量数学库
    │       └── performance-monitor.js # 性能监控系统
    └── assets/           # 静态资源目录（预留）
```

## 🚀 快速开始

### 环境要求

- 现代浏览器（支持HTML5 Canvas和WebGL）
- 本地HTTP服务器（用于开发）

### 安装与运行

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/boid-algorithm.git
   cd boid-algorithm
   ```

2. **启动本地服务器**
   
   使用Python (推荐):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -SimpleHTTPServer 8000
   ```
   
   或使用Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **打开浏览器**
   
   访问 `http://localhost:8000` 即可查看模拟器

## 🎮 使用说明

### 界面说明

- **标签切换**: 在2D和3D模式间切换
- **控制面板**: 调节群体大小和行为参数
- **性能监控**: 右上角显示实时性能数据
- **参数调节**: 
  - **Flock Size**: 群体大小（10-500）
  - **Alignment**: 对齐强度（0-2）
  - **Cohesion**: 聚集强度（0-2）
  - **Separation**: 分离强度（0-2）

### 鸟群算法原理

鸟群算法基于三个简单规则：

1. **分离 (Separation)**: 避免与邻近个体碰撞
2. **对齐 (Alignment)**: 与邻近个体保持相同方向
3. **聚集 (Cohesion)**: 向邻近个体的中心位置移动

## 🔧 技术架构

### 核心技术栈

- **前端渲染**: HTML5 Canvas (2D) + Three.js (3D)
- **JavaScript**: ES6+ 语法，模块化设计
- **CSS**: 响应式布局，现代UI设计
- **性能优化**: 空间网格分割，帧率监控

### 关键算法

1. **空间网格优化**: 将空间划分为网格，减少邻近检测复杂度
2. **向量数学**: 自定义Vector和Vector3D类处理位置和速度计算
3. **性能监控**: 实时FPS统计，内存使用监控

### 代码模块

- `src/js/2d/boid.js`: 2D鸟群个体类
- `src/js/3d/boid3D.js`: 3D鸟群个体类
- `src/js/utils/Vector3D.js`: 3D向量数学库
- `src/js/utils/performance-monitor.js`: 性能监控系统

## 📈 性能特性

- **优化算法**: 使用空间网格减少O(n²)复杂度到近似O(n)
- **实时监控**: FPS、内存使用、渲染时间等指标
- **动态调节**: 根据性能自动优化参数
- **大规模支持**: 可支持数百个个体的实时模拟

## 🔧 扩展开发

### 添加新行为

在`Boid`或`Boid3D`类中添加新的行为方法：

```javascript
// 示例：添加觅食行为
seek(target) {
    let force = Vector.sub(target, this.position);
    force.normalize();
    force.mult(this.maxSpeed);
    force.sub(this.velocity);
    force.limit(this.maxForce);
    return force;
}
```

### 自定义渲染

修改`draw`方法来自定义个体外观：

```javascript
draw(ctx) {
    // 自定义绘制逻辑
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, 5, 5);
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [https://github.com/yourusername/boid-algorithm](https://github.com/yourusername/boid-algorithm)
- 问题反馈: [Issues](https://github.com/yourusername/boid-algorithm/issues)

## 🙏 致谢

- [Craig Reynolds](http://www.red3d.com/cwr/boids/) - 鸟群算法的原创者
- [Three.js](https://threejs.org/) - 3D渲染库
- [MDN Web Docs](https://developer.mozilla.org/) - 优秀的Web开发文档 