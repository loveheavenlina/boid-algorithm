/**
 * 性能监控系统
 * 用于实时监控鸟群算法模拟器的性能指标
 */
class PerformanceMonitor {
    constructor() {
        this.isVisible = true; // 默认显示
        this.lastUpdateTime = 0;
        this.frameCount = 0;
        this.lastFPSTime = Date.now();
        this.currentFPS = 0;
        this.renderStartTime = 0;
        this.renderTime = 0;
        this.averageRenderTime = 0;
        this.renderTimes = [];
        
        this.initializeElements();
        this.startMonitoring();
        this.updateToggleButton();
    }
    
    initializeElements() {
        this.panel = document.getElementById('performancePanel');
        this.fpsDisplay = document.getElementById('fps-display');
        this.activeModeDisplay = document.getElementById('active-mode');
        this.flockCountDisplay = document.getElementById('flock-count');
        this.memoryUsageDisplay = document.getElementById('memory-usage');
        this.renderTimeDisplay = document.getElementById('render-time');
        this.spatialCellsDisplay = document.getElementById('spatial-cells');
        this.optimizationStatusDisplay = document.getElementById('optimization-status');
        
        // 提示元素
        this.tipFPS = document.getElementById('tip-fps');
        this.tipMemory = document.getElementById('tip-memory');
        this.tipRender = document.getElementById('tip-render');
    }
    
    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
        }, 500); // 每半秒更新一次
        
        // 实时FPS监控
        this.monitorFPS();
    }
    
    monitorFPS() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.lastFPSTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSTime = now;
            
            if (this.fpsDisplay) {
                this.fpsDisplay.textContent = this.currentFPS;
                
                // 重置样式
                this.fpsDisplay.parentElement.className = 'metric';
                
                if (this.currentFPS < 30) {
                    this.fpsDisplay.parentElement.className += ' error';
                    this.tipFPS.className = 'tip active';
                } else if (this.currentFPS < 50) {
                    this.fpsDisplay.parentElement.className += ' warning';
                    this.tipFPS.className = 'tip';
                } else {
                    this.tipFPS.className = 'tip';
                }
            }
        }
        
        requestAnimationFrame(() => this.monitorFPS());
    }
    
    updateMetrics() {
        if (!this.isVisible) return;
        
        // 更新活跃模式
        if (this.activeModeDisplay) {
            const activeMode = (typeof isAnimating2D !== 'undefined' && isAnimating2D) ? '2D' : 
                             (typeof isAnimating3D !== 'undefined' && isAnimating3D) ? '3D' : 
                             'None';
            this.activeModeDisplay.textContent = activeMode;
        }
        
        // 更新鸟群数量
        if (this.flockCountDisplay) {
            let flockSize = 0;
            if (typeof isAnimating2D !== 'undefined' && isAnimating2D && typeof flock !== 'undefined') {
                flockSize = flock.length;
            } else if (typeof isAnimating3D !== 'undefined' && isAnimating3D && typeof flock3D !== 'undefined') {
                flockSize = flock3D.length;
            }
            this.flockCountDisplay.textContent = flockSize;
        }
        
        // 更新内存使用（如果支持）
        if (this.memoryUsageDisplay) {
            if (performance.memory) {
                const usedMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                const totalMB = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
                this.memoryUsageDisplay.textContent = `${usedMB}/${totalMB} MB`;
                
                // 重置样式
                this.memoryUsageDisplay.parentElement.className = 'metric';
                
                const usage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
                if (usage > 0.8) {
                    this.memoryUsageDisplay.parentElement.className += ' error';
                    this.tipMemory.className = 'tip active';
                } else if (usage > 0.6) {
                    this.memoryUsageDisplay.parentElement.className += ' warning';
                    this.tipMemory.className = 'tip';
                } else {
                    this.tipMemory.className = 'tip';
                }
            } else {
                this.memoryUsageDisplay.textContent = '不支持';
            }
        }
        
        // 更新渲染时间
        if (this.renderTimeDisplay) {
            this.renderTimeDisplay.textContent = this.averageRenderTime.toFixed(1) + 'ms';
            
            // 重置样式
            this.renderTimeDisplay.parentElement.className = 'metric';
            
            if (this.averageRenderTime > 16) {
                this.renderTimeDisplay.parentElement.className += ' warning';
                this.tipRender.className = 'tip active';
            } else if (this.averageRenderTime > 10) {
                this.renderTimeDisplay.parentElement.className += ' warning';
                this.tipRender.className = 'tip';
            } else {
                this.tipRender.className = 'tip';
            }
        }
        
        // 更新空间网格信息
        if (this.spatialCellsDisplay) {
            let cellInfo = 'N/A';
            if (typeof isAnimating2D !== 'undefined' && isAnimating2D && typeof spatialGrid !== 'undefined') {
                cellInfo = `${spatialGrid.cols}×${spatialGrid.rows}`;
            } else if (typeof isAnimating3D !== 'undefined' && isAnimating3D && typeof spatialGrid3D !== 'undefined') {
                cellInfo = `${spatialGrid3D.cols}×${spatialGrid3D.rows}×${spatialGrid3D.layers}`;
            }
            this.spatialCellsDisplay.textContent = cellInfo;
        }
        
        // 更新优化状态
        if (this.optimizationStatusDisplay) {
            const hasOptimizations = (typeof spatialGrid !== 'undefined') || (typeof spatialGrid3D !== 'undefined');
            this.optimizationStatusDisplay.textContent = hasOptimizations ? '✅ 已启用' : '❌ 未启用';
        }
    }
    
    startRenderTimer() {
        this.renderStartTime = performance.now();
    }
    
    endRenderTimer() {
        this.renderTime = performance.now() - this.renderStartTime;
        
        // 计算平均渲染时间（取最近10帧的平均值）
        this.renderTimes.push(this.renderTime);
        if (this.renderTimes.length > 10) {
            this.renderTimes.shift();
        }
        
        this.averageRenderTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.panel) {
            this.panel.className = this.isVisible ? 'performance-panel' : 'performance-panel hidden';
        }
        
        this.updateToggleButton();
        
        if (this.isVisible) {
            this.updateMetrics();
        }
    }
    
    updateToggleButton() {
        const button = document.querySelector('.performance-toggle');
        if (button) {
            button.textContent = this.isVisible ? '隐藏监控' : '显示监控';
        }
    }
}

// 全局性能监控实例
let performanceMonitor;

// 切换性能面板的函数
function togglePerformancePanel() {
    if (!performanceMonitor) {
        performanceMonitor = new PerformanceMonitor();
    } else {
        performanceMonitor.toggle();
    }
}

// 在DOM加载完成后立即初始化性能监控
document.addEventListener('DOMContentLoaded', () => {
    // 立即创建性能监控实例
    performanceMonitor = new PerformanceMonitor();
    
    // 导出到全局作用域
    window.performanceMonitor = performanceMonitor;
});

// 导出性能监控器供其他脚本使用
window.PerformanceMonitor = PerformanceMonitor; 