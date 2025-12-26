import * as PokemonModel from "../models/pokemonModel.js";

// 获取所有 Pokemon
export async function getPokemons(req, res) {
	try {
		const pokemons = await PokemonModel.getAllPokemons();
		res.json({
			data: pokemons,
			success: true
		});
	} catch (error) {
		console.error("获取 Pokemon 列表失败:", error);
		res.status(500).json({
			error: error.message,
			message: "获取 Pokemon 列表失败",
			success: false
		});
	}
}

// 获取单个 Pokemon
export async function getPokemon(req, res) {
	try {
		const { id } = req.params;
		const pokemon = await PokemonModel.getPokemonById(id);

		if (!pokemon) {
			return res.status(404).json({
				message: "Pokemon 不存在",
				success: false
			});
		}

		res.json({
			data: pokemon,
			success: true
		});
	} catch (error) {
		console.error("获取 Pokemon 失败:", error);
		res.status(500).json({
			error: error.message,
			message: "获取 Pokemon 失败",
			success: false
		});
	}
}

// 创建 Pokemon
export async function createPokemon(req, res) {
	try {
		const pokemonData = req.body;
		const insertId = await PokemonModel.createPokemon(pokemonData);

		res.status(201).json({
			data: { id: insertId, ...pokemonData },
			message: "Pokemon 创建成功",
			success: true
		});
	} catch (error) {
		console.error("创建 Pokemon 失败:", error);
		res.status(500).json({
			error: error.message,
			message: "创建 Pokemon 失败",
			success: false
		});
	}
}

// 更新 Pokemon
export async function updatePokemon(req, res) {
	try {
		const { id } = req.params;
		const pokemonData = req.body;

		await PokemonModel.updatePokemon(id, pokemonData);

		res.json({
			data: { id, ...pokemonData },
			message: "Pokemon 更新成功",
			success: true
		});
	} catch (error) {
		console.error("更新 Pokemon 失败:", error);
		res.status(500).json({
			error: error.message,
			message: "更新 Pokemon 失败",
			success: false
		});
	}
}

// 删除 Pokemon
export async function deletePokemon(req, res) {
	try {
		const { id } = req.params;
		await PokemonModel.deletePokemon(id);

		res.json({
			message: "Pokemon 删除成功",
			success: true
		});
	} catch (error) {
		console.error("删除 Pokemon 失败:", error);
		res.status(500).json({
			error: error.message,
			message: "删除 Pokemon 失败",
			success: false
		});
	}
}