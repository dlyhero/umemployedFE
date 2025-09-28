"use client"
import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from '@/components/ui/button'
import { getBlogPostById, blogPosts } from '@/lib/blogData'
import Image from 'next/image'
import HomeHeader from '@/app/(Home)/Components/HomeHeader'
import { renderRichText } from '@/lib/richTextRenderer'
import Link from 'next/link'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const post = getBlogPostById(postId)

  // Set page title
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | UmEmployed Blog`
    }
  }, [post])

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="solar:file-search-bold" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/blog')} className="bg-brand hover:bg-brand/90 text-white">
            <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HomeHeader />
      
      {/* Page Content */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
          <Icon icon="mynaui:arrow-long-left" className='size-7' />
            Back
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="bg-brand/10 text-brand px-2 py-1 rounded-full text-xs font-medium">
              {post.category}
            </span>
            <span>•</span>
            <span>{formatDate(post.publishDate)}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            {post.description}
          </p>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-600">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed">
            {renderRichText(post.content)}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              About {post.author}
            </h3>
            <p className="text-gray-600 mb-2">{post.authorRole}</p>
            <p className="text-gray-600">
              {post.author} is a passionate professional with extensive experience in their field. 
              They share insights and practical advice to help others succeed in their careers.
            </p>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts
              .filter(relatedPost => relatedPost.id !== post.id)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  href={`/blog/${relatedPost.id}`}
                  className="group p-6 "
                >
                  <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={relatedPost.imageUrl}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                    {relatedPost.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {relatedPost.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">By {relatedPost.author}</span>
                    <span className="text-xs text-gray-500">{relatedPost.readTime}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 p-8 rounded-lg text-center">
          <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Advance Your Career?
          </h3>
          <p className="text-gray-600 mb-6">
            Browse our job opportunities and find your next role with top employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/jobs')} 
              className="bg-brand hover:bg-brand/90 text-white rounded-full"
            >
              <Icon icon="solar:briefcase-bold" className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
            <Button 
              onClick={() => router.push('/blog')} 
              variant="outline"
              className='rounded-full'
            >
              More Articles
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}