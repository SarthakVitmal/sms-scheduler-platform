'use client';

import { useState } from 'react';
import { Clock, Phone, MessageSquare, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Message } from '@/types/message';
import { deleteMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import EditMessageModal from './EditMessageModal';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onMessageUpdated: () => void;
  onMessageDeleted: () => void;
}

export default function MessageList({
  messages,
  loading,
  onMessageUpdated,
  onMessageDeleted,
}: MessageListProps) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteMessage(id);
      toast.success('Message deleted successfully!');
      onMessageDeleted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No messages scheduled yet</p>
        <p className="text-gray-400">Schedule your first message to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(message.status)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {message.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{message.phone_number}</span>
              </div>
              
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-800">{message.content}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Scheduled for: {formatDate(message.scheduled_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setEditingMessage(message)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit message"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDelete(message.id)}
                disabled={deletingId === message.id}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete message"
              >
                {deletingId === message.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onMessageUpdated={() => {
            setEditingMessage(null);
            onMessageUpdated();
          }}
        />
      )}
    </div>
  );
}
