'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 btn-primary flex items-center justify-center space-x-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}