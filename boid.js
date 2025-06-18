/**
 * Boid类 - 实现群体中单个个体的行为
 * 遵循三个基本规则：
 * 1. 分离(Separation) - 避免与邻近个体发生碰撞
 * 2. 对齐(Alignment) - 与邻近个体保持相同的运动方向
 * 3. 内聚(Cohesion) - 向邻近个体的平均位置靠拢
 */
class Boid {
    /**
     * 初始化一个新的Boid对象
     * @param {number} x - 初始X坐标
     * @param {number} y - 初始Y坐标
     */
    constructor(x, y) {
        this.position = new Vector(x, y);          // 位置向量
        this.velocity = Vector.random2D();         // 速度向量（随机初始方向）
        this.velocity.setMag(random(2, 4));        // 设置初始速度大小
        this.acceleration = new Vector(0, 0);      // 加速度向量
        this.maxForce = 0.2;                      // 最大转向力
        this.maxSpeed = 4;                        // 最大速度
    }

   /**
     * 处理画布边界 - 实现环绕效果
     * 当鸟飞出画布边界时，从对应的另一边重新进入
     * 这创造了一个无限空间的错觉，使模拟更加连续
     */
    edges() {
        // 处理水平方向的边界
        if (this.position.x > canvas.width) {
            // 如果超出右边界，从左边重新进入
            this.position.x = 0;
        } else if (this.position.x < 0) {
            // 如果超出左边界，从右边重新进入
            this.position.x = canvas.width;
        }
        
        // 处理垂直方向的边界
        if (this.position.y > canvas.height) {
            // 如果超出下边界，从上边重新进入
            this.position.y = 0;
        } else if (this.position.y < 0) {
            // 如果超出上边界，从下边重新进入
            this.position.y = canvas.height;
        }
    }    
    
   /**
     * 计算对齐力 - 使鸟的飞行方向与周围邻居的平均飞行方向一致
     * 这是鸟群三大核心行为之一
     * @param {Array<Boid>} boids - 所有鸟的数组
     * @returns {Vector} 计算得到的对齐转向力
     */
    align(boids) {
        // 对齐行为的感知范围（比分离行为的范围大，但比聚集行为的小）
        let perceptionRadius = 50;
        // 初始化转向力向量
        let steering = new Vector(0, 0);
        // 用于计算感知范围内的邻居数量
        let total = 0;

        // 遍历所有其他鸟
        for (let other of boids) {
            // 计算当前鸟与其他鸟的距离
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            // 如果是在感知范围内的其他鸟
            if (other != this && d < perceptionRadius) {
                // 累加其他鸟的速度向量（而不是位置）
                // 速度向量代表了飞行方向和速度
                steering.add(other.velocity);
                total++;
            }
        }

        // 如果周围有其他鸟
        if (total > 0) {
            // 计算周围鸟的平均速度向量
            steering.div(total);
            // 将速度调整为期望的最大速度，保持方向不变
            steering.setMag(this.maxSpeed);
            // 计算所需的转向力（期望速度 - 当前速度）
            steering.sub(this.velocity);
            // 限制转向力大小，确保平滑转向
            steering.limit(this.maxForce);
        }
        return steering;
    }    
    
    /**
     * 计算聚集力 - 使鸟群倾向于向群体中心移动
     * 这是鸟群三大核心行为之一
     * @param {Array<Boid>} boids - 所有鸟的数组
     * @returns {Vector} 计算得到的聚集转向力
     */
    cohesion(boids) {
        // 设置感知范围 - 只考虑这个距离内的其他鸟
        let perceptionRadius = 100;
        // 初始化转向力向量
        let steering = new Vector(0, 0);
        // 用于计算邻近鸟的数量
        let total = 0;

        // 遍历所有其他鸟
        for (let other of boids) {
            // 计算当前鸟与其他鸟的距离
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            // 如果是在感知范围内的其他鸟
            if (other != this && d < perceptionRadius) {
                // 累加其他鸟的位置（为了后面计算平均位置）
                steering.add(other.position);
                total++;
            }
        }

        // 如果周围有其他鸟
        if (total > 0) {
            // 计算周围鸟的平均位置（群体中心）
            steering.div(total);
            // 计算从当前位置指向群体中心的向量
            steering.sub(this.position);
            // 设置理想速度（方向指向群体中心，大小为最大速度）
            steering.setMag(this.maxSpeed);
            // 计算实际需要的转向力（理想速度 - 当前速度）
            steering.sub(this.velocity);
            // 限制转向力大小，防止转向过急
            steering.limit(this.maxForce);
        }
        return steering;
    }   
    
