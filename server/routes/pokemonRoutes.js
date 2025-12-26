import express from "express";
import * as pokemonController from "../controllers/pokemonController.js";

const router = express.Router();

// Pokemon 路由
router.get("/pokemons", pokemonController.getPokemons);
router.get("/pokemons/:id", pokemonController.getPokemon);
router.post("/pokemons", pokemonController.createPokemon);
router.put("/pokemons/:id", pokemonController.updatePokemon);
router.delete("/pokemons/:id", pokemonController.deletePokemon);

export default router;