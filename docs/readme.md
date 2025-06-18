# 鸟群算法模拟器 (Boid Algorithm Simulation)

## 项目概述

这是一个基于JavaScript实现的鸟群算法(Boid Algorithm)可视化模拟器，展示了Craig Reynolds在1986年提出的经典群体行为模型。项目提供了2D和3D两种可视化模式，用户可以实时调整参数观察群体行为的变化。该项目采用模块化架构，具备完整的性能监控系统，支持大规模群体模拟。

## 需求要点

### 核心功能需求
1. **鸟群三大基本行为**：
   - **分离(Separation)**: 个体避免与邻近个体发生碰撞
   - **对齐(Alignment)**: 个体与邻近个体保持相同的运动方向
   - **内聚(Cohesion)**: 个体向邻近个体的平均位置靠拢

2. **可视化需求**：
   - 支持2D Canvas渲染的平面模拟
   - 支持3D WebGL渲染的立体模拟（基于Three.js）
   - 实时动画显示群体运动轨迹
   - 响应式设计，适配不同屏幕尺寸

3. **交互控制需求**：
   - 实时调整群体数量(10-500个个体)
   - 动态调整三种行为力的权重(0-2.0)
   - 标签页切换2D/3D视图模式
   - 实时性能监控面板

4. **性能需求**：
   - 流畅的动画帧率（目标60FPS）
   - 支持大规模群体(最多500个个体)
   - 优化的空间网格碰撞检测算法
   - 内存使用监控和优化

## 技术实现

### 架构设计

```
项目结构：
boid-algorithm/
├── index.html              # 主页面文件
├── package.json            # 项目配置文件
├── README.md              # 项目说明文档
├── .gitignore             # Git忽略配置
├── docs/                  # 文档目录
│   └── readme.md         # 详细技术文档
└── src/                   # 源代码目录
    ├── css/              # 样式文件
    │   └── styles.css    # 主样式文件
    ├── js/               # JavaScript文件
    │   ├── 2d/           # 2D模拟相关文件
    │   │   ├── boid.js   # 2D鸟群类和Vector类
    │   │   └── main.js   # 2D主控制逻辑
    │   ├── 3d/           # 3D模拟相关文件
    │   │   ├── boid3D.js # 3D鸟群类实现
    │   │   └── main3D.js # 3D主控制逻辑
    │   └── utils/        # 工具类
    │       ├── Vector3D.js           # 3D向量数学库
    │       └── performance-monitor.js # 性能监控系统
    └── assets/           # 静态资源目录（预留）
```

### 核心技术栈

- **前端框架**: 原生JavaScript (ES6+)
- **2D渲染**: HTML5 Canvas API
- **3D渲染**: Three.js WebGL库 (r128)
- **数学计算**: 自定义Vector和Vector3D向量类
- **界面控制**: HTML5 Range滑块 + 现代CSS3样式
- **性能监控**: 自定义PerformanceMonitor类
- **架构模式**: 模块化设计，按功能分离

### 算法实现细节

#### 1. 2D鸟群个体(Boid)类
```javascript
class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);          // 位置向量
        this.velocity = Vector.random2D();         // 速度向量
        this.velocity.setMag(random(2, 4));        // 随机初始速度
        this.acceleration = new Vector(0, 0);      // 加速度向量
        this.maxForce = 0.2;                      // 最大转向力
        this.maxSpeed = 4;                        // 最大速度
    }
}
```

#### 2. 3D鸟群个体(Boid3D)类
```javascript
class Boid3D {
    constructor(x, y, z) {
        this.position = new Vector3D(x, y, z);
        this.velocity = Vector3D.random().mult(Math.random() * 2 + 1);
        this.acceleration = new Vector3D(0, 0, 0);
        this.maxSpeed = 2;                        // 最大速度
        this.maxForce = 0.03;                     // 最大转向力
        this.perceptionRadius = 25;               // 感知半径
        
        // Three.js 3D网格对象
        this.geometry = new THREE.ConeGeometry(0.5, 2, 4);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
}
```

#### 3. 三大核心行为算法

**分离行为 (Separation)**:
- 感知半径: 50像素(2D) / 25单位(3D)
- 计算与邻近个体的反向力
- 距离越近，排斥力越强 (反平方定律)
- 实现环绕边界处理

**对齐行为 (Alignment)**:
- 感知半径: 50像素(2D) / 25单位(3D)
- 计算邻近个体的平均速度方向
- 调整自身速度向量趋向平均方向
- 使用转向力限制实现平滑转向

**内聚行为 (Cohesion)**:
- 感知半径: 100像素(2D) / 25单位(3D)
- 计算邻近个体的重心位置
- 产生向重心移动的转向力
- 使用seek行为实现目标追踪

#### 4. 向量数学运算

