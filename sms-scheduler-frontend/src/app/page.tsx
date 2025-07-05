'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import MessageScheduler from '@/components/MessageScheduler';
import MessageList from '@/components/MessageList';
import { Message } from '@/types/message';
import { getMessages } from '@/lib/api';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'messages'>('schedule');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await getMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageScheduled = () => {
    fetchMessages();
  };

  const handleMessageUpdated = () => {
    fetchMessages();
  };

  const handleMessageDeleted = () => {
    fetchMessages();
  };

  return (
    <div className="font-[Montserrat] min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Message Scheduler
            </h1>
            <p className="text-lg text-gray-600">
              Schedule and manage your messages with ease
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Schedule Message
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                activeTab === 'messages'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View Messages ({messages.length})
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {activeTab === 'schedule' ? (
              <MessageScheduler onMessageScheduled={handleMessageScheduled} />
            ) : (
              <MessageList
                messages={messages}
                loading={loading}
                onMessageUpdated={handleMessageUpdated}
                onMessageDeleted={handleMessageDeleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}