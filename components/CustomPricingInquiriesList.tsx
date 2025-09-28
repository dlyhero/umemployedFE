'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useCustomPricingInquiries } from '@/hooks/useSubscriptionManagement';
import { CustomPricingInquiry } from '@/types/pricing';
import Link from 'next/link';

interface CustomPricingInquiriesListProps {
  onViewDetail?: (inquiry: CustomPricingInquiry) => void;
}

export default function CustomPricingInquiriesList({ onViewDetail }: CustomPricingInquiriesListProps) {
  const { data: inquiries, isLoading, error } = useCustomPricingInquiries();
  const [selectedInquiry, setSelectedInquiry] = useState<CustomPricingInquiry | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <span className="ml-2">Loading inquiries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load inquiries. Please try again.</p>
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Icon icon="material-symbols:description-outline" width="48" height="48" className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Pricing Inquiries</h3>
        <p className="text-gray-500 mb-4">
          You haven't submitted any custom pricing inquiries yet.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-md hover:bg-brand2 transition-colors"
        >
          View Pricing Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Custom Pricing Inquiries</h2>
        <span className="text-sm text-gray-500">
          {inquiries.length} inquiry{inquiries.length !== 1 ? 'ies' : ''}
        </span>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {inquiry.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status || 'pending')}`}>
                      {inquiry.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.created_at ? formatDate(inquiry.created_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.updated_at ? formatDate(inquiry.updated_at) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        onViewDetail?.(inquiry);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Inquiry Details
                </h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="material-symbols:close" width="24" height="24" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.company_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Size</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.company_size}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.contact_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.work_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hiring Volume</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.hiring_volume}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.budget_range}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hiring Types</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.hiring_types.join(', ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Billing Option</label>
                  <p className="text-sm text-gray-900">{selectedInquiry.billing_option}</p>
                </div>

                {selectedInquiry.additional_requirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.additional_requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInquiry.status || 'pending')}`}>
                      {selectedInquiry.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">
                      {selectedInquiry.created_at ? formatDate(selectedInquiry.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedInquiry.admin_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedInquiry.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}