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
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium capitalize';
    
    switch (status) {
      case 'sent':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 flex items-center gap-1`}>
            <CheckCircle className="w-3 h-3" />
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 flex items-center gap-1`}>
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 flex items-center gap-1`}>
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-1">No messages scheduled yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Click on "Schedule Message" to create your first scheduled message
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                {getStatusBadge(message.status)}
                <span className="text-xs text-gray-500">
                  ID: {message.id}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-800">{message.phone_number}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Message Content</p>
                  <p className="text-sm text-gray-800">{message.content}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Scheduled Time</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(message.scheduled_at)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingMessage(message)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                title="Edit message"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => handleDelete(message.id)}
                disabled={deletingId === message.id}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                title="Delete message"
              >
                {deletingId === message.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <Trash2 className="w-5 h-5" />
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