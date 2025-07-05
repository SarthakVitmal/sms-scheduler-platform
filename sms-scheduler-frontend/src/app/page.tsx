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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-[Montserrat]">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#4ade80',
              color: '#166534',
            },
          },
          error: {
            style: {
              background: '#f87171',
              color: '#991b1b',
            },
          },
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Message Scheduler
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              Easily schedule and manage your messages with our intuitive platform
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8 bg-white rounded-xl shadow-sm p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Schedule Message
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              View Messages
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {messages.length}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
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
      <footer className="text-center py-8 mt-12 bg-white bg-opacity-50">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Message Scheduler. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Crafted with ❤️ by Sarthak Vitmal
        </p>
      </footer>
    </div>
  );
}