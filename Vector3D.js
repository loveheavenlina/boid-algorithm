/**
 * Vector3D 类
 * 处理三维向量的数学运算
 * 用于3D鸟群算法中的位置、速度和加速度计算
 */
class Vector3D {
    /**
     * 构造函数
     * @param {number} x - X坐标分量
     * @param {number} y - Y坐标分量  
     * @param {number} z - Z坐标分量
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 向量加法
     * @param {Vector3D} vector - 要相加的向量
     * @returns {Vector3D} 新的向量结果
     */
    add(vector) {
        return new Vector3D(
            this.x + vector.x,
            this.y + vector.y,
            this.z + vector.z
        );
    }

    /**
     * 向量减法
     * @param {Vector3D} vector - 要相减的向量
     * @returns {Vector3D} 新的向量结果
     */
    sub(vector) {
        return new Vector3D(
            this.x - vector.x,
            this.y - vector.y,
            this.z - vector.z
        );
    }

    /**
     * 向量标量乘法
     * @param {number} scalar - 标量值
     * @returns {Vector3D} 新的向量结果
     */
    mult(scalar) {
        return new Vector3D(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    /**
     * 向量标量除法
     * @param {number} scalar - 标量值
     * @returns {Vector3D} 新的向量结果
     */
    div(scalar) {
        if (scalar === 0) {
            console.warn('Vector3D: Division by zero');
            return new Vector3D(0, 0, 0);
        }
        return new Vector3D(
            this.x / scalar,
            this.y / scalar,
            this.z / scalar
        );
    }

    /**
     * 计算向量的长度（模）
     * @returns {number} 向量长度
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * 向量归一化（单位化）
     * @returns {Vector3D} 归一化后的向量
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector3D(0, 0, 0);
        }
        return this.div(mag);
    }

    /**
     * 限制向量的最大长度
     * @param {number} max - 最大长度限制
     * @returns {Vector3D} 限制后的向量
     */
    limit(max) {
        const mag = this.magnitude();
        if (mag > max) {
            return this.normalize().mult(max);
        }
        return new Vector3D(this.x, this.y, this.z);
    }

    /**
     * 计算两个向量之间的距离
     * @param {Vector3D} vector - 另一个向量
     * @returns {number} 距离值
     */
    dist(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        const dz = this.z - vector.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * 计算向量的平方距离（避免开方运算，用于性能优化）
     * @param {Vector3D} vector - 另一个向量
     * @returns {number} 平方距离值
     */
    distSq(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        const dz = this.z - vector.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * 复制向量
     * @returns {Vector3D} 新的向量副本
     */
    copy() {
        return new Vector3D(this.x, this.y, this.z);
    }

    /**
     * 设置向量的分量值
     * @param {number} x - X坐标分量
     * @param {number} y - Y坐标分量
     * @param {number} z - Z坐标分量
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 静态方法：生成随机单位向量
     * @returns {Vector3D} 随机方向的单位向量
     */
    static random() {
        // 生成球面上的随机点
        const theta = Math.random() * 2 * Math.PI; // 水平角度
        const phi = Math.acos(2 * Math.random() - 1); // 垂直角度
        
        return new Vector3D(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        );
    }

    /**
     * 向量的字符串表示
     * @returns {string} 向量的字符串形式
     */
    toString() {
        return `Vector3D(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
} 