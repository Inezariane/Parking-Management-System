import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  plate_number: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface Parking {
  id: string;
  user_id: string;
  car_number: string;
  slot_number: number;
  entry_time: string;
  exit_time: string | null;
}

interface ParkingWithUser extends Parking {
  User: {
    username: string;
    plate_number: string | null;
  };
}

interface Payment {
  id: string;
  user_id: string;
  parking_id: string;
  amount: number;
  status: 'pending' | 'completed';
  payment_time: string | null;
  Parking: {
    car_number: string;
    slot_number: number;
  };
  User: {
    username: string;
  };
}

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const registerUser = async (data: {
  username: string;
  password: string;
  role: 'user' | 'admin';
  plate_number?: string;
}): Promise<User> => {
  const response: AxiosResponse<{ user: User }> = await api.post('/api/auth/register', data);
  return response.data.user;
};

export const loginUser = async (data: { username: string; password: string }): Promise<AuthResponse> => {
  const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', data);
  return response.data;
};

export const getPendingPayments = async (token: string): Promise<Payment[]> => {
  const response: AxiosResponse<Payment[]> = await api.get('/api/payments/view', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const makePayment = async (token: string, payment_id: string): Promise<Payment> => {
  const response: AxiosResponse<Payment> = await api.post(
    '/api/payments/pay',
    { payment_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const registerParkingEntry = async (token: string, car_number: string): Promise<Parking> => {
  const response: AxiosResponse<Parking> = await api.post(
    '/api/parking/entry',
    { car_number },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const registerParkingExit = async (token: string, car_number: string): Promise<Parking & { amount: number }> => {
  const response: AxiosResponse<Parking & { amount: number }> = await api.post(
    '/api/parking/exit',
    { car_number },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getCurrentParkedUsers = async (token: string): Promise<ParkingWithUser[]> => {
  const response: AxiosResponse<ParkingWithUser[]> = await api.get('/api/parking/current', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAllPayments = async (token: string): Promise<Payment[]> => {
  const response: AxiosResponse<Payment[]> = await api.get('/api/payments/all', {
    headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
