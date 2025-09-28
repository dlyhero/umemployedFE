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
    const [showCategories, setShowCategories] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
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
      
      // Only add category for job searches
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
      setShowCategories(false);
    };

    // Clear category selection
    const handleClearCategory = () => {
      setSelectedCategory("");
      setSelectedCategoryId(undefined);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowCategories(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <section className="relative bg-brand3">
        <HomeHeader />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-8 lg:h-[730px]">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Content */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className=""
              >
                <img src="/images/jobs.png" alt="hero" className="absolute top-14" />

                <h1 className="text-4xl mb-8 md:text-5xl lg:text-7xl font-bold text-brand leading-tight [word-spacing:0.5rem] dm-serif tracking-wider">
                  <span className="text-white">
                    Hire Faster <br />
                  </span>
                  Work Smarter, <br className="hidden lg:block" />
                  <span className="text-white">Start Now!</span>
                </h1>

                <p className="text-lg md:text-xl mb-6 text-white max-w-[600px]">
                  Browse thousands of job listings and seize the opportunity to advance your career with our platform.
                </p>

                {/* Enhanced Search Container */}
                <div className="mb-2 relative lg:w-[890px] lg:z-10 ">
                  <div className="flex flex-col lg:flex-row rounded border-2 border-brand2/80 bg-white shadow-sm ">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-0 flex items-center mb-2 lg:mb-0 lg:mr-2">
                      {/* <select
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-8 pl-4 pr-10 outline-none text-gray-700 text-sm sm:text-base bg-white lg:border-r border-gray-300 rounded appearance-none"
                        onKeyPress={handleKeyPress}
                      >
                        <option value="" disabled>What are you looking for?</option>
                        <option value="UI Designer">UI Designer</option>
                        <option value="Web Design">Web Design</option>
                        {/* Add more options dynamically if needed */}
                      
                          <input 
                      type="text" 
                        className="w-full p-8 pl-4 pr-10 outline-none text-gray-700 text-sm sm:text-base bg-white lg:border-r border-gray-300 rounded appearance-none"
                      placeholder="Searcch job title"                   
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    </div>
                    <hr className="lg:hidden"/>
                    {/* Category Dropdown */}
                    <div className="relative flex-1 min-w-0 flex items-center mb-2 lg:mb-0 lg:mr-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategorySelect(e.target.value)}
                        className="w-full p-8 pl-4 pr-10 outline-none text-gray-700 text-sm sm:text-base bg-white  border-gray-300 rounded appearance-none"
                      >
                        <option value="" disabled>Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Search Button */}
                    <button 
                      onClick={handleSearch}
                      className="flex-shrink-0 text-white bg-brand hover:bg-brand2 transition-colors  py-3 px-12 font-bold text-sm sm:text-base whitespace-nowrap"
                    >
                      Search
                    </button>
                  </div>

                  {/* Popular Searches */}
                  <div className="lg:flex justify-start gap-2 px-2 text-sm md:text-[16.5px] text-white mt-2">
                    <p className="text-nowrap">Popular:</p>
                    <div className="flex flex-wrap gap-2 text-white/60">
                      <button 
                        onClick={() => setSearchQuery('Design')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Software Engineer
                      </button>
                      <span>,</span>
                      <button 
                        onClick={() => setSearchQuery('Art')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Artificial Intelligence
                      </button>
                      <span>,</span>
                      <button 
                        onClick={() => setSearchQuery('Business')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Digital Marketing
                      </button>
                      <span>,</span>
                      <button 
                        onClick={() => setSearchQuery('Video Editing')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        React Developer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Image */}
            <div className="hidden lg:block w-full lg:w-1/2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-full relative">
              <div className="relative w-full h-full rounded-xl ">
                <img
                  src="/images/pn.jpg"
                  alt="Professionals working"
                  className="w-full h-[695px] object-cover mt-10"
                />

                {/* Floating Job Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon icon="solar:case-outline" className="size-5 text-brand" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Senior Developer</h4>
                      <p className="text-sm text-gray-600">Tech Company Inc.</p>
                      <p className="text-xs text-brand mt-1">$120k - $150k • Remote</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Career Tags */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-3 -right-14 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">I'm a Digital Marketer</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute top-20 -right-28 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">I'm a UI/UX Designer</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute top-36 -right-36 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">I'm an Architect</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-54 -right-56 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">I'm a Content Creator</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="absolute top-72 -right-72 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">Brand Strategist</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="absolute top-96 -right-54 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">SEO Specialist</h4>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="absolute top-[460px] -right-54 bg-brand3 px-8 py-3 rounded max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-white">Visual Storyteller</h4>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default HeroSection;