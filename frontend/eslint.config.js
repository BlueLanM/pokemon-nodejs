import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist"]),
	{
		extends: [
			js.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite
		],
		files: ["**/*.{js,jsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: "latest",
				sourceType: "module"
			}
		},
		rules: {
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
			'react/react-in-jsx-scope': 'off', // 关闭 React 必须在作用域内的检查
			'react/jsx-uses-react': 'off', // 关闭 JSX 使用 React 的检查
			'indent': ['error', 'tab', { SwitchCase: 4 }], // 使用制表符缩进
			'no-tabs': 'off', // 允许使用制表符
		}
	}
]);