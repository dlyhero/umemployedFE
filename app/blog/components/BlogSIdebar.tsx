"use client";

import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import { blogPosts } from '@/lib/blogData';

interface BlogSidebarProps {
  onFilterChange: (filters: {
    searchTerm: string;
    selectedCategories: string[];
    selectedTags: string[];
  }) => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Graphic Design', 'Video Editing', 'Web Development']);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const removeCategory = (categoryToRemove: string): void => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
    onFilterChange({ searchTerm, selectedCategories: selectedCategories.filter(cat => cat !== categoryToRemove), selectedTags });
  };

  const handleTagClick = (tag: string): void => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    onFilterChange({ searchTerm, selectedCategories, selectedTags: updatedTags });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    onFilterChange({ searchTerm: e.target.value, selectedCategories, selectedTags });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newCategory = e.target.value;
    if (newCategory === 'All') {
      // Clear all categories to show all posts
      setSelectedCategories([]);
      onFilterChange({ searchTerm, selectedCategories: [], selectedTags });
    } else if (!selectedCategories.includes(newCategory)) {
      const updatedCategories = [...selectedCategories, newCategory];
      setSelectedCategories(updatedCategories);
      onFilterChange({ searchTerm, selectedCategories: updatedCategories, selectedTags });
    }
  };

  // Use images from blogData.ts for recent articles
  const recentArticles = blogPosts.slice(0, 3).map(post => ({
    id: post.id,
    date: post.publishDate,
    title: post.title,
    image: post.imageUrl,
  }));

  const tags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  return (
    <div className="bg-gray-100 p-6 rounded-lg w-full max-w-sm">
      {/* Search Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Company titles/keywords"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
        <select
          defaultValue=""
          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-gray-600 mb-4"
          onChange={handleCategoryChange}
        >
          <option value="" disabled>Select a category</option>
          <option value="All">All</option>
          {Array.from(new Set(blogPosts.map(post => post.category))).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
            >
              {category}
              <button
                onClick={() => removeCategory(category)}
                className="text-gray-500 hover:text-gray-700 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Articles</h3>
        <div className="space-y-4">
          {recentArticles.map((article) => (
            <div key={article.id} className="flex gap-3">
              <img
                src={article.image}
                alt={article.title}
                className="w-16 h-12 object-cover rounded bg-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Calendar className="w-3 h-3" />
                  {article.date}
                </div>
                <h4 className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-brand text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;