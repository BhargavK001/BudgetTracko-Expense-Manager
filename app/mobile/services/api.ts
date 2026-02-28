import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Use 10.0.2.2 for Android emulator to access localhost, otherwise use localhost
const EXPLICIT_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const PROD_URL = 'https://api.budgettracko.app';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const resolveDevUrl = () => {
    if (EXPLICIT_API_URL) {
        return normalizeBaseUrl(EXPLICIT_API_URL);
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

export const API_BASE_URL = __DEV__ ? resolveDevUrl() : PROD_URL;

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
