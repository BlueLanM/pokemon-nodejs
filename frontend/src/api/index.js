/**
 * API 统一导出
 * 方便统一管理和导入所有 API 模块
 */
import pokemonApi from './pokemon';

export { pokemonApi };

// 默认导出所有 API
export default {
  pokemon: pokemonApi,
};
