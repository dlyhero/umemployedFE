"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import HomeHeader from "./HomeHeader";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useCategories from '@/hooks/jobs/useCategories';

const HeroSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  // Get categories from API
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.allCategories || [];

  // Handle search functionality with dynamic routing
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    const queryString = params.toString();
    const baseUrl = '/jobs';
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    router.push(url);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    setSelectedCategory(categoryName);
    setSelectedCategoryId(category?.id);
  };

  return (
    <section className="relative bg-brand3">
      <HomeHeader />

      <div className="flex flex-col  justify-center min-[1195px]:flex-row min-[1195px]:h-[calc(90vh-50px)] py-10 min-[1195px]:py-0 container mx-auto">
        {/* Left Section - Dark Background */}
        <div className="w-full min-[1195px]:w-1/2 bg-brand3 flex items-center justify-center relative ">
          {/* Background Pattern - Diagonal stripes */}
          {/* <div className="absolute top-0 right-0 w-full h-full opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`
            }}></div>
          </div> */}

          <div className="relative z-10 px-6 lg:px-12 xl:px-16 w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Main Headline */}
              <h1 className="text-4xl lg:text-7xl xl:text-7xl font-bold text-white leading-[0.9]">
                Hire Faster
              </h1>

              {/* Sub-headline with accent color */}
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-brand leading-[0.9]">
                Work Smarter, <span className="text-white">Start Now!</span>
              </h2>

              {/* Tagline */}
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                Browse and Hire Top Talent for Your Projects
              </p>

              {/* Search Container */}
              <div className="bg-white rounded  shadow-lg  min-[1200px]:min-w-[700px]  min-[1500px]:min-w-[900px] w-full">
                <div className="flex flex-col sm:flex-row items-center ">
                  {/* Job Search Input */}
                  <div className="flex-1 p-4 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What are you looking for?
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-gray-900 placeholder-gray-500 border-0 focus:outline-none text-base"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex-1 p-4 border-l border-gray-200 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 border-0 focus:outline-none text-base bg-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="w-fit max-[640px]:w-full">
                    <button
                      onClick={handleSearch}
                      className="w-full sm:w-auto  px-10 py-10 bg-brand hover:bg-brand2 text-white font-bold text-base rounded-r- transition-colors duration-200"
                    >
                      SEARCH
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="flex  gap-3">
                <span className="text-white font-medium text-sm md:text-base">Popular:</span>
                <div className="flex flex-wrap gap-2">
                  {['Software Engineer', 'Artificial Intelligence', 'Digital Marketing', 'React Developer'].map((term, index) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="text-white/60 hover:text-white transition-colors duration-200 text-sm md:text-base"
                    >
                      {term}{index < 3 ? ',' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="hidden lg:block w-full min-[1195px]:w-1/2 relative  ">
          {/* Background Pattern - Diagonal stripes */}
          <div className="absolute top-0 right-0 w-[98%] h-full opacity-5 z-0">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255) 10px,
                rgba(255,255,255) 20px
              )`
            }}></div>
          </div>
          <img
            src="/images/pn.jpg"
            alt="Professional working environment"
            className="h-full w-[90%] object-cover mt-10 z-0 absolute top-0 right-0"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;