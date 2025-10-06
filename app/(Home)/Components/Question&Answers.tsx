import React, { useState } from 'react';

const QuestionsAndAnswers = () => {
    const [openIndex, setOpenIndex] = useState(0); // First item open by default

    const faqData = [
        {
            question: "How does UmEmployed help job seekers find opportunities?",
            answer: "UmEmployed connects job seekers with thousands of professional opportunities across various industries. Our platform offers advanced search filters, personalized job recommendations, easy application processes, and tools to showcase your skills and experience to potential employers."
        },
        {
            question: "How can recruiters find qualified candidates on UmEmployed?",
            answer: "Recruiters can access our extensive database of professional candidates, post job listings, use advanced filtering to find specific skills and experience levels, and connect directly with qualified applicants. Our platform streamlines the hiring process and helps you find the right talent efficiently."
        },
        {
            question: "What makes UmEmployed different from other job platforms?",
            answer: "UmEmployed focuses on creating meaningful connections between job seekers and employers. We offer personalized matching, comprehensive candidate profiles, industry-specific categories, and user-friendly tools that make both job searching and recruiting more effective and efficient."
        },
        {
            question: "Is UmEmployed free to use for job seekers?",
            answer: "Yes, job seekers can create profiles, search jobs, and apply to positions completely free. We believe in removing barriers to employment opportunities and helping professionals advance their careers without financial constraints."
        },
        {
            question: "How do I get started on UmEmployed?",
            answer: "Getting started is easy! Simply create your account, build your professional profile with your skills and experience, upload your resume, and start browsing opportunities. For recruiters, you can post jobs and start searching our candidate database immediately after registration."
        }
    ];

    const toggleAccordion = (index:any) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="container mx-auto px-6 py-12 bg-brand3 rounded-2xl">
            <div className="md:w-[80%] mx-auto">
                  <h1 className='text-[27px] md:text-[40px] font-semibold text-white text-center'>
                    Questions & Answers
                        </h1>
                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <div key={index} className="border-b border-gray-200">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full py-6 flex justify-between items-center text-left transition-colors duration-200"
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-white pr-8">
                                    {item.question}
                                </h3>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${openIndex === index
                                        ? ' bg-brand2 text-white '
                                        : 'bg-brand text-white'
                                    }`}>
                                    <span className="text-xl font-light">
                                        {openIndex === index ? '−' : '+'}
                                    </span>
                                </div>
                            </button>

                            {openIndex === index && (
                                <div className="pb-6 pr-12 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-white/80 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-white/80 mb-2">
                        Can't find the answer? We can help.{' '}
                        <button className="text-brand hover:text-green-600 font-medium underline transition-colors">
                            Click here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuestionsAndAnswers;