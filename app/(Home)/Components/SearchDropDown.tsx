import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

const options: Option[] = [
  { value: 'categories', label: 'Categories' },
  { value: '', label: 'Coder' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
];

const CustomSelect: React.FC<{
  name: string;
  id: string;
  className: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}> = ({ name, id, className, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <div className="relative" ref={selectRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} text-left flex items-center justify-between cursor-pointer`}
      >
        <span>{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded z-50 mt-1"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors"
                whileHover={{ backgroundColor: 'rgb(243 244 246)' }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchComponent: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('categories');

  return (
    <motion.div 
      className="border flex flex-col md:flex-row md:items-center p-2 rounded bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.input 
        type="text" 
        placeholder="Search key words, company or job" 
        className="truncate flex-1 p-4 md:border-r border-gray-400 outline-none"
        transition={{ duration: 0.2 }}
      />
      
      <CustomSelect
        name="categories"
        id="categories"
        className="flex-1 p-6 outline-none border-t md:border-t-0 w-ful"
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
      />
      
      <motion.button 
        className="text-white bg-brand py-4 px-8 ml-2 rounded flex-1 md:flex-0"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        Search
      </motion.button>
    </motion.div>
  );
};

export default SearchComponent;