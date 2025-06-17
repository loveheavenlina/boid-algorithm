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
     * 处理边界情况 - 当Boid超出画布边界时从对面出现
     */
    edges() {
        if (this.position.x > canvas.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = canvas.width;
        }
        if (this.position.y > canvas.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = canvas.height;
        }
    }    
    
    /**
     * 对齐行为 - 计算周围boids的平均速度方向
     * @param {Array<Boid>} boids - 所有boids的数组
     * @returns {Vector} 对齐力的方向向量
     */
    align(boids) {
        let perceptionRadius = 50;                 // 感知半径
        let steering = new Vector(0, 0);          // 转向力向量
        let total = 0;                            // 邻近boid计数

        for (let other of boids) {
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }    
    
    /**
     * 内聚行为 - 向周围boids的平均位置移动
     * @param {Array<Boid>} boids - 所有boids的数组
     * @returns {Vector} 内聚力的方向向量
     */
    cohesion(boids) {
        let perceptionRadius = 100;                // 感知半径
        let steering = new Vector(0, 0);          // 转向力向量
        let total = 0;                            // 邻近boid计数

        for (let other of boids) {
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
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

        for (let other of boids) {
            let d = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other != this && d < perceptionRadius) {
                let diff = Vector.sub(this.position, other.position);
                diff.div(d * d);
                steering.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
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
     * 绘制Boid
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.velocity.heading() + Math.PI / 2);
        
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-5, 10);
        ctx.lineTo(5, 10);
        ctx.closePath();
        
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 二维向量类 - 用于处理位置、速度和加速度的计算
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

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
    }

    div(n) {
        this.x /= n;
        this.y /= n;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setMag(n) {
        let mag = this.mag();
        if (mag !== 0) {
            this.mult(n / mag);
        }
    }

    limit(max) {
        let mag = this.mag();
        if (mag > max) {
            this.setMag(max);
        }
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

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
