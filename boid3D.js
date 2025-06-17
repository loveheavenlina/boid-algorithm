/**
 * Boid3D 类
 * 表示3D空间中的一个鸟类个体
 * 实现群体行为：对齐、内聚、分离
 */
class Boid3D {
    /**
     * 构造函数
     * @param {number} x - 初始X坐标
     * @param {number} y - 初始Y坐标
     * @param {number} z - 初始Z坐标
     */
    constructor(x, y, z) {
        // 位置向量
        this.position = new Vector3D(x, y, z);
        
        // 速度向量 - 随机初始方向
        this.velocity = Vector3D.random().mult(Math.random() * 2 + 1);
        
        // 加速度向量
        this.acceleration = new Vector3D(0, 0, 0);
        
        // 运动参数
        this.maxSpeed = 2;      // 最大速度
        this.maxForce = 0.03;   // 最大转向力
        
        // 感知半径
        this.perceptionRadius = 25;
        
        // 创建3D几何体和材质
        this.geometry = new THREE.ConeGeometry(0.5, 2, 4);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        // 设置初始位置
        this.mesh.position.set(x, y, z);
    }

    /**
     * 群体行为主函数
     * 整合对齐、内聚、分离三种行为
     * @param {Array} boids - 整个群体的数组
     */
    flock(boids) {
        // 计算三种基本行为力
        let alignment = this.align(boids);      // 对齐行为
        let cohesion = this.cohesion(boids);    // 内聚行为
        let separation = this.separation(boids); // 分离行为

        // 获取滑块控制值并应用权重
        const alignWeight = parseFloat(document.getElementById('alignment3D').value);
        const cohesionWeight = parseFloat(document.getElementById('cohesion3D').value);
        const separationWeight = parseFloat(document.getElementById('separation3D').value);

        // 应用权重
        alignment = alignment.mult(alignWeight);
        cohesion = cohesion.mult(cohesionWeight);
        separation = separation.mult(separationWeight);

        // 将所有力加到加速度上
        this.acceleration = this.acceleration.add(alignment);
        this.acceleration = this.acceleration.add(cohesion);
        this.acceleration = this.acceleration.add(separation);
    }

    /**
     * 对齐行为 - 与邻近个体保持相同方向
     * @param {Array} boids - 群体数组
     * @returns {Vector3D} 对齐力向量
     */
    align(boids) {
        let steering = new Vector3D(0, 0, 0);
        let total = 0;

        // 遍历所有boid
        for (let other of boids) {
            let distance = this.position.dist(other.position);
            
            // 如果在感知范围内且不是自己
            if (distance > 0 && distance < this.perceptionRadius) {
                steering = steering.add(other.velocity);
                total++;
            }
        }

        // 如果找到了邻居
        if (total > 0) {
            // 计算平均方向
            steering = steering.div(total);
            // 归一化并设置为最大速度
            steering = steering.normalize().mult(this.maxSpeed);
            // 计算转向力
            steering = steering.sub(this.velocity);
            steering = steering.limit(this.maxForce);
        }

        return steering;
    }

    /**
     * 内聚行为 - 向邻近个体的中心移动
     * @param {Array} boids - 群体数组
     * @returns {Vector3D} 内聚力向量
     */
    cohesion(boids) {
        let center = new Vector3D(0, 0, 0);
        let total = 0;

        // 计算邻近个体的质心
        for (let other of boids) {
            let distance = this.position.dist(other.position);
            
            if (distance > 0 && distance < this.perceptionRadius) {
                center = center.add(other.position);
                total++;
            }
        }

        // 如果找到了邻居
        if (total > 0) {
            // 计算质心位置
            center = center.div(total);
            // 计算朝向质心的向量
            return this.seek(center);
        }

        return new Vector3D(0, 0, 0);
    }

    /**
     * 分离行为 - 避免与其他个体过于接近
     * @param {Array} boids - 群体数组
     * @returns {Vector3D} 分离力向量
     */
    separation(boids) {
        let steering = new Vector3D(0, 0, 0);
        let total = 0;

        // 遍历所有boid
        for (let other of boids) {
            let distance = this.position.dist(other.position);
            
            // 如果在感知范围内且不是自己
            if (distance > 0 && distance < this.perceptionRadius) {
                // 计算远离的方向向量
                let diff = this.position.sub(other.position);
                diff = diff.div(distance); // 距离越近，影响越大
                steering = steering.add(diff);
                total++;
            }
        }

        // 如果找到了邻居
        if (total > 0) {
            // 计算平均远离方向
            steering = steering.div(total);
            // 归一化并设置速度
            steering = steering.normalize().mult(this.maxSpeed);
            // 计算转向力
            steering = steering.sub(this.velocity);
            steering = steering.limit(this.maxForce);
        }

        return steering;
    }

    /**
     * 寻求目标的行为
     * @param {Vector3D} target - 目标位置
     * @returns {Vector3D} 寻求力向量
     */
    seek(target) {
        // 计算到目标的向量
        let desired = target.sub(this.position);
        
        // 归一化并设置为最大速度
        desired = desired.normalize().mult(this.maxSpeed);
        
        // 计算转向力
        let steering = desired.sub(this.velocity);
        steering = steering.limit(this.maxForce);
        
        return steering;
    }

    /**
     * 更新boid的位置和速度
     */
    update() {
        // 更新速度
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxSpeed);
        
        // 更新位置
        this.position = this.position.add(this.velocity);
        
        // 重置加速度
        this.acceleration = new Vector3D(0, 0, 0);
        
        // 边界处理 - 环绕效果
        this.wrapAround();
        
        // 更新3D网格位置
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // 使boid面向运动方向
        if (this.velocity.magnitude() > 0) {
            const direction = this.velocity.normalize();
            this.mesh.lookAt(
                this.position.x + direction.x,
                this.position.y + direction.y,
                this.position.z + direction.z
            );
        }
    }

    /**
     * 边界处理 - 当boid超出边界时从另一侧出现
     */
    wrapAround() {
        const bounds = 50; // 3D空间边界

        if (this.position.x > bounds) this.position.x = -bounds;
        if (this.position.x < -bounds) this.position.x = bounds;
        if (this.position.y > bounds) this.position.y = -bounds;
        if (this.position.y < -bounds) this.position.y = bounds;
        if (this.position.z > bounds) this.position.z = -bounds;
        if (this.position.z < -bounds) this.position.z = bounds;
    }

    /**
     * 获取3D网格对象
     * @returns {THREE.Mesh} Three.js网格对象
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * 销毁boid并清理资源
     */
    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
} 