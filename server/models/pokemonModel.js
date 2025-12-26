import { query } from "../config/database.js";

// 获取所有 Pokemon
export async function getAllPokemons() {
	const sql = "SELECT * FROM pokemons ORDER BY id";
	return await query(sql);
}

// 根据 ID 获取单个 Pokemon
export async function getPokemonById(id) {
	const sql = "SELECT * FROM pokemons WHERE id = ?";
	const results = await query(sql, [id]);
	return results[0];
}

// 创建新的 Pokemon
export async function createPokemon(pokemonData) {
	const { name, type, level, hp, attack, defense } = pokemonData;
	const sql = `
    INSERT INTO pokemons (name, type, level, hp, attack, defense)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
	const result = await query(sql, [name, type, level, hp, attack, defense]);
	return result.insertId;
}

// 更新 Pokemon
export async function updatePokemon(id, pokemonData) {
	const { name, type, level, hp, attack, defense } = pokemonData;
	const sql = `
    UPDATE pokemons 
    SET name = ?, type = ?, level = ?, hp = ?, attack = ?, defense = ?
    WHERE id = ?
  `;
	await query(sql, [name, type, level, hp, attack, defense, id]);
	return true;
}

// 删除 Pokemon
export async function deletePokemon(id) {
	const sql = "DELETE FROM pokemons WHERE id = ?";
	await query(sql, [id]);
	return true;
}