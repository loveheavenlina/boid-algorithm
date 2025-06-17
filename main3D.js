/**
 * 3D鸟群算法主程序
 * 使用Three.js实现3D可视化效果
 */

let isAnimating3D = false; // 控制3D动画循环的标志
let scene, camera, renderer, controls;
let flock3D = [];

// 初始化3D场景
function init3D() {
    const canvas = document.getElementById('boidCanvas3D');
    if (!canvas) {
        console.error('3D Canvas element not found');
        return;
    }

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // 深灰色背景

    // 创建相机
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 80);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 创建轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

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

    // 初始化3D鸟群
    initFlock3D();

    console.log('3D scene initialized with', flock3D.length, 'boids');
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
            (Math.random() - 0.5) * 80, // X: -40 到 40
            (Math.random() - 0.5) * 80, // Y: -40 到 40
            (Math.random() - 0.5) * 80  // Z: -40 到 40
        );
        flock3D.push(boid);
        scene.add(boid.getMesh());
    }
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

// 3D动画循环
function animate3D() {
    requestAnimationFrame(animate3D);

    // 只在3D标签页激活时运行动画
    if (!isAnimating3D) {
        return;
    }

    // 更新轨道控制器
    if (controls) {
        controls.update();
    }

    // 更新所有boids
    for (let boid of flock3D) {
        boid.flock(flock3D);
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
                // 稍微延迟以确保DOM已完全加载
                setTimeout(() => {
                    init3D();
                }, 100);
            }
        });
    });

    // 3D控制滑块事件监听
    const flockSize3DSlider = document.getElementById('flockSize3D');
    const alignment3DSlider = document.getElementById('alignment3D');
    const cohesion3DSlider = document.getElementById('cohesion3D');
    const separation3DSlider = document.getElementById('separation3D');

    // 更新控制值显示的函数
    function updateControlValue3D(slider, value) {
        const controlItem = slider.closest('.control-item');
        const valueDisplay = controlItem.querySelector('.value');
        if (valueDisplay) {
            valueDisplay.textContent = Number(value).toFixed(1);
        }
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
            });
            // 初始化显示值
            updateControlValue3D(slider, slider.value);
        }
    });

    // 窗口大小调整事件监听
    window.addEventListener('resize', onWindowResize);

    // 启动3D动画循环
    animate3D();
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