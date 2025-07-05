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
    // Pre-populate form with existing message data
    setValue('phoneNumber', message.phone_number);
    setValue('content', message.content);
    
    // Convert ISO string to datetime-local format
    const date = new Date(message.scheduled_at);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60000);
    setValue('scheduledAt', adjustedDate.toISOString().slice(0, 16));
  }, [message, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert local datetime to ISO string
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

  // Get current date and time for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - offset * 60000);
    return adjustedDate.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Edit Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 text-blue-500" />
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+1234567890"
                className={`w-full px-4 py-3 rounded-lg border text-black ${
                  errors.phoneNumber 
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                } focus:ring-2 focus:outline-none transition-all`}
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              Message Content
            </label>
            <textarea
              placeholder="Enter your message here..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.content 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              } focus:ring-2 focus:outline-none transition-all resize-none`}
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-amber-500" />
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              min={getCurrentDateTime()}
              className={`w-full px-4 py-3 rounded-lg border text-black ${
                errors.scheduledAt 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              } focus:ring-2 focus:outline-none transition-all`}
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}