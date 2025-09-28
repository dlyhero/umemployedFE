'use client';

import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, description }: UpgradeModalProps) {
  const [countdown, setCountdown] = React.useState(10);

  // Auto-close after 10 seconds with countdown
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    } else {
      setCountdown(10);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <Icon icon="material-symbols:star" width="20" height="20" className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
              <p className="text-xs text-gray-500">Auto-closes in {countdown}s</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="material-symbols:close" width="24" height="24" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            <strong>{feature}</strong> is a premium feature that requires an active subscription.
          </p>
          {description && (
            <p className="text-sm text-gray-500 mb-4">
              {description}
            </p>
          )}
          
          {/* Premium Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Premium Benefits Include:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center">
                <Icon icon="material-symbols:check-circle" width="16" height="16" className="text-green-500 mr-2" />
                AI-powered resume enhancement
              </li>
              <li className="flex items-center">
                <Icon icon="material-symbols:check-circle" width="16" height="16" className="text-green-500 mr-2" />
                Unlimited daily applications
              </li>
              <li className="flex items-center">
                <Icon icon="material-symbols:check-circle" width="16" height="16" className="text-green-500 mr-2" />
                Top applicant status
              </li>
              <li className="flex items-center">
                <Icon icon="material-symbols:check-circle" width="16" height="16" className="text-green-500 mr-2" />
                Advanced analytics
              </li>
              <li className="flex items-center">
                <Icon icon="material-symbols:check-circle" width="16" height="16" className="text-green-500 mr-2" />
                Priority support
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <Link
            href="/pricing"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors text-center"
            onClick={onClose}
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}