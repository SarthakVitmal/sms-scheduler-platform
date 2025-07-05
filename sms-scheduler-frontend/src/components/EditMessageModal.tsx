'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Save, Phone, MessageSquare, Clock } from 'lucide-react';
import { Message } from '@/types/message';
import { updateMessage } from '@/lib/api';

interface EditMessageModalProps {
  message: Message;
  onClose: () => void;
  onMessageUpdated: () => void;
}

interface FormData {
  phoneNumber: string;
  content: string;
  scheduledAt: string;
}

export default function EditMessageModal({
  message,
  onClose,
  onMessageUpdated,
}: EditMessageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();

  useEffect(() => {
    setValue('phoneNumber', message.phone_number);
    setValue('content', message.content);
    
    const date = new Date(message.scheduled_at);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60000);
    setValue('scheduledAt', adjustedDate.toISOString().slice(0, 16));
  }, [message, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const scheduledDate = new Date(data.scheduledAt);
      const isoString = scheduledDate.toISOString();
      
      await updateMessage(message.id, {
        phone_number: data.phoneNumber,
        content: data.content,
        scheduled_at: isoString,
      });
      
      toast.success('Message updated successfully!');
      onMessageUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update message');
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Edit Scheduled Message
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6">
          {/* Phone Number */}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.phoneNumber 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Message Content */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute top-2 left-0 pl-3 flex items-start pointer-events-none">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
              </div>
              <textarea
                id="content"
                rows={4}
                className={`block w-full pl-10 pr-3 py-2 border ${
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
                    value: 1000,
                    message: 'Message cannot exceed 1000 characters'
                  }
                })}
              />
            </div>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Scheduled Date/Time */}
          <div className="mb-6">
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="scheduledAt"
                min={getCurrentDateTime()}
                className={`block w-full pl-10 pr-3 py-2 border ${
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

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}