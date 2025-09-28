// /home/eddy/umemployed/app/blog/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';
import { blogPosts } from '@/lib/blogData';
import Image from 'next/image';
import Link from 'next/link';
import HomeHeader from '@/app/(Home)/Components/HomeHeader';
import BlogSidebar from './components/BlogSIdebar';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  publishDate: string;
  readTime: string;
  author: string;
  authorRole: string;
  tags: string[];
}

export default function BlogPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    searchTerm: string;
    selectedCategories: string[];
    selectedTags: string[];
  }>({
    searchTerm: '',
    selectedCategories: [],
    selectedTags: [],
  });

  useEffect(() => {
    document.title = 'Career Insights | UmEmployed Blog';
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBrowseJobs = (): void => {
    router.push('/jobs');
  };

  // Filter blog posts based on search term, categories, and tags
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      filters.searchTerm === '' ||
      post.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesCategory =
      filters.selectedCategories.length === 0 ||
      filters.selectedCategories.includes(post.category);
    const matchesTags =
      filters.selectedTags.length === 0 ||
      filters.selectedTags.some((tag) => post.tags.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand3">
        <div className="px-4">
          <div>
            <HomeHeader />
            <div className="flex flex-col items-center justify-center py-24 relative">
              <div className="text-center text-white">
                <h3 className="text-3xl md:text-5xl dm-serif tracking-wider">
                  Career Insights
                </h3>
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto my-10">
                  Expert advice, industry trends, and practical tips to help you advance your career and succeed in today's job market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4">
              <BlogSidebar onFilterChange={setFilters} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Featured Posts */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 container max-w-4xl mx-auto">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post: BlogPost) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="group bg-white overflow-hidden"
                    >
                      <div className="relative h-48">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-brand text-white px-3 py-1 rounded-full text-sm md:text-[16.5px] font-medium">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm md:text-[16.5px] text-gray-500 mb-3">
                          <span>{formatDate(post.publishDate)}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.description}
                        </p>

                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm md:text-[16.5px] font-medium text-gray-900">{post.author}</p>
                            <p className="text-xs text-gray-500">{post.authorRole}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-600 text-center col-span-2">No posts match your filters.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Categories */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 border rounded-full flex items-center justify-center">
                  <Icon icon="solar:laptop-bold" className="size-9 md:size-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remote Work</h3>
              </div>
              <p className="text-gray-600 text-sm md:text-[16.5px]">
                Tips and strategies for succeeding in remote work environments.
              </p>
            </div>

            <div className="rounded-lg border p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 border rounded-full flex items-center justify-center">
                  <Icon icon="solar:code-bold" className="size-9 md:size-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Technology</h3>
              </div>
              <p className="text-gray-600 text-sm md:text-[16.5px]">
                Latest trends and skills in the technology industry.
              </p>
            </div>

            <div className="rounded-lg border p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 border rounded-full flex items-center justify-center">
                  <Icon icon="solar:chart-bold" className="size-9 md:size-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Career Development</h3>
              </div>
              <p className="text-gray-600 text-sm md:text-[16.5px]">
                Strategies for advancing your career and professional growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}