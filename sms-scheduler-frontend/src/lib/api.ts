import axios from 'axios';
import { Message } from '@/types/message';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(message);
  }
);

export interface ScheduleMessageRequest {
  phone_number: string;
  content: string;
  scheduled_at: string;
}

export interface UpdateMessageRequest {
  phone_number: string;
  content: string;
  scheduled_at: string;
}

export const scheduleMessage = async (data: ScheduleMessageRequest): Promise<Message> => {
  const response = await api.post('/schedule', data);
  return response.data.data;
};

export const getMessages = async (): Promise<Message[]> => {
  const response = await api.get('/messages');
  return response.data.messages;
};

export const updateMessage = async (id: number, data: UpdateMessageRequest): Promise<Message> => {
  const response = await api.put(`/messages/${id}`, data);
  return response.data.data;
};

export const deleteMessage = async (id: number): Promise<void> => {
  await api.delete(`/messages/${id}`);
};