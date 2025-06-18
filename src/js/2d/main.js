/**
 * 鸟群算法主程序 - 性能优化版本
 * 负责初始化画布、创建群体并维护动画循环
 */

let isAnimating2D = true; // 控制2D动画循环的标志

// 获取画布和绘图上下文
const canvas = document.getElementById('boidCanvas');
const ctx = canvas.getContext('2d');

// 性能优化：缓存DOM查询结果
let alignSliderValue = 1;
let cohesionSliderValue = 1;
let separationSliderValue = 1;
let lastUpdateTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

// 空间分割网格优化 - 减少碰撞检测的复杂度
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        this.clear();
    }

    clear() {
        this.grid = Array(this.cols * this.rows).fill(null).map(() => []);
    }

    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return row * this.cols + col;
    }

    insert(boid) {
        const index = this.getIndex(boid.position.x, boid.position.y);
        if (index >= 0 && index < this.grid.length) {
            this.grid[index].push(boid);
        }
    }

    getNearby(boid, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCol = Math.floor(boid.position.x / this.cellSize);
        const centerRow = Math.floor(boid.position.y / this.cellSize);

        for (let row = centerRow - cellRadius; row <= centerRow + cellRadius; row++) {
            for (let col = centerCol - cellRadius; col <= centerCol + cellRadius; col++) {
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    const index = row * this.cols + col;
                    nearby.push(...this.grid[index]);
                }
            }
        }
        return nearby;
    }
}

let spatialGrid;

// 设置画布尺寸
function resizeCanvas() {
    if (canvas) {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        canvas.width = containerWidth;
        canvas.height = containerWidth * (9/16); // 保持16:9的比例
        
        // 重新初始化空间网格
        spatialGrid = new SpatialGrid(canvas.width, canvas.height, 50);
    }
}

// 初始设置画布尺寸
resizeCanvas();

// 监听窗口调整大小事件
window.addEventListener('resize', resizeCanvas);

// 获取交互控制滑块元素
const flockSizeSlider = document.getElementById('flockSize');
const flockSizeValue = document.getElementById('flockSizeValue');
const alignSlider = document.getElementById('alignment');
const cohesionSlider = document.getElementById('cohesion');
const separationSlider = document.getElementById('separation');

// 初始化鸟群
let flock = [];
let numBoids = parseInt(flockSizeSlider.value);

// 在标签页切换时管理动画状态
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            isAnimating2D = (button.dataset.tab === '2d');
            console.log('Tab switched to:', button.dataset.tab, 'isAnimating2D:', isAnimating2D);
        });
    });
});

// 更新控制值显示的函数 - 添加节流
let updateThrottle = false;
function updateControlValue(slider, value) {
    if (updateThrottle) return;
    updateThrottle = true;
    
    requestAnimationFrame(() => {
        const controlItem = slider.closest('.control-item');
        const valueDisplay = controlItem.querySelector('.value');
        if (valueDisplay) {
            valueDisplay.textContent = Number(value).toFixed(1);
        }
        updateThrottle = false;
    });
}

// 缓存滑块值以避免重复DOM查询
function updateSliderValues() {
    alignSliderValue = parseFloat(alignSlider.value);
    cohesionSliderValue = parseFloat(cohesionSlider.value);
    separationSliderValue = parseFloat(separationSlider.value);
}

// 为所有滑块添加事件监听器
[alignSlider, cohesionSlider, separationSlider].forEach(slider => {
    slider.addEventListener('input', function() {
        updateControlValue(this, this.value);
        updateSliderValues(); // 缓存新值
    });
    // 初始化显示值
    updateControlValue(slider, slider.value);
});

// 初始化缓存值
updateSliderValues();

// 更新鸟群数量显示
flockSizeSlider.addEventListener('input', function() {
    const newSize = parseInt(this.value);
    flockSizeValue.textContent = newSize;
    
    // 调整鸟群大小
    if (newSize > flock.length) {
        // 添加新的boid
        while (flock.length < newSize) {
            flock.push(new Boid(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }
    } else if (newSize < flock.length) {
        // 移除多余的boid
        flock = flock.slice(0, newSize);
    }
    
    console.log('2D Flock size updated to:', flock.length);
});

// 初始化群体中的每个boid
for (let i = 0; i < numBoids; i++) {
    flock.push(new Boid(
        Math.random() * canvas.width,
        Math.random() * canvas.height
    ));
}

console.log('2D flock initialized with', flock.length, 'boids');

// 性能监控
let frameCount = 0;
let lastFPSTime = Date.now();
let currentFPS = 0;

/**
 * 动画循环函数 - 性能优化版本
 */
function animate(currentTime) {
    // 性能监控：开始渲染计时
    if (window.performanceMonitor) {
        window.performanceMonitor.startRenderTimer();
    }

    // 帧率控制
    if (currentTime - lastUpdateTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
    }
    lastUpdateTime = currentTime;

    // 只在2D标签页激活时运行动画
    if (!isAnimating2D) {
        requestAnimationFrame(animate);
        return;
    }

    // 性能监控
    frameCount++;
    if (currentTime - lastFPSTime >= 1000) {
        currentFPS = frameCount;
        frameCount = 0;
        lastFPSTime = currentTime;
        
        // 每秒输出一次性能信息
        if (currentFPS < 30) {
            console.warn('Low FPS detected:', currentFPS, 'Flock size:', flock.length);
        }
    }
    
    // 清空空间网格
    spatialGrid.clear();
    
    // 将所有boids插入空间网格
    for (let boid of flock) {
        spatialGrid.insert(boid);
    }
    
    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 批量更新并绘制每个boid
    for (let boid of flock) {
        // 使用空间网格获取邻近的boids，而不是整个群体
        const nearbyBoids = spatialGrid.getNearby(boid, 100); // 最大感知范围
        boid.flockOptimized(nearbyBoids, alignSliderValue, cohesionSliderValue, separationSliderValue);
        boid.update();
        boid.draw(ctx);
    }

    // 性能监控：结束渲染计时
    if (window.performanceMonitor) {
        window.performanceMonitor.endRenderTimer();
    }

    // 请求下一帧动画
    requestAnimationFrame(animate);
}

// 启动动画循环
console.log('Starting optimized 2D animation loop');
requestAnimationFrame(animate);
