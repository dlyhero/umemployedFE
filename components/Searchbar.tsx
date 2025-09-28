"use client"
import { useState } from 'react'
import { Icon } from '@iconify/react'

export function SearchInput() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="p-0.5 rounded-lg bg-g">
        <div className=" rounded-lg overflow-hidden">
          <div className="flex gap-2">
            {/* Search Input with ellipsis for overflow */}
            <div className="flex-1 flex items-center min-w-0"> {/* min-w-0 enables text truncation */}
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-5 px-5 outline-none border bg-white rounded-full placeholder-gray-400 text-gray-700 truncate" /* truncate for ellipsis */
                placeholder="Search jobs, keywords..."
                type="text"
                style={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              />
            </div>
            
            {/* Search Button */}
            <button
              className="bg-brand hover:bg-brand2 text-white px-5 md:px-8 py-3 mx-1 rounded-full transition-all duration-200 flex items-center justify-center"
            >
              <Icon 
                icon="line-md:search" 
                className="size-8 md:mr-2 rotate-275" 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}