    /**
     * 分离行为 - 避免与其他boids距离太近
     * @param {Array<Boid>} boids - 所有boids的数组
     * @returns {Vector} 分离力的方向向量
     */
    separation(boids) {
        let perceptionRadius = 50;                 // 感知半径
        let steering = new Vector(0, 0);          // 转向力向量
        let total = 0;                            // 邻近boid计数        
        // 遍历所有其他鸟类，计算分离力
        for (let other of boids) {
            // 计算当前鸟与其他鸟之间的距离
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            // 如果不是自己且在感知范围内
            if (other != this && d < perceptionRadius) {
                // 计算从其他鸟指向当前鸟的向量（分离方向）
                let diff = Vector.sub(this.position, other.position);
                // 根据距离的平方调整分离力的大小（距离越近，力越大）
                diff.div(d * d);
                // 累加分离力
                steering.add(diff);
                total++;
            }
        }

        // 如果周围有其他鸟
        if (total > 0) {
            // 计算平均分离力
            steering.div(total);
            // 设置期望速度大小
            steering.setMag(this.maxSpeed);
            // 计算转向力（期望速度 - 当前速度）
            steering.sub(this.velocity);
            // 限制最大转向力
            steering.limit(this.maxForce);
        }
        return steering;
    }    
    
    /**
     * 计算群体行为 - 综合三种行为力的影响
     * @param {Array<Boid>} boids - 所有boids的数组
     */
    flock(boids) {
        // 获取三种行为的转向力
        let alignment = this.align(boids);        // 对齐力
        let cohesion = this.cohesion(boids);      // 内聚力
        let separation = this.separation(boids);   // 分离力

        // 根据滑块值调整各个力的权重
        alignment.mult(alignSlider.value);
        cohesion.mult(cohesionSlider.value);
        separation.mult(separationSlider.value);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    /**
     * 性能优化版本的群体行为计算
     * 使用缓存的滑块值和距离平方计算来提升性能
     * @param {Array<Boid>} boids - 邻近的boids数组（通过空间网格预过滤）
     * @param {number} alignWeight - 对齐权重
     * @param {number} cohesionWeight - 内聚权重 
     * @param {number} separationWeight - 分离权重
     */
    flockOptimized(boids, alignWeight, cohesionWeight, separationWeight) {
        // 一次遍历计算所有三种行为力，减少循环次数
        let alignSum = new Vector(0, 0);
        let cohesionSum = new Vector(0, 0);  
        let separationSum = new Vector(0, 0);
        
        let alignCount = 0;
        let cohesionCount = 0;
        let separationCount = 0;
        
        // 感知半径的平方，避免开方运算
        const alignRadiusSq = 50 * 50;
        const cohesionRadiusSq = 100 * 100;
        const separationRadiusSq = 50 * 50;
        
        // 一次遍历计算所有行为
        for (let other of boids) {
            if (other === this) continue;
            
            // 使用距离平方避免昂贵的开方运算
            const dx = this.position.x - other.position.x;
            const dy = this.position.y - other.position.y;
            const distSq = dx * dx + dy * dy;
            
            // 对齐行为
            if (distSq < alignRadiusSq) {
                alignSum.add(other.velocity);
                alignCount++;
            }
            
            // 内聚行为
            if (distSq < cohesionRadiusSq) {
                cohesionSum.add(other.position);
                cohesionCount++;
            }
            
            // 分离行为
            if (distSq < separationRadiusSq) {
                const diff = Vector.sub(this.position, other.position);
                diff.div(distSq); // 使用距离平方
                separationSum.add(diff);
                separationCount++;
            }
        }
        
        // 计算最终的转向力
        let alignment = new Vector(0, 0);
        if (alignCount > 0) {
            alignSum.div(alignCount);
            alignSum.setMag(this.maxSpeed);
            alignment = Vector.sub(alignSum, this.velocity);
            alignment.limit(this.maxForce);
        }
        
        let cohesion = new Vector(0, 0);
        if (cohesionCount > 0) {
            cohesionSum.div(cohesionCount);
            cohesionSum.sub(this.position);
            cohesionSum.setMag(this.maxSpeed);
            cohesion = Vector.sub(cohesionSum, this.velocity);
            cohesion.limit(this.maxForce);
        }
        
        let separation = new Vector(0, 0);
        if (separationCount > 0) {
            separationSum.div(separationCount);
            separationSum.setMag(this.maxSpeed);
            separation = Vector.sub(separationSum, this.velocity);
            separation.limit(this.maxForce);
        }
        
        // 应用权重并累加到加速度
        alignment.mult(alignWeight);
        cohesion.mult(cohesionWeight);
        separation.mult(separationWeight);
        
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }
    
    /**
     * 更新Boid的位置和速度
     */
    update() {
        this.position.add(this.velocity);         // 更新位置
        this.velocity.add(this.acceleration);     // 更新速度
        this.velocity.limit(this.maxSpeed);       // 限制最大速度
        this.acceleration.mult(0);                // 重置加速度
        this.edges();                            // 处理边界情况
    }

   /**
     * 在画布上绘制表示鸟的三角形
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
     */
    draw(ctx) {
        // 保存当前画布状态（变换矩阵等）
        ctx.save();
        // 将坐标系原点移动到鸟的当前位置
        ctx.translate(this.position.x, this.position.y);
        // 根据速度方向旋转坐标系
        // 加上 Math.PI/2 是因为三角形默认朝上，需要旋转90度使其朝向运动方向
        ctx.rotate(this.velocity.heading() + Math.PI / 2);
        
        // 开始绘制三角形路径
        ctx.beginPath();
        // 从头部顶点开始 (0, -10)
        ctx.moveTo(0, -10);
        // 绘制到左下角顶点 (-5, 10)
        ctx.lineTo(-5, 10);
        // 绘制到右下角顶点 (5, 10)
        ctx.lineTo(5, 10);
        // 闭合路径回到顶点
        ctx.closePath();
        
        // 设置填充颜色为蓝色
        ctx.fillStyle = '#3498db';
        // 填充三角形
        ctx.fill();
        // 恢复画布到之前保存的状态
        ctx.restore();
    }
}

/**
 * 二维向量类
 * 提供基本的向量运算功能，用于处理位置、速度和加速度等物理量
 */
class Vector {
    /**
     * 创建一个新的向量
     * @param {number} x - X分量
     * @param {number} y - Y分量
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 向量加法
     * @param {Vector} v - 要添加的向量
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    /**
     * 向量减法
     * @param {Vector} v - 要减去的向量
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    /**
     * 向量标量乘法
     * @param {number} n - 标量乘数
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
    }

    /**
     * 向量标量除法
     * @param {number} n - 标量除数
     */
    div(n) {
        this.x /= n;
        this.y /= n;
    }

