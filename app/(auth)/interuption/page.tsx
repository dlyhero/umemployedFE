        'use client';
        import React, { useState, useEffect } from 'react';
        import { Clock, Wrench } from 'lucide-react';

        const ServiceInterruptionPage: React.FC = () => {
        const [timeLeft, setTimeLeft] = useState<number>(300);

        useEffect(() => {
            if (timeLeft <= 0) return;
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }, [timeLeft]);

        const formatTime = (seconds: number): string => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        };

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="text-center max-w-2xl">
                {/* Illustration Area */}
                <div className="relative mb-12">
                {/* Floating decorative circles */}
                <div className="absolute -top-16 -left-8 w-8 h-8 bg-yellow-400 rounded-full"></div>
                <div className="absolute -top-8 right-12 w-6 h-6 bg-green-400 rounded-full"></div>
                <div className="absolute top-20 -right-12 w-4 h-4 bg-blue-400 rounded-full"></div>
                
                {/* Main character illustration */}
                <div className="relative inline-block">
                    {/* Head */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-gray-900 relative mx-auto mb-4">
                    {/* Eyes */}
                    <div className="absolute top-8 left-6 w-8 h-8 bg-cyan-400 rounded-full border-2 border-gray-900"></div>
                    <div className="absolute top-8 right-6 w-8 h-8 bg-cyan-400 rounded-full border-2 border-gray-900"></div>
                    {/* Pupils */}
                    <div className="absolute top-10 left-8 w-4 h-4 bg-gray-900 rounded-full"></div>
                    <div className="absolute top-10 right-8 w-4 h-4 bg-gray-900 rounded-full"></div>
                    {/* Mouth */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-4 border-gray-900 rounded-full"></div>
                    </div>
                    
                    {/* Body */}
                    <div className="w-24 h-32 bg-gray-900 rounded-t-full mx-auto relative">
                    {/* Arms */}
                    <div className="absolute -left-8 top-4 w-16 h-6 bg-white border-4 border-gray-900 rounded-full transform rotate-12"></div>
                    <div className="absolute -right-8 top-4 w-16 h-6 bg-white border-4 border-gray-900 rounded-full transform -rotate-12"></div>
                    {/* Hands with tools */}
                    <div className="absolute -left-12 top-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-gray-900" />
                    </div>
                    <div className="absolute -right-12 top-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-gray-900"></div>
                    </div>
                </div>
                
                {/* Warning sign */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400 transform rotate-12 flex items-center justify-center border-2 border-gray-900">
                    <span className="text-gray-900 font-black text-lg">!</span>
                </div>
                </div>

                {/* Main content */}
                <div className="space-y-6">
                {/* <div className="text-right mb-8">
                    <span className="text-6xl font-black text-teal-600">503</span>
                </div>
                */}
                <h1 className="text-4xl font-black text-gray-900">Under Maintenance</h1>
                
                <p className="text-lg text-gray-600 max-w-md mx-auto mb-6">
                    We're currently improving our services. Please check back in a few minutes.
                </p>
                
                
                </div>
            </div>
            </div>
        );
        };

        export default ServiceInterruptionPage;