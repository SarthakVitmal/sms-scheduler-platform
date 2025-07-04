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
      
      // Convert local datetime to ISO string
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

  // Get current date and time for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - offset * 60000);
    return adjustedDate.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Send className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schedule a Message
        </h2>
        <p className="text-gray-600">
          Enter the details below to schedule your message
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+1234567890"
            className={`input-field ${errors.phoneNumber ? 'border-red-500' : ''}`}
            {...register('phoneNumber', {
              required: 'Phone number is required',
              pattern: {
                value: /^\+?[1-9]\d{1,14}$/,
                message: 'Please enter a valid phone number'
              }
            })}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="inline w-4 h-4 mr-2" />
            Message Content
          </label>
          <textarea
            placeholder="Enter your message here..."
            rows={4}
            className={`input-field resize-none ${errors.content ? 'border-red-500' : ''}`}
            {...register('content', {
              required: 'Message content is required',
              minLength: {
                value: 1,
                message: 'Message cannot be empty'
              },
              maxLength: {
                value: 1000,
                message: 'Message cannot exceed 1000 characters'
              }
            })}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Scheduled Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Scheduled Date & Time
          </label>
          <input
            type="datetime-local"
            min={getCurrentDateTime()}
            className={`input-field ${errors.scheduledAt ? 'border-red-500' : ''}`}
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
          {errors.scheduledAt && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full btn-primary flex items-center justify-center space-x-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Schedule Message</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}