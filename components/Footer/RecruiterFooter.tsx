"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const RecruiterFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className='p-2 bg-brand text-white rounded-full'>
                <span className="text-sm font-bold">ue</span>
              </div>
              <span className="text-xl font-bold text-gray-900">UmEmployed</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Empowering recruiters to find and hire the best talent efficiently.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:email" width="16" height="16" />
                <span>support@umemployed.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:phone" width="16" height="16" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Recruiter Tools */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruiter Tools</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/companies/post-job" className="hover:text-brand transition-colors duration-200">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/employer/candidates" className="hover:text-brand transition-colors duration-200">
                  Candidate Search
                </Link>
              </li>
              <li>
                <Link href="/companies/dashboard" className="hover:text-brand transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/companies/profile" className="hover:text-brand transition-colors duration-200">
                  Company Profile
                </Link>
              </li>
              <li>
                <Link href="/employer/analytics" className="hover:text-brand transition-colors duration-200">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/employer/interviews" className="hover:text-brand transition-colors duration-200">
                  Interview Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-brand transition-colors duration-200">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/recruiter/transactions" className="hover:text-brand transition-colors duration-200">
                  Billing & Transactions
                </Link>
              </li>
              <li>
                <Link href="/help/recruiter" className="hover:text-brand transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/recruiter-guide" className="hover:text-brand transition-colors duration-200">
                  Recruiter Guide
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-brand transition-colors duration-200">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-brand transition-colors duration-200">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/recruiter-best-practices" className="hover:text-brand transition-colors duration-200">
                  Best Practices
                </Link>
              </li>
              <li>
                <Link href="/hiring-trends" className="hover:text-brand transition-colors duration-200">
                  Hiring Trends
                </Link>
              </li>
              <li>
                <Link href="/talent-acquisition-guide" className="hover:text-brand transition-colors duration-200">
                  Talent Acquisition Guide
                </Link>
              </li>
              <li>
                <Link href="/interview-templates" className="hover:text-brand transition-colors duration-200">
                  Interview Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Legal</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/contact" className="hover:text-brand transition-colors duration-200">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/help/recruiter" className="hover:text-brand transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="hover:text-brand transition-colors duration-200">
                  GDPR Compliance
                </Link>
              </li>
              <li>
                <Link href="/ccpa" className="hover:text-brand transition-colors duration-200">
                  CCPA Notice
                </Link>
              </li>
              <li>
                <Link href="/data-protection" className="hover:text-brand transition-colors duration-200">
                  Data Protection
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-brand transition-colors duration-200">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-brand transition-colors duration-200">
                  Compliance
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-brand transition-colors duration-200">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-brand transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-brand mb-1">10K+</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">50K+</div>
              <div className="text-sm text-gray-600">Candidates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">5K+</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-gray-600 text-sm text-center md:text-left">
              © {new Date().getFullYear()} UmEmployed. All rights reserved.
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RecruiterFooter;
