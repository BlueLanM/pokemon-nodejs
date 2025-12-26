import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
	connectionLimit: 10,
	database: process.env.DB_NAME || "pokemon",
	enableKeepAlive: true,
	host: process.env.DB_HOST || "localhost",
	keepAliveInitialDelay: 0,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 3306,
	queueLimit: 0,
	user: process.env.DB_USER || "root",
	waitForConnections: true
});

// 测试数据库连接
export async function testConnection() {
	try {
		const connection = await pool.getConnection();
		console.log("✅ MySQL 数据库连接成功!");
		console.log(`📦 数据库: ${process.env.DB_NAME}`);
		connection.release();
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