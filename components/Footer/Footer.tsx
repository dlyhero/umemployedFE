import React from 'react';
import { Icon } from '@iconify/react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white  px-4 md:px-6">
            <div className="max-w-[1450px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-24 pb-14 border-t">
                {/* <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-2 mb-4">
           
            <span className="text-xl font-bold text-gray-900 flex items-center gap-1">
                <span className='p-2 bg-brand3 text-brand rounded-full'>ue</span>
                Umemployed</span>
          </div>
        </div> */}

                {/* Services Section */}
                <div className="flex flex-col items-center md:items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
                    <ul className="space-y-6  text-gray-600 text-center md:text-left">
                        <li>Browse Jobs</li>
                        <li>Companies</li>
                        <li>Candidates</li>
                        <li>Pricing</li>
                    </ul>
                </div>

                {/* Company Section */}
                <div className="flex flex-col items-center md:items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
                    <ul className="space-y-6  text-gray-600 text-center md:text-left">
                        <li>About us</li>
                        <li>Blogs</li>
                        <li>FAQ's</li>
                        <li>Contact</li>
                    </ul>
                </div>

                {/* Support Section */}
                <div className="flex flex-col items-center md:items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
                    <ul className="space-y-6  text-gray-600 text-center md:text-left">
                        <li>Terms of use</li>
                        <li>Terms & conditions</li>
                        <li>Privacy</li>
                        <li>Cookie policy</li>
                    </ul>
                </div>

                {/* <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter</h3>
          <p className=" text-gray-600 mb-4 text-center md:text-left">Join & get important new regularly</p>
          <div className="flex flex-col w-full max-w-xs space-y-2">
            <input
              type="email"
              placeholder="Enter your email*"
              className="p-2 border border-gray-300 rounded-md  w-full"
            />
            <button className="bg-green-700 text-white p-2 rounded-md  w-full">Send</button>
          </div>
          <p className=" text-gray-600 mt-2 text-center md:text-left">We only send interesting and relevant emails.</p>
        </div> */}
                <div className="flex flex-col  gap-4">
                    <span className=" text-gray-600">Download Apps</span>
                    <div className="flex flex-col  space-y-2 md:space-y-0 md:space-x-2 gap-2">
                        <div className="flex items-center space-x-5 py-2 px-4 border border-gray-300 rounded-md text-nowrap">

                            <Icon icon="logos:google-play-icon" className='size-6 md:size-10' />
                            <span className=" text-gray-600">GET IT ON Google Play Store</span>
                        </div>
                        <div className="flex items-center space-x-5 py-2 px-4 border border-gray-300 rounded-md text-nowrap">
                            <Icon icon="logos:apple-app-store" className='size-6 md:size-10' />
                            <span className=" text-gray-600">GET IT ON App Store</span>
                        </div>
                    </div>
                    <div className="flex space-x-4  text-brand">
                        <span>12K</span>
                        <span>10M</span>
                        <span>76K</span>
                        <span>200+</span>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="max-w-[1450px] mx-auto mt-6 py-8  border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className=" text-gray-600 text-center md:text-left">Privacy & Terms. Contact Us</div>

                <div className=" text-gray-600 text-center md:text-left">Copyright ©2025 umemployed</div>

                <div className="flex space-x-4">
                    <Icon icon="mdi:facebook" width="20" height="20" className="text-gray-600" />
                    <Icon icon="mdi:twitter" width="20" height="20" className="text-gray-600" />
                    <Icon icon="mdi:instagram" width="20" height="20" className="text-gray-600" />
                </div>
            </div>
        </footer>
    );
};

export default Footer;