'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import TransactionHistory from '@/components/TransactionHistory';
import Link from 'next/link';
import HomeHeader from '../(Home)/Components/HomeHeader';

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction History</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                View all your payment transactions and billing history.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/billing"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Icon icon="material-symbols:settings-outline" width="16" height="16" className="mr-2" />
                Billing Settings
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand2 transition-colors"
              >
                <Icon icon="material-symbols:attach-money" width="16" height="16" className="mr-2" />
                View Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Transaction History Component */}
        <div className="bg-white rounded-lg shadow">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}