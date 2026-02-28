import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const RAW_BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim();
const FORCE_AWS_IN_DEV = process.env.EXPO_PUBLIC_FORCE_AWS_BACKEND === 'true';
const PROD_URL = 'https://api.budgettracko.app';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const resolveDevUrl = () => {
    if (RAW_BACKEND_URL) {
        return normalizeBaseUrl(RAW_BACKEND_URL);
    }

    const constantsData = Constants as any;
    const hostUri: string | undefined =
        constantsData.expoConfig?.hostUri ||
        constantsData.manifest2?.extra?.expoGo?.debuggerHost ||
        constantsData.manifest?.debuggerHost;

    if (hostUri) {
        const host = hostUri.split(':')[0];
        if (host) {
            return `http://${host}:5000`;
        }
    }

    if (Constants.isDevice) {
        return PROD_URL;
    }

    return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

export const API_BASE_URL = normalizeBaseUrl(
    __DEV__
        ? (FORCE_AWS_IN_DEV ? PROD_URL : resolveDevUrl())
        : (RAW_BACKEND_URL || PROD_URL)
);

const api = axios.create({
    baseURL: API_BASE_URL,
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
