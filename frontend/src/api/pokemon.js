import request from '../utils/request';

/**
 * Pokemon API 接口
 */
const pokemonApi = {
	/**
	 * 获取所有宝可梦列表
	 * @param {Object} params - 查询参数
	 * @param {number} params.page - 页码
	 * @param {number} params.limit - 每页数量
	 * @param {string} params.search - 搜索关键词
	 * @returns {Promise}
	 */
	getPokemons(params = {}) {
		return request({
			url: '/pokemons',
			method: 'GET',
			params,
		});
	},

	/**
	 * 根据 ID 获取单个宝可梦
	 * @param {number|string} id - 宝可梦 ID
	 * @returns {Promise}
	 */
	getPokemon(id) {
		return request({
			url: `/pokemons/${id}`,
			method: 'GET',
		});
	},

	/**
	 * 创建新的宝可梦
	 * @param {Object} data - 宝可梦数据
	 * @param {string} data.name - 名称
	 * @param {string} data.type - 类型
	 * @param {number} data.hp - 生命值
	 * @param {number} data.attack - 攻击力
	 * @param {number} data.defense - 防御力
	 * @param {number} data.speed - 速度
	 * @returns {Promise}
	 */
	createPokemon(data) {
		return request({
			url: '/pokemons',
			method: 'POST',
			data,
		});
	},

	/**
	 * 更新宝可梦信息
	 * @param {number|string} id - 宝可梦 ID
	 * @param {Object} data - 要更新的数据
	 * @returns {Promise}
	 */
	updatePokemon(id, data) {
		return request({
			url: `/pokemons/${id}`,
			method: 'PUT',
			data,
		});
	},

	/**
	 * 删除宝可梦
	 * @param {number|string} id - 宝可梦 ID
	 * @returns {Promise}
	 */
	deletePokemon(id) {
		return request({
			url: `/pokemons/${id}`,
			method: 'DELETE',
		});
	},
};

export default pokemonApi;