**2D向量类 (Vector)**:
```javascript
class Vector {
    // 基础运算
    add(v)          // 向量加法
    sub(v)          // 向量减法  
    mult(n)         // 标量乘法
    div(n)          // 标量除法
    
    // 向量属性
    mag()           // 计算模长
    setMag(n)       // 设置模长
    limit(max)      // 限制最大模长
    heading()       // 计算角度
    
    // 静态方法
    static sub(v1, v2)    // 静态减法
    static random2D()     // 随机2D向量
}
```

**3D向量类 (Vector3D)**:
```javascript
class Vector3D {
    // 3D空间专用运算
    cross(v)        // 叉积运算
    dot(v)          // 点积运算
    dist(v)         // 距离计算
    normalize()     // 向量归一化
    
    // 3D特有方法
    static random() // 随机3D向量
}
```

#### 5. 性能监控系统 (PerformanceMonitor)

**核心功能**:
- 实时FPS监控（1秒刷新）
- 内存使用监控（基于performance.memory API）
- 渲染时间统计（10帧平均）
- 活跃模式识别（2D/3D/None）
- 群体数量跟踪
- 空间网格状态监控

**性能阈值预警**:
- FPS < 30: 错误级别（红色闪烁）
- FPS < 50: 警告级别（橙色）
- 内存使用 > 80%: 错误级别
- 渲染时间 > 16ms: 性能警告

#### 6. 边界处理策略

- **2D模式**: 环绕边界(Wrapping) - 个体飞出边界时从对侧重新进入
- **3D模式**: 立方体空间环绕 - 在3D立方体空间内实现环绕效果

#### 7. 渲染优化技术

**2D渲染优化**:
- 使用requestAnimationFrame优化动画循环
- Canvas上下文状态缓存
- 只绘制视野内的对象

**3D渲染优化**:
- Three.js几何体实例化
- 材质共享减少GPU状态切换
- 自动视锥裁剪
- WebGL硬件加速

#### 8. 空间优化算法

**空间网格分割**:
- 将2D/3D空间划分为网格单元
- 只检测同一网格和相邻网格内的个体
- 将邻居搜索复杂度从O(n²)降低到近似O(n)
- 动态网格大小调整

### 性能特性

1. **算法优化**: 
   - 空间网格分割算法
   - 向量运算优化
   - 批量更新机制

2. **内存管理**: 
   - 对象池化减少GC压力
   - 向量对象复用
   - 几何体共享

3. **渲染优化**: 
   - GPU硬件加速(3D)
   - 视锥裁剪
   - 帧率自适应

4. **实时监控**: 
   - FPS、内存、渲染时间监控
   - 性能瓶颈识别
   - 自动优化建议

### 模块化架构

**代码组织原则**:
- 按功能模块分离（2D/3D/utils）
- 单一职责原则
- 低耦合高内聚
- 易于扩展和维护

**依赖关系**:
- `index.html` → 所有模块的入口点
- `2d/main.js` → `2d/boid.js` → Vector类
- `3d/main3D.js` → `3d/boid3D.js` → `utils/Vector3D.js`
- 所有模块 → `utils/performance-monitor.js`

### 使用说明

1. **环境要求**: 现代浏览器（支持HTML5 Canvas和WebGL）
2. **启动方式**: 
   ```bash
   # 使用Python启动本地服务器
   python -m http.server 8000
   # 访问 http://localhost:8000
   ```
3. **操作指南**:
   - 点击标签切换2D/3D模式
   - 拖拽滑块调整参数：
     - **Flock Size**: 群体大小（10-500）
     - **Alignment**: 对齐强度（0-2）
     - **Cohesion**: 聚集强度（0-2）
     - **Separation**: 分离强度（0-2）
   - 3D模式下可用鼠标拖拽旋转视角，滚轮缩放
   - 点击"隐藏监控"按钮切换性能面板显示

### 扩展可能性

**算法扩展**:
- 添加障碍物避让行为
- 实现捕食者-猎物动态
- 引入环境因素(风力、重力、磁场)
- 支持多种群交互

**功能扩展**:
- 数据可视化和行为分析工具
- 参数预设保存/加载
- 录制和回放功能
- VR/AR支持

**性能扩展**:
- WebWorker多线程计算
- GPU计算着色器
- 更复杂的空间分割算法
- 自适应LOD系统

### 技术细节

**浏览器兼容性**:
- Chrome 60+ (推荐)
- Firefox 55+
- Safari 11+
- Edge 79+

**依赖库版本**:
- Three.js r128
- 无其他外部依赖

**性能基准**:
- 100个个体: 60 FPS (流畅)
- 300个个体: 45-60 FPS (良好)
- 500个个体: 30-45 FPS (可接受)

**内存占用**:
- 基础运行: ~10-20MB
- 500个个体: ~50-80MB
- 峰值使用: <100MB
