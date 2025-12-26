import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
	timeout: 10000, // 请求超时时间
	headers: {
		'Content-Type': 'application/json',
	},
});

// 请求拦截器
request.interceptors.request.use(
	(config) => {
		// 在发送请求之前做些什么
		// 例如：添加 token
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// 打印请求日志（开发环境）
		if (import.meta.env.DEV) {
			console.log('📤 Request:', {
				url: config.url,
				method: config.method,
				data: config.data,
				params: config.params,
			});
		}

		return config;
	},
	(error) => {
		// 对请求错误做些什么
		console.error('Request Error:', error);
		return Promise.reject(error);
	}
);

// 响应拦截器
request.interceptors.response.use(
	(response) => {
		// 对响应数据做点什么
		if (import.meta.env.DEV) {
			console.log('📥 Response:', {
				url: response.config.url,
				status: response.status,
				data: response.data,
			});
		}

		// 直接返回数据部分
		return response.data;
	},
	(error) => {
		// 对响应错误做点什么
		console.error('Response Error:', error);

		// 统一错误处理
		let errorMessage = '请求失败';

		if (error.response) {
			// 请求已发出，但服务器响应的状态码不在 2xx 范围内
			const { status, data } = error.response;

			switch (status) {
				case 400:
					errorMessage = data.message || '请求参数错误';
					break;
				case 401:
					errorMessage = '未授权，请重新登录';
					// 可以在这里执行登出操作
					// localStorage.removeItem('token');
					// window.location.href = '/login';
					break;
				case 403:
					errorMessage = '拒绝访问';
					break;
				case 404:
					errorMessage = data.message || '请求的资源不存在';
					break;
				case 500:
					errorMessage = '服务器内部错误';
					break;
				case 503:
					errorMessage = '服务不可用';
					break;
				default:
					errorMessage = data.message || `请求失败 (${status})`;
			}
		} else if (error.request) {
			// 请求已发出，但没有收到响应
			errorMessage = '网络错误，请检查您的网络连接';
		} else {
			// 在设置请求时触发了错误
			errorMessage = error.message || '请求配置错误';
		}

		// 创建一个统一的错误对象
		const errorObj = {
			message: errorMessage,
			status: error.response?.status,
			data: error.response?.data,
		};

		return Promise.reject(errorObj);
	}
);

export default request;
