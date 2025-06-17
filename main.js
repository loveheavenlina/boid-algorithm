/**
 * 鸟群算法主程序
 * 负责初始化画布、创建群体并维护动画循环
 */

// 获取画布和绘图上下文
const canvas = document.getElementById('boidCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
canvas.width = 800;     // 画布宽度
canvas.height = 600;    // 画布高度

// 获取交互控制滑块元素
const flockSizeSlider = document.getElementById('flockSize');  // 鸟群数量滑块
const flockSizeValue = document.getElementById('flockSizeValue'); // 显示数量的元素
const alignSlider = document.getElementById('alignment');      // 对齐力度滑块
const cohesionSlider = document.getElementById('cohesion');    // 内聚力度滑块
const separationSlider = document.getElementById('separation'); // 分离力度滑块

// 初始化鸟群
let flock = [];           // 存储所有boid的数组
let numBoids = parseInt(flockSizeSlider.value);       // 群体中的个体数量

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
});

// 初始化群体中的每个boid
// 随机分布在画布范围内
for (let i = 0; i < numBoids; i++) {
    flock.push(new Boid(
        Math.random() * canvas.width,    // 随机X坐标
        Math.random() * canvas.height    // 随机Y坐标
    ));
}

/**
 * 动画循环函数
 * 负责清空画布、更新所有boid的状态并重新绘制
 */
function animate() {
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
animate();
