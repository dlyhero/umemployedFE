"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const JobSeekerFooter: React.FC = () => {
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
              Your career journey starts here. Find your dream job with our comprehensive job search platform.
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

          {/* Job Search Tools */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Search Tools</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-brand transition-colors duration-200">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-brand transition-colors duration-200">
                  Top Companies
                </Link>
              </li>
              <li>
                <Link href="/applicant/upload-resume" className="hover:text-brand transition-colors duration-200">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link href="/applicant/resume-advisor" className="hover:text-brand transition-colors duration-200">
                  Resume Advisor
                </Link>
              </li>
              <li>
                <Link href="/applicant/jobs/shortlisted/enhance-resume" className="hover:text-brand transition-colors duration-200">
                  Enhance Resume
                </Link>
              </li>
              <li>
                <Link href="/applicant/jobs/shortlisted" className="hover:text-brand transition-colors duration-200">
                  Shortlisted Jobs
                </Link>
              </li>
              <li>
                <Link href="/applicant/messages" className="hover:text-brand transition-colors duration-200">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/applicant/interviews" className="hover:text-brand transition-colors duration-200">
                  Interviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Career Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Resources</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/career-advice" className="hover:text-brand transition-colors duration-200">
                  Career Advice
                </Link>
              </li>
              <li>
                <Link href="/job-alerts" className="hover:text-brand transition-colors duration-200">
                  Job Alerts
                </Link>
              </li>
              <li>
                <Link href="/salary-insights" className="hover:text-brand transition-colors duration-200">
                  Salary Insights
                </Link>
              </li>
              <li>
                <Link href="/interview-tips" className="hover:text-brand transition-colors duration-200">
                  Interview Tips
                </Link>
              </li>
              <li>
                <Link href="/resume-templates" className="hover:text-brand transition-colors duration-200">
                  Resume Templates
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-guide" className="hover:text-brand transition-colors duration-200">
                  Cover Letter Guide
                </Link>
              </li>
              <li>
                <Link href="/networking-tips" className="hover:text-brand transition-colors duration-200">
                  Networking Tips
                </Link>
              </li>
              <li>
                <Link href="/skill-assessment" className="hover:text-brand transition-colors duration-200">
                  Skill Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Legal</h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li>
                <Link href="/help" className="hover:text-brand transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand transition-colors duration-200">
                  Contact Support
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
            </ul>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-brand mb-1">50K+</div>
              <div className="text-sm text-gray-600">Job Seekers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">10K+</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">5K+</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand mb-1">85%</div>
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

            {/* Additional Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2 text-sm">
              <Link href="/accessibility" className="text-gray-600 hover:text-brand transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/security" className="text-gray-600 hover:text-brand transition-colors duration-200">
                Security
              </Link>
              <Link href="/compliance" className="text-gray-600 hover:text-brand transition-colors duration-200">
                Compliance
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-brand transition-colors duration-200">
                Cookie Policy
              </Link>
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

export default JobSeekerFooter;
