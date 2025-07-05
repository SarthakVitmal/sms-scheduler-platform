'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, Calendar, Phone, MessageSquare } from 'lucide-react';
import { scheduleMessage } from '@/lib/api';

interface MessageSchedulerProps {
  onMessageScheduled: () => void;
}

interface FormData {
  phoneNumber: string;
  content: string;
  scheduledAt: string;
}

export default function MessageScheduler({ onMessageScheduled }: MessageSchedulerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const scheduledDate = new Date(data.scheduledAt);
      const isoString = scheduledDate.toISOString();
      
      await scheduleMessage({
        phone_number: data.phoneNumber,
        content: data.content,
        scheduled_at: isoString,
      });
      
      toast.success('Message scheduled successfully!');
      reset();
      onMessageScheduled();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - offset * 60000);
    return adjustedDate.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
            <Send className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule New Message</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to schedule your message for delivery
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Phone Number
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="+91 12345 12345"
                className={`text-black block w-full pl-10 pr-3 py-2 border ${
                  errors.phoneNumber 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number with country code'
                  }
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Message Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute top-2 left-0 pl-3 flex items-start pointer-events-none">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
              </div>
              <textarea
              id="content"
              placeholder="Happy Coding! 🚀"
              rows={4}
              maxLength={15}
              className={`text-black block w-full pl-10 pr-3 py-2 border ${
                errors.content 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-md shadow-sm focus:outline-none sm:text-sm resize-none`}
              {...register('content', {
                required: 'Message content is required',
                minLength: {
                value: 1,
                message: 'Message cannot be empty'
                },
                maxLength: {
                value: 10,
                message: 'Message cannot exceed 10 characters'
                }
              })}
              />
            </div>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Scheduled Date/Time */}
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="scheduledAt"
                min={getCurrentDateTime()}
                className={`text-black block w-full pl-10 pr-3 py-2 border ${
                  errors.scheduledAt 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                {...register('scheduledAt', {
                  required: 'Scheduled date and time is required',
                  validate: (value) => {
                    const scheduledDate = new Date(value);
                    const now = new Date();
                    if (scheduledDate <= now) {
                      return 'Scheduled time must be in the future';
                    }
                    return true;
                  }
                })}
              />
            </div>
            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="-ml-1 mr-2 h-4 w-4" />
                  Schedule Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}