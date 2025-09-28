"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { tr } from 'zod/v4/locales';

function CompaniesBanner() {
  // Filter only online companies
  const onlineCompanies = [
    { name: 'Google', logo: 'streamline-logos:google-plus-logo-1' },
    { name: 'AmazonLuna', logo: 'streamline-logos:amazon-luna-logo-block' },
    { name: 'AmazonPrime', logo: 'streamline-logos:amazon-prime-video-logo-2-solid' },
    { name: 'Spotify', logo: 'streamline-logos:spotify-logo-solid' },
    { name: 'Adobe', logo: 'streamline-logos:adobe-logo' },
    { name: 'Figma', logo: 'streamline-logos:figma-logo' },
    { name: 'Midi', logo: 'streamline-logos:midi-logo-solid' },
  ];

  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  return (
    <div className='bg-brand/3 /10 py-4'>
      <div className='container mx-auto'>
        {/* Company logos carousel */}
        <Slider {...settings} className="px-4">
          {onlineCompanies.map((company, index) => (
            <div key={index} className="px-4 outline-none">
              <div className="flex flex-col items-center p-3 transition-all hover:scale-105">
                <div className="relative p-4 ">
                  <Icon 
                    icon={company.logo} 
                    className="size-16 text-gray-800" 
                  />
                 
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default CompaniesBanner;