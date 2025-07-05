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
    setActiveTab('messages'); // Switch to messages tab after scheduling
  };

  const handleMessageUpdated = () => {
    fetchMessages();
  };

  const handleMessageDeleted = () => {
    fetchMessages();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: '#10B981',
              color: '#FFFFFF',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#EF4444',
            },
          },
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Message Scheduler Pro
                  </span>
                </h1>
                <p className="text-gray-600 mt-2">
                  Professional-grade messaging automation platform
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-xs">
                  <p className="text-xs text-gray-500">Total Messages</p>
                  <p className="font-semibold text-gray-900">{messages.length}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-xs">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-semibold text-gray-900">
                    {messages.filter(m => m.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === 'schedule'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Schedule Message
                  {activeTab === 'schedule' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === 'messages'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Message History
                  {activeTab === 'messages' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="p-6">
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
          </main>
        </div>
      </div>

      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Message Scheduler Pro. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}