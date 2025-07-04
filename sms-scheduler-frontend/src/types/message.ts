export interface Message {
  id: number;
  phone_number: string;
  content: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
}