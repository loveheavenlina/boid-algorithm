/**
 * 鸟群算法主程序
 * 负责初始化画布、创建群体并维护动画循环
 */

let isAnimating2D = true; // 控制2D动画循环的标志

// 获取画布和绘图上下文
const canvas = document.getElementById('boidCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
function resizeCanvas() {
    if (canvas) {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        canvas.width = containerWidth;
        canvas.height = containerWidth * (9/16); // 保持16:9的比例
    }
}

// 初始设置画布尺寸
resizeCanvas();

// 监听窗口调整大小事件
window.addEventListener('resize', resizeCanvas);

// 获取交互控制滑块元素
const flockSizeSlider = document.getElementById('flockSize');  // 鸟群数量滑块
const flockSizeValue = document.getElementById('flockSizeValue'); // 显示数量的元素
const alignSlider = document.getElementById('alignment');      // 对齐力度滑块
const cohesionSlider = document.getElementById('cohesion');    // 内聚力度滑块
const separationSlider = document.getElementById('separation'); // 分离力度滑块

// 初始化鸟群
let flock = [];           // 存储所有boid的数组
let numBoids = parseInt(flockSizeSlider.value);       // 群体中的个体数量

// 在标签页切换时管理动画状态
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            isAnimating2D = (button.dataset.tab === '2d');
            console.log('Tab switched to:', button.dataset.tab, 'isAnimating2D:', isAnimating2D);
        });
    });
});

// 更新控制值显示的函数
function updateControlValue(slider, value) {
    const controlItem = slider.closest('.control-item');
    const valueDisplay = controlItem.querySelector('.value');
    if (valueDisplay) {
        valueDisplay.textContent = Number(value).toFixed(1);
    }
}

// 为所有滑块添加事件监听器
[alignSlider, cohesionSlider, separationSlider].forEach(slider => {
    slider.addEventListener('input', function() {
        updateControlValue(this, this.value);
    });
    // 初始化显示值
    updateControlValue(slider, slider.value);
});

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
// 随机分布在画布范围内
for (let i = 0; i < numBoids; i++) {
    flock.push(new Boid(
        Math.random() * canvas.width,    // 随机X坐标
        Math.random() * canvas.height    // 随机Y坐标
    ));
}

console.log('2D flock initialized with', flock.length, 'boids');

/**
 * 动画循环函数
 * 负责清空画布、更新所有boid的状态并重新绘制
 */
function animate() {
    // 只在2D标签页激活时运行动画
    if (!isAnimating2D) {
        requestAnimationFrame(animate);
        return;
    }
    
    // 清空画布
    // 使用深灰色背景以提供更好的视觉效果
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制每个boid
    for (let boid of flock) {
        boid.flock(flock);   // 计算群体行为
        boid.update();       // 更新位置和速度
        boid.draw(ctx);      // 绘制boid
    }

    // 请求下一帧动画
    // 这会创建一个平滑的动画循环
    requestAnimationFrame(animate);
}

// 启动动画循环
console.log('Starting 2D animation loop');
animate();
