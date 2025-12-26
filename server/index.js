import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import pokemonRoutes from "./routes/pokemonRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 配置 - 允许 GitHub Pages 访问
const corsOptions = {
	credentials: true,
	optionsSuccessStatus: 200,
	origin: process.env.CORS_ORIGIN || "*"
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 测试路由
app.get("/api", (req, res) => {
	res.json({ message: "Hello from Pokemon API!" });
});

// Pokemon API 路由
app.use("/api", pokemonRoutes);

app.listen(PORT, async() => {
	console.log(`🚀 Server running on port ${PORT}`);
	// 测试数据库连接
	await testConnection();
});