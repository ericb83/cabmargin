import axios from 'axios';
import type { 
  CalculateRequest, 
  CalculateResponse, 
  AuthResponse, 
  Load, 
  SaveLoadRequest,
  SubscriptionStatus,
  PricingInfo,
  CheckoutResponse,
  Report
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const calculateProfit = async (data: CalculateRequest): Promise<CalculateResponse> => {
  const response = await api.post<CalculateResponse>('/calculate', data);
  return response.data;
};

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { email, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const getLoads = async (): Promise<Load[]> => {
  const response = await api.get<Load[]>('/loads');
  return response.data;
};

export const saveLoad = async (data: SaveLoadRequest): Promise<Load> => {
  const response = await api.post<Load>('/loads', data);
  return response.data;
};

export const deleteLoad = async (id: number): Promise<void> => {
  await api.delete(`/loads/${id}`);
};

// Subscription APIs
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await api.get<SubscriptionStatus>('/subscription/status');
  return response.data;
};

export const getPricingInfo = async (): Promise<PricingInfo> => {
  const response = await api.get<PricingInfo>('/subscription/pricing');
  return response.data;
};

export const createCheckoutSession = async (priceId: string): Promise<CheckoutResponse> => {
  const response = await api.post<CheckoutResponse>('/subscription/create-checkout', { priceId });
  return response.data;
};

export const confirmCheckout = async (sessionId: string): Promise<SubscriptionStatus> => {
  const response = await api.post<SubscriptionStatus>('/subscription/confirm', { sessionId });
  return response.data;
};

export const createBillingPortalSession = async (): Promise<{ url: string }> => {
  const response = await api.post<{ url: string }>('/subscription/portal');
  return response.data;
};

export const cancelSubscription = async (): Promise<void> => {
  await api.post('/subscription/cancel');
};

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }
  return fallback;
}

// Reports APIs
export const getWeeklyReport = async (): Promise<Report> => {
  const response = await api.get<Report>('/reports/weekly');
  return response.data;
};

export const getMonthlyReport = async (): Promise<Report> => {
  const response = await api.get<Report>('/reports/monthly');
  return response.data;
};

export default api;
