import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to access localhost, otherwise use localhost
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const PROD_URL = 'https://api.budgettracko.app';

const api = axios.create({
    baseURL: __DEV__ ? DEV_URL : PROD_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the token to the headers
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration or other global errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Potential token expiration - could trigger a logout or refresh
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
