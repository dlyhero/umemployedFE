"use client"
import React from 'react'
import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Developer at TechCorp',
      content: 'UmEmployed helped me find my dream job in just two weeks! The personalized recommendations were spot-on and saved me hours of searching.',
      rating: 5,
      avatar: 'mdi:account-circle'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Product Manager',
      content: 'The quality of job listings is exceptional. I received three interview invitations within days of creating my profile.',
      rating: 4,
      avatar: 'mdi:account-tie'
    },
    {
      id: 3,
      name: 'Emma Williams',
      role: 'UX Designer',
      content: 'As a recent graduate, I was struggling to find opportunities. UmEmployed connected me with companies that value fresh talent.',
      rating: 5,
      avatar: 'mdi:account-school'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'DevOps Engineer',
      content: 'The salary transparency and company insights helped me negotiate a 20% higher offer than my previous position.',
      rating: 5,
      avatar: 'mdi:account-hard-hat'
    }
  ]

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ],
    appendDots: (dots: React.ReactNode) => (
      <div className="mt-10">
        <ul className="flex justify-center gap-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-brand transition-colors" />
    )
  }

  return (
    <div className="py-20 bg-gray-50 border-t">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Success Stories</h2>
          <h3 className="text-gray-600 text-lg md:text-xl mt-2 max-w-2xl mx-auto">
            Hear from professionals who found their perfect match through UmEmployed
          </h3>
        </div>

        <div className="relative">
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="px-4">
                <div className="bg-white p-8 rounded-lg border border-gray-200 h-full flex flex-col hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-6">
                    <Icon 
                      icon={testimonial.avatar} 
                      className="text-gray-700 text-4xl mr-4" 
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 flex-grow">"{testimonial.content}"</p>
                  
                  <div className="flex items-center">
                    <div className="flex mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i} 
                          icon="mdi:star" 
                          className={`text-xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <Icon icon="mdi:quote-open" className="text-gray-300 text-3xl ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  )
}