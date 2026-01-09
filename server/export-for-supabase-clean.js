/* eslint-disable sort-keys */
import mysql from "mysql2/promise";
import fs from "fs";

// Railway MySQL 连接
const RAILWAY_CONFIG = {
	host: "caboose.proxy.rlwy.net",
	port: 35709,
	user: "root",
	password: "JoODzyujokcuSZRooKpCIAzOmTUNirIv",
	database: "railway",
	connectTimeout: 60000,
	timezone: "+00:00"
};

// MySQL 到 PostgreSQL 类型映射
const TYPE_MAP = {
	int: "INTEGER",
	"tinyint(1)": "BOOLEAN",
	tinyint: "SMALLINT",
	bigint: "BIGINT",
	varchar: "VARCHAR",
	text: "TEXT",
	longtext: "TEXT",
	mediumtext: "TEXT",
	datetime: "TIMESTAMP",
	timestamp: "TIMESTAMP",
	double: "DOUBLE PRECISION",
	float: "REAL",
	decimal: "NUMERIC"
};

function convertType(mysqlType) {
	const lower = mysqlType.toLowerCase();

	// 处理带括号的类型
	if (lower.includes("varchar")) {
		const match = mysqlType.match(/varchar\((\d+)\)/i);
		return match ? `VARCHAR(${match[1]})` : "VARCHAR(255)";
	}
	if (lower.includes("decimal")) {
		const match = mysqlType.match(/decimal\((\d+),(\d+)\)/i);
		return match ? `NUMERIC(${match[1]},${match[2]})` : "NUMERIC";
	}

	// 直接映射
	for (const [mysql, pg] of Object.entries(TYPE_MAP)) {
		if (lower.startsWith(mysql)) return pg;
	}

	return "TEXT"; // 默认
}

function escapeValue(value) {
	if (value === null || value === undefined) return "NULL";
	if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
	if (typeof value === "number") return value;
	if (value instanceof Date) {
		return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
	}
	if (typeof value === "string") {
		return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
	}
	if (Buffer.isBuffer(value)) {
		return `'\\x${value.toString("hex")}'`;
	}
	return `'${value}'`;
}

async function exportClean() {
	let connection;
	try {
		console.log("🔌 连接到 Railway MySQL...");
		connection = await mysql.createConnection(RAILWAY_CONFIG);
		console.log("✅ 连接成功！\n");

		const [tables] = await connection.query("SHOW TABLES");
		const tableNames = tables.map(t => Object.values(t)[0]);

		console.log(`📊 找到 ${tableNames.length} 个表\n`);

		let sql = "-- Railway → Supabase 干净导出\n";
		sql += `-- 生成时间: ${new Date().toISOString()}\n\n`;
		sql += "BEGIN;\n\n";

		// 处理每个表
		for (let i = 0; i < tableNames.length; i++) {
			const table = tableNames[i];
			console.log(`[${i + 1}/${tableNames.length}] 📦 ${table}`);

			try {
				// 获取列信息
				const [columns] = await connection.query(
					`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
					 FROM INFORMATION_SCHEMA.COLUMNS 
					 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? 
					 ORDER BY ORDINAL_POSITION`,
					[RAILWAY_CONFIG.database, table]
				);

				sql += `-- ==================== ${table} ====================\n`;
				sql += `DROP TABLE IF EXISTS "${table}" CASCADE;\n\n`;
				sql += `CREATE TABLE "${table}" (\n`;

				const columnDefs = [];
				let hasPrimaryKey = false;

				for (const col of columns) {
					let def = `  "${col.COLUMN_NAME}" `;

					// 类型转换
					let pgType = convertType(col.DATA_TYPE);

					// 处理长度
					if (col.CHARACTER_MAXIMUM_LENGTH && pgType === "VARCHAR") {
						pgType = `VARCHAR(${col.CHARACTER_MAXIMUM_LENGTH})`;
					}
					if (col.NUMERIC_PRECISION && pgType === "NUMERIC") {
						pgType = `NUMERIC(${col.NUMERIC_PRECISION},${col.NUMERIC_SCALE || 0})`;
					}

					// 自增字段特殊处理
					if (col.EXTRA && col.EXTRA.toLowerCase().includes("auto_increment")) {
						def += "SERIAL PRIMARY KEY";
						hasPrimaryKey = true;
					} else {
						def += pgType;

						// NULL/NOT NULL
						if (col.IS_NULLABLE === "NO") {
							def += " NOT NULL";
						}

						// DEFAULT
						if (col.COLUMN_DEFAULT !== null) {
							const defaultVal = col.COLUMN_DEFAULT;
							if (defaultVal === "CURRENT_TIMESTAMP" || defaultVal === "current_timestamp()") {
								def += " DEFAULT CURRENT_TIMESTAMP";
							} else if (!isNaN(defaultVal)) {
								def += ` DEFAULT ${defaultVal}`;
							} else {
								def += ` DEFAULT '${defaultVal}'`;
							}
						}
					}

					columnDefs.push(def);
				}

				sql += columnDefs.join(",\n") + "\n);\n\n";

				// 获取数据
				console.log("   ⏳ 读取数据...");
				const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
				const totalRows = countResult[0].count;

				console.log(`   📊 ${totalRows} 条记录`);

				if (totalRows > 0) {
					const batchSize = 500;
					let offset = 0;

					while (offset < totalRows) {
						const [rows] = await connection.query(
							`SELECT * FROM \`${table}\` LIMIT ${batchSize} OFFSET ${offset}`
						);

						if (!rows || rows.length === 0) break;

						const cols = Object.keys(rows[0]);
						const colList = cols.map(c => `"${c}"`).join(", ");

						for (const row of rows) {
							const values = cols.map(col => escapeValue(row[col])).join(", ");
							sql += `INSERT INTO "${table}" (${colList}) VALUES (${values});\n`;
						}

						offset += batchSize;
						const progress = Math.min(offset, totalRows);
						if (progress < totalRows) {
							console.log(`   ⏳ ${progress}/${totalRows} (${((progress / totalRows) * 100).toFixed(0)}%)`);
						}
					}

					sql += "\n";
					console.log("   ✅ 完成");
				}
			} catch (tableError) {
				console.error(`   ❌ 失败: ${tableError.message}`);
				sql += `-- 错误: ${table} - ${tableError.message}\n\n`;
			}

			console.log("");
		}

		// 重置序列
		sql += "-- 重置自增序列\n";
		for (const table of tableNames) {
			sql += `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), true);\n`;
		}

		sql += "\nCOMMIT;\n";

		// 保存
		const filename = `supabase_clean_${Date.now()}.sql`;
		fs.writeFileSync(filename, sql);

		console.log("=".repeat(60));
		console.log("✅ 导出完成！");
		console.log(`📁 文件: ${filename}`);
		console.log(`📝 大小: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
		console.log("=".repeat(60));
		console.log("\n📌 这是用 PostgreSQL 原生语法生成的干净文件");
		console.log("📌 直接在 Supabase SQL Editor 执行即可\n");

		await connection.end();
	} catch (error) {
		console.error("\n❌ 导出失败:", error.message);
		if (connection) await connection.end();
	}
}

console.log("🚀 Railway → Supabase 干净导出工具\n");
exportClean();