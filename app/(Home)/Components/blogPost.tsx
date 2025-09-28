"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { getFeaturedPosts } from '@/lib/blogData'
import Image from 'next/image'
import Link from 'next/link'

const BlogSection: React.FC = () => {
  const router = useRouter()
  const blogPosts = getFeaturedPosts()

  return (
    <section className="px-4 md:px-6 bg-gray-50">
      <div className="max-w-[1450px] mx-auto border-t py-18 md:pt-36 mt-10 md:mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-[27px] md:text-[40px] font-semibold text-center">Career Insights</h2>
          <button 
            onClick={() => router.push('/blog')}
            className="bg-brand/20 text-brand2 font-semibold py-2 px-6 rounded-full hover:bg-brand2/10 transition"
          >
            Discover More
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.id}`}
              className="group bg-white  overflow-hidden  transition-all duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">By {post.author}</span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Icon icon="solar:clock-circle-bold" className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogSection