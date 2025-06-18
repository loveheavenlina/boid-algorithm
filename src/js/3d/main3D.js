/**
 * 3D鸟群算法主程序 - 性能优化版本
 * 使用Three.js实现3D可视化效果
 */

let isAnimating3D = false; // 控制3D动画循环的标志
let scene, camera, renderer, controls;
let flock3D = [];

// 性能优化变量
let lastUpdateTime3D = 0;
const targetFPS3D = 60;
const frameInterval3D = 1000 / targetFPS3D;
let frameCount3D = 0;
let lastFPSTime3D = Date.now();
let currentFPS3D = 0;

// 缓存3D控制值
let alignment3DValue = 1;
let cohesion3DValue = 1;
let separation3DValue = 1;

// 实例化渲染优化
let instancedMesh;
let instanceMatrix = new THREE.Matrix4();
let dummy = new THREE.Object3D();

// LOD系统变量
const LOD_DISTANCES = {
    HIGH: 50,    // 高细节距离
    MEDIUM: 100, // 中等细节距离
    LOW: 200     // 低细节距离
};

// 空间网格系统（3D版本）
class SpatialGrid3D {
    constructor(bounds, cellSize) {
        this.cellSize = cellSize;
        this.bounds = bounds;
        this.cols = Math.ceil((bounds * 2) / cellSize);
        this.rows = Math.ceil((bounds * 2) / cellSize);
        this.layers = Math.ceil((bounds * 2) / cellSize);
        this.grid = [];
        this.clear();
    }

    clear() {
        const totalCells = this.cols * this.rows * this.layers;
        this.grid = Array(totalCells).fill(null).map(() => []);
    }

    getIndex(x, y, z) {
        const col = Math.floor((x + this.bounds) / this.cellSize);
        const row = Math.floor((y + this.bounds) / this.cellSize);
        const layer = Math.floor((z + this.bounds) / this.cellSize);
        return layer * this.cols * this.rows + row * this.cols + col;
    }

    insert(boid) {
        const index = this.getIndex(boid.position.x, boid.position.y, boid.position.z);
        if (index >= 0 && index < this.grid.length) {
            this.grid[index].push(boid);
        }
    }

    getNearby(boid, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCol = Math.floor((boid.position.x + this.bounds) / this.cellSize);
        const centerRow = Math.floor((boid.position.y + this.bounds) / this.cellSize);
        const centerLayer = Math.floor((boid.position.z + this.bounds) / this.cellSize);

        for (let layer = centerLayer - cellRadius; layer <= centerLayer + cellRadius; layer++) {
            for (let row = centerRow - cellRadius; row <= centerRow + cellRadius; row++) {
                for (let col = centerCol - cellRadius; col <= centerCol + cellRadius; col++) {
                    if (layer >= 0 && layer < this.layers && 
                        row >= 0 && row < this.rows && 
                        col >= 0 && col < this.cols) {
                        const index = layer * this.cols * this.rows + row * this.cols + col;
                        nearby.push(...this.grid[index]);
                    }
                }
            }
        }
        return nearby;
    }
}

let spatialGrid3D;

// 初始化3D场景
function init3D() {
    const canvas = document.getElementById('boidCanvas3D');
    if (!canvas) {
        console.error('3D Canvas element not found');
        return;
    }

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // 创建相机
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 80);

    // 创建渲染器 - 性能优化设置
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: false, // 关闭抗锯齿以提升性能
        powerPreference: "high-performance"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 启用渲染器优化
    renderer.sortObjects = false;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // 创建轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false; // 禁用平移以减少计算

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // 创建边界框线框
    const boundaryGeometry = new THREE.BoxGeometry(100, 100, 100);
    const boundaryMaterial = new THREE.LineBasicMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.3
    });
    const boundaryEdges = new THREE.EdgesGeometry(boundaryGeometry);
    const boundaryLines = new THREE.LineSegments(boundaryEdges, boundaryMaterial);
    scene.add(boundaryLines);

    // 初始化空间网格
    spatialGrid3D = new SpatialGrid3D(50, 25);

    // 初始化3D鸟群
    initFlock3D();

    console.log('Optimized 3D scene initialized with', flock3D.length, 'boids');
}

// 初始化3D鸟群
function initFlock3D() {
    const flockSizeSlider = document.getElementById('flockSize3D');
    const numBoids = parseInt(flockSizeSlider.value);

    // 清除现有的boids
    flock3D.forEach(boid => {
        scene.remove(boid.getMesh());
        boid.dispose();
    });
    flock3D = [];

    // 创建新的boids
    for (let i = 0; i < numBoids; i++) {
        const boid = new Boid3D(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        flock3D.push(boid);
        scene.add(boid.getMesh());
    }
}

// 视锥剔除优化
function isBoidInFrustum(boid) {
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);
    
    const sphere = new THREE.Sphere(
        new THREE.Vector3(boid.position.x, boid.position.y, boid.position.z),
        2 // boid半径
    );
    
    return frustum.intersectsSphere(sphere);
}

// LOD系统 - 根据距离调整更新频率
function getLODLevel(boid) {
    const distance = camera.position.distanceTo(
        new THREE.Vector3(boid.position.x, boid.position.y, boid.position.z)
    );
    
    if (distance < LOD_DISTANCES.HIGH) return 'HIGH';
    if (distance < LOD_DISTANCES.MEDIUM) return 'MEDIUM';
    if (distance < LOD_DISTANCES.LOW) return 'LOW';
    return 'CULL'; // 太远，不更新
}

