-- Pokemon 数据库初始化脚本
-- 在 MySQL Workbench 中执行此脚本来创建数据库和表

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS pokemon
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE pokemon;

-- 3. 创建 pokemons 表
CREATE TABLE IF NOT EXISTS pokemons (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Pokemon ID',
  name VARCHAR(100) NOT NULL COMMENT 'Pokemon 名称',
  type VARCHAR(50) NOT NULL COMMENT 'Pokemon 属性',
  level INT DEFAULT 1 COMMENT 'Pokemon 等级',
  hp INT DEFAULT 100 COMMENT '生命值',
  attack INT DEFAULT 50 COMMENT '攻击力',
  defense INT DEFAULT 50 COMMENT '防御力',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_name (name),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pokemon 信息表';

-- 4. 插入示例数据
INSERT INTO pokemons (name, type, level, hp, attack, defense) VALUES
('皮卡丘', '电', 25, 120, 55, 40),
('妙蛙种子', '草/毒', 18, 150, 49, 49),
('小火龙', '火', 20, 140, 52, 43),
('杰尼龟', '水', 22, 135, 48, 65),
('比比鸟', '飞行', 30, 125, 60, 45),
('穿山鼠', '地面', 15, 110, 50, 55);

-- 5. 查询所有 Pokemon
SELECT * FROM pokemons ORDER BY id;

-- 6. 显示表结构
DESCRIBE pokemons;
