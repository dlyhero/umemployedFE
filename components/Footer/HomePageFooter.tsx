"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const HomePageFooter: React.FC = () => {
  return (
    <footer className="bg-brand3 text-white">
      {/* Main Footer Content */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info & Logo */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className='p-2 bg-brand text-white rounded-full'>
                <span className="text-sm font-bold">ue</span>
              </div>
              <span className="text-2xl font-bold text-white">UmEmployed</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-sm">
              Connecting top talent with leading companies. Find your dream job or hire the best candidates with our comprehensive platform.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="Facebook">
                <Icon icon="mdi:facebook" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="Twitter">
                <Icon icon="mdi:twitter" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="LinkedIn">
                <Icon icon="mdi:linkedin" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="Instagram">
                <Icon icon="mdi:instagram" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="YouTube">
                <Icon icon="mdi:youtube" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="TikTok">
                <Icon icon="mdi:tiktok" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="GitHub">
                <Icon icon="mdi:github" width="24" height="24" />
              </a>
              <a href="#" className="text-white/60 hover:text-brand transition-colors duration-200" title="Discord">
                <Icon icon="mdi:discord" width="24" height="24" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">For Job Seekers</h3>
            <ul className="space-y-4 text-white/80 text-sm">
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
                <Link href="/applicant/jobs/shortlisted/enhance-resume" className="hover:text-brand transition-colors duration-200">
                  Enhance Resume
                </Link>
              </li>
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
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">For Employers</h3>
            <ul className="space-y-4 text-white/80 text-sm">
              <li>
                <Link href="/companies/post-job" className="hover:text-brand transition-colors duration-200">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/candidates" className="hover:text-brand transition-colors duration-200">
                  Browse Candidates
                </Link>
              </li>
              <li>
                <Link href="/companies/create" className="hover:text-brand transition-colors duration-200">
                  Create Company Profile
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand transition-colors duration-200">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/recruiter/transactions" className="hover:text-brand transition-colors duration-200">
                  Transaction History
                </Link>
              </li>
              <li>
                <Link href="/employer/solutions" className="hover:text-brand transition-colors duration-200">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Company & Support</h3>
            <ul className="space-y-4 text-white/80 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-brand transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-brand transition-colors duration-200">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-brand transition-colors duration-200">
                  Careers at UmEmployed
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-brand transition-colors duration-200">
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-brand mb-2">50K+</div>
              <div className="text-white/80 text-sm">Active Job Seekers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand mb-2">10K+</div>
              <div className="text-white/80 text-sm">Job Opportunities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand mb-2">5K+</div>
              <div className="text-white/80 text-sm">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand mb-2">95%</div>
              <div className="text-white/80 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-white/80 text-sm mb-6">
              Get the latest job opportunities and career tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button className="px-6 py-3 bg-brand hover:bg-brand2 text-white font-semibold rounded-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-white/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} UmEmployed. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-2 text-sm">
              <Link href="/privacy" className="text-white/60 hover:text-brand transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/60 hover:text-brand transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-white/60 hover:text-brand transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link href="/gdpr" className="text-white/60 hover:text-brand transition-colors duration-200">
                GDPR Compliance
              </Link>
              <Link href="/ccpa" className="text-white/60 hover:text-brand transition-colors duration-200">
                CCPA Notice
              </Link>
              <Link href="/accessibility" className="text-white/60 hover:text-brand transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/data-protection" className="text-white/60 hover:text-brand transition-colors duration-200">
                Data Protection
              </Link>
              <Link href="/security" className="text-white/60 hover:text-brand transition-colors duration-200">
                Security
              </Link>
              <Link href="/compliance" className="text-white/60 hover:text-brand transition-colors duration-200">
                Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomePageFooter;