// 缓存3D控制值
function updateSliderValues3D() {
    const alignment3DSlider = document.getElementById('alignment3D');
    const cohesion3DSlider = document.getElementById('cohesion3D');
    const separation3DSlider = document.getElementById('separation3D');
    
    if (alignment3DSlider) alignment3DValue = parseFloat(alignment3DSlider.value);
    if (cohesion3DSlider) cohesion3DValue = parseFloat(cohesion3DSlider.value);
    if (separation3DSlider) separation3DValue = parseFloat(separation3DSlider.value);
}

// 处理窗口大小调整
function onWindowResize() {
    const canvas = document.getElementById('boidCanvas3D');
    if (!canvas || !camera || !renderer) return;

    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// 3D动画循环 - 性能优化版本
function animate3D(currentTime) {
    requestAnimationFrame(animate3D);

    // 帧率控制
    if (currentTime - lastUpdateTime3D < frameInterval3D) {
        return;
    }
    lastUpdateTime3D = currentTime;

    // 只在3D标签页激活时运行动画
    if (!isAnimating3D) {
        return;
    }

    // 性能监控
    frameCount3D++;
    if (currentTime - lastFPSTime3D >= 1000) {
        currentFPS3D = frameCount3D;
        frameCount3D = 0;
        lastFPSTime3D = currentTime;
        
        if (currentFPS3D < 30) {
            console.warn('3D Low FPS detected:', currentFPS3D, 'Flock size:', flock3D.length);
        }
    }

    // 更新轨道控制器
    if (controls) {
        controls.update();
    }

    // 清空并重新填充空间网格
    spatialGrid3D.clear();
    for (let boid of flock3D) {
        spatialGrid3D.insert(boid);
    }

    // 批量更新boids，使用LOD和视锥剔除
    for (let i = 0; i < flock3D.length; i++) {
        const boid = flock3D[i];
        
        // 视锥剔除检查
        if (!isBoidInFrustum(boid)) {
            boid.getMesh().visible = false;
            continue;
        }
        
        boid.getMesh().visible = true;
        
        // LOD检查
        const lodLevel = getLODLevel(boid);
        if (lodLevel === 'CULL') continue;
        
        // 根据LOD级别决定是否更新
        const shouldUpdate = lodLevel === 'HIGH' || 
                           (lodLevel === 'MEDIUM' && i % 2 === 0) ||
                           (lodLevel === 'LOW' && i % 4 === 0);
        
        if (shouldUpdate) {
            const nearbyBoids = spatialGrid3D.getNearby(boid, 30);
            boid.flockOptimized(nearbyBoids, alignment3DValue, cohesion3DValue, separation3DValue);
        }
        
        boid.update();
    }

    // 渲染场景
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// DOM加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 标签页切换事件监听
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabType = button.dataset.tab;
            isAnimating3D = (tabType === '3d');
            
            console.log('Tab switched to:', tabType, 'isAnimating3D:', isAnimating3D);
            
            // 如果切换到3D标签页且场景未初始化，则初始化
            if (isAnimating3D && !scene) {
                setTimeout(() => {
                    init3D();
                    updateSliderValues3D(); // 初始化缓存值
                }, 100);
            }
        });
    });

    // 3D控制滑块事件监听
    const flockSize3DSlider = document.getElementById('flockSize3D');
    const alignment3DSlider = document.getElementById('alignment3D');
    const cohesion3DSlider = document.getElementById('cohesion3D');
    const separation3DSlider = document.getElementById('separation3D');

    // 更新控制值显示的函数 - 添加节流
    let updateThrottle3D = false;
    function updateControlValue3D(slider, value) {
        if (updateThrottle3D) return;
        updateThrottle3D = true;
        
        requestAnimationFrame(() => {
            const controlItem = slider.closest('.control-item');
            const valueDisplay = controlItem.querySelector('.value');
            if (valueDisplay) {
                valueDisplay.textContent = Number(value).toFixed(1);
            }
            updateThrottle3D = false;
        });
    }

    // 鸟群数量滑块
    if (flockSize3DSlider) {
        flockSize3DSlider.addEventListener('input', function() {
            const newSize = parseInt(this.value);
            const flockSizeValue = document.getElementById('flockSizeValue3D');
            if (flockSizeValue) {
                flockSizeValue.textContent = newSize;
            }

            // 只有在3D场景已初始化时才调整鸟群大小
            if (scene && flock3D) {
                if (newSize > flock3D.length) {
                    // 添加新的boids
                    while (flock3D.length < newSize) {
                        const boid = new Boid3D(
                            (Math.random() - 0.5) * 80,
                            (Math.random() - 0.5) * 80,
                            (Math.random() - 0.5) * 80
                        );
                        flock3D.push(boid);
                        scene.add(boid.getMesh());
                    }
                } else if (newSize < flock3D.length) {
                    // 移除多余的boids
                    while (flock3D.length > newSize) {
                        const boid = flock3D.pop();
                        scene.remove(boid.getMesh());
                        boid.dispose();
                    }
                }
                console.log('3D Flock size updated to:', flock3D.length);
            }
        });
    }

    // 其他控制滑块
    [alignment3DSlider, cohesion3DSlider, separation3DSlider].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', function() {
                updateControlValue3D(this, this.value);
                updateSliderValues3D(); // 更新缓存值
            });
            // 初始化显示值
            updateControlValue3D(slider, slider.value);
        }
    });

    // 初始化缓存值
    updateSliderValues3D();

    // 窗口大小调整事件监听
    window.addEventListener('resize', onWindowResize);

    // 启动3D动画循环
    requestAnimationFrame(animate3D);
});

// 清理3D资源的函数
function cleanup3D() {
    if (flock3D) {
        flock3D.forEach(boid => {
            if (scene && boid.getMesh()) {
                scene.remove(boid.getMesh());
            }
            boid.dispose();
        });
        flock3D = [];
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    if (controls) {
        controls.dispose();
    }
} 