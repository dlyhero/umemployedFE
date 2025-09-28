'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { useTransactionHistory } from '@/hooks/useSubscriptionManagement';
import { Transaction } from '@/types/pricing';

export default function TransactionHistory() {
  const { data: transactions, isLoading, error } = useTransactionHistory();

  // Debug logging
  React.useEffect(() => {
    if (transactions) {
      console.log('Transaction data received:', transactions);
      transactions.forEach((transaction, index) => {
        console.log(`Transaction ${index}:`, {
          id: transaction.transaction_id,
          candidate: transaction.candidate,
          candidateType: typeof transaction.candidate,
          description: transaction.description,
          amount: transaction.amount,
          status: transaction.status
        });
      });
    }
  }, [transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    if (!method) return <span className="text-sm text-gray-500">Unknown</span>;
    
    switch (method.toLowerCase()) {
      case 'stripe':
        return (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm">Stripe</span>
          </div>
        );
      case 'paypal':
        return (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">PayPal</span>
          </div>
        );
      default:
        return <span className="text-sm capitalize">{method}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Safe candidate display helper
  const getCandidateDisplay = (candidate: any) => {
    if (!candidate) return null;
    
    if (typeof candidate === 'object') {
      return candidate.full_name || candidate.username || `ID: ${candidate.id}`;
    }
    
    return `ID: ${candidate}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <span className="ml-2">Loading transaction history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load transaction history. Please try again.</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Icon icon="material-symbols:receipt-long-outline" width="48" height="48" className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction History</h3>
        <p className="text-gray-500 mb-4">
          You haven't made any transactions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction History</h2>
        <span className="text-sm text-gray-500">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(
                transactions
                  .filter(t => t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Successful Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Payments</div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {transaction.transaction_id ? transaction.transaction_id.substring(0, 20) + '...' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {transaction.description || 'No description'}
                    </div>
                    {transaction.candidate && (
                      <div className="text-xs text-gray-500">
                        Candidate: {getCandidateDisplay(transaction.candidate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.amount ? formatAmount(transaction.amount) : '$0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentMethodIcon(transaction.payment_method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status || 'pending')}`}>
                      {transaction.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.created_at ? formatDate(transaction.created_at) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}