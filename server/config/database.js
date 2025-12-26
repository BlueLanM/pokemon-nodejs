import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 创建数据库连接池
// 支持 Railway 的环境变量命名
const pool = mysql.createPool({
	connectionLimit: 10,
	database: process.env.MYSQLDATABASE || process.env.DB_NAME || "pokemon",
	enableKeepAlive: true,
	host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
	keepAliveInitialDelay: 0,
	password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
	port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
	queueLimit: 0,
	user: process.env.MYSQLUSER || process.env.DB_USER || "root",
	waitForConnections: true
});

// 初始化数据库表
export async function initializeDatabase() {
	try {
		const connection = await pool.getConnection();
		
		// 创建 pokemons 表
		const createTableSQL = `
			CREATE TABLE IF NOT EXISTS pokemons (
				id INT PRIMARY KEY AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				type VARCHAR(100),
				hp INT,
				attack INT,
				defense INT,
				speed INT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`;
		
		await connection.execute(createTableSQL);
		console.log("✅ 数据表初始化成功!");
		
		// 检查是否有数据，如果没有则插入示例数据
		const [rows] = await connection.execute('SELECT COUNT(*) as count FROM pokemons');
		if (rows[0].count === 0) {
			const insertSQL = `
				INSERT INTO pokemons (name, type, hp, attack, defense, speed) VALUES
				('皮卡丘', '电', 35, 55, 40, 90),
				('妙蛙种子', '草/毒', 45, 49, 49, 45),
				('小火龙', '火', 39, 52, 43, 65),
				('杰尼龟', '水', 44, 48, 65, 43)
			`;
			await connection.execute(insertSQL);
			console.log("✅ 示例数据插入成功!");
		}
		
		connection.release();
		return true;
	} catch (error) {
		console.error("❌ 数据库初始化失败:", error.message);
		throw error;
	}
}

// 测试数据库连接
export async function testConnection() {
	try {
		const connection = await pool.getConnection();
		console.log("✅ MySQL 数据库连接成功!");
		const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || "pokemon";
		console.log(`📦 数据库: ${dbName}`);
		connection.release();
		
		// 自动初始化数据库表
		await initializeDatabase();
		
		return true;
	} catch (error) {
		console.error("❌ MySQL 数据库连接失败:", error.message);
		return false;
	}
}

// 执行查询
export async function query(sql, params) {
	try {
		const [results] = await pool.execute(sql, params);
		return results;
	} catch (error) {
		console.error("数据库查询错误:", error);
		throw error;
	}
}

export default pool;