    /**
     * 计算向量的模（长度）
     * @returns {number} 向量的模
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 设置向量的模，保持方向不变
     * @param {number} n - 目标长度
     */
    setMag(n) {
        let mag = this.mag();
        if (mag !== 0) {  // 防止除以零
            this.mult(n / mag);
        }
    }

    /**
     * 限制向量的最大模长
     * @param {number} max - 最大允许长度
     */
    limit(max) {
        let mag = this.mag();
        if (mag > max) {
            this.setMag(max);
        }
    }

    /**
     * 计算向量的方向角（弧度）
     * @returns {number} 向量的方向角（以弧度表示）
     */
    heading() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * 静态方法：向量减法
     * @param {Vector} v1 - 被减向量
     * @param {Vector} v2 - 减去的向量
     * @returns {Vector} 新的向量表示减法结果
     */
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * 静态方法：创建一个随机方向的单位向量
     * @returns {Vector} 新的随机方向单位向量
     */
    static random2D() {
        let angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
}

/**
 * 计算两点之间的欧几里得距离
 * @param {number} x1 - 第一个点的X坐标
 * @param {number} y1 - 第一个点的Y坐标
 * @param {number} x2 - 第二个点的X坐标
 * @param {number} y2 - 第二个点的Y坐标
 * @returns {number} 两点之间的距离
 */
function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/**
 * 生成指定范围内的随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 范围内的随机数
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}
