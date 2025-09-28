"use client";
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface Message {
    id: number;
    sender: string;
    date: string;
    subject: string;
    preview: string;
    attachments: string[];
    read: boolean;
    category: 'primary' | 'social' | 'promotions';
}

interface MessageThread {
    sender: string;
    email: string;
    time: string;
    subject: string;
    content: string;
    requirements: string[];
    contact: string;
    attachments: { name: string; size: string }[];
    messages: { sender: string; content: string; time: string }[];
}

export default function Inbox() {
    const [activeCategory, setActiveCategory] = useState<'read' | 'unread' | 'primary'>('read');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<number | null>(1);
    const [replyText, setReplyText] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(true);

    const messages: Message[] = [
        {
            id: 1,
            sender: "Jenny Rio",
            date: "AUG 22",
            subject: "Work inquiry from google",
            preview: "Hello, This is Jenny from google. We're the largest online platform offer...",
            attachments: ["details.pdf"],
            read: true,
            category: "primary"
        },
        {
            id: 2,
            sender: "Hasan Islam",
            date: "MAY 22",
            subject: "Account Manager",
            preview: "Hello, Greeting from Uber. Hope you doing great. I am approving to you for...",
            attachments: ["details.pdf", "form.pdf"],
            read: true,
            category: "primary"
        },
        {
            id: 3,
            sender: "Jannatul Ferdaus",
            date: "JUN 22",
            subject: "Product Designer Opportunities",
            preview: "Hello, This is Jannat from HuntX. We offer business solution to our client...",
            attachments: [],
            read: false,
            category: "primary"
        },
        {
            id: 4,
            sender: "Jakie Chan",
            date: "NOV 22",
            subject: "Hunting Marketing Specialist",
            preview: "Hello, We're the well known Real Estate Inc provide best interior/exterior solutions...",
            attachments: [],
            read: false,
            category: "primary"
        }
    ];

    const thread: MessageThread = {
        sender: "Payment",
        email: "payoneer@inquiry.com",
        time: "4:45AM (3 hours ago)",
        subject: "Account Manager",
        content: `Hello, Greeting from Uber. Hope you doing great. I am approaching to you for as our company needs great & talented account manager...

    What we need from you to start:

    - Your CV
    - Verified Gov ID

    After that we need to redesign our landing page because the current one does not carry any information. If you have any question don't hesitate to contact us.

    Our Telegram @payoneer

    Thank you!`,
        requirements: ["Your CV", "Verified Gov ID"],
        contact: "@payoneer",
        attachments: [
            { name: "project-details.pdf", size: "2.3mb" },
            { name: "form.pdf", size: "1.3mb" }
        ],
        messages: [
            {
                sender: "Payment",
                content: `Hello, Greeting from Uber. Hope you doing great. I am approaching to you for as our company needs great & talented account manager...`,
                time: "4:45AM (3 hours ago)"
            },
            {
                sender: "You",
                content: `Hi, Mary Cooper!
Thanks for your invitation for the account manager position for your company. I will get back to you soon with all the required documents.`,
                time: "5:30AM (2 hours ago)"
            }
        ]
    };

    const handleSendReply = () => {
        if (replyText.trim()) {
            thread.messages.push({
                sender: "You",
                content: replyText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setReplyText('');
        }
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setSelectedMessage(null);
    };

    return (
        <div className="min-h-screen p-6 mb-20 overflow-auto">
            <div className="container mx-auto">
                <div className="p-4 flex items-center justify-between mb-6 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-brand3">Messages</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 bg-white rounded-lg">
                    {/* Left Sidebar - Inbox */}
                    <div className="lg:col-span-1 border-r border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                                <button className="bg-brand rounded-full w-6 h-6 flex items-center justify-center">
                                    <Icon icon="heroicons:plus-16-solid" className="text-white size-6" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Icon
                                    icon="heroicons:magnifying-glass-16-solid"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-6"
                                />
                                <input
                                    type="text"
                                    placeholder="Search contacts"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand2"
                                />
                            </div>

                            {/* Categories */}
                            <div className="flex space-x-4 mb-4">
                                {(['read', 'unread', 'primary'] as const).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                            activeCategory === category
                                                ? 'bg-blue-100 text-brand'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="divide-y divide-gray-200">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    onClick={() => {
                                        setSelectedMessage(message.id);
                                        setIsChatOpen(true);
                                    }}
                                    className={`p-4 cursor-pointer ${
                                        selectedMessage === message.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-brand">{message.sender}.</span>
                                        <span className="text-xs text-gray-500">{message.date}</span>
                                    </div>

                                    <h3 className="font-medium text-gray-800 mb-1">{message.subject}</h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 poppins-thin md:base">{message.preview}</p>

                                    {message.attachments.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            <Icon icon="heroicons:paper-clip-16-solid" className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Message Thread */}
                    <div className="lg:col-span-2 border-gray-200">
                        {selectedMessage && isChatOpen && (
                            <div className="p-6">
                                {/* Message Header with 3 dots */}
                                <div className="border-b border-gray-200 pb-4 mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{thread.subject}</h2>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="font-semibold text-gray-900">{thread.sender}</span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-brand">{thread.email}</span>
                                            </div>
                                        </div>
                                        <div className="relative flex items-center space-x-2">
                                            <button
                                                onClick={handleCloseChat}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <Icon icon="heroicons:x-mark-20-solid" className="size-6 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <Icon icon="heroicons:ellipsis-vertical-16-solid" className="size-6 text-gray-500" />
                                            </button>
                                            {dropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => {/* Handle Reply action */ }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                                    >
                                                        Reply
                                                    </button>
                                                    <button
                                                        onClick={() => {/* Handle Forward action */ }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Forward
                                                    </button>
                                                    <button
                                                        onClick={() => {/* Handle Block action */ }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Block
                                                    </button>
                                                    <button
                                                        onClick={() => {/* Handle Delete action */ }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="prose prose-gray max-w-none mb-6 poppins-thin">
                                    {thread.messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-4 p-4 rounded-lg ${
                                                msg.sender === "You"
                                                    ? 'bg-blue-50 ml-auto max-w-[80%]'
                                                    : 'bg-gray-100 mr-auto max-w-[80%]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-gray-900">{msg.sender}</span>
                                                <span className="text-xs text-gray-500">{msg.time}</span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-line">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Attachments */}
                                <div className="border-t pt-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">{thread.attachments.length} Attachment{thread.attachments.length > 1 ? 's' : ''}</h3>
                                        <button className="flex items-center space-x-2 text-brand hover:text-blue-700">
                                            <Icon icon="heroicons:arrow-down-tray-16-solid" className="size-6" />
                                            <span className="text-sm font-medium">Download All</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {thread.attachments.map((attachment, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Icon icon="heroicons:paper-clip-16-solid" className="size-6 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{attachment.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">{attachment.size}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reply Section */}
                                <div className="border-t pt-6">
                                    <div className="border border-gray-300 rounded-lg">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your message..."
                                            className="w-full h-24 p-4 focus:outline-none resize-none text-sm bg-transparent"
                                        />
                                        <div className="flex justify-between items-center p-3 border-t border-gray-300">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    <Icon icon="heroicons:paper-clip-16-solid" className="size-6 text-gray-600" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    <Icon icon="heroicons:face-smile-16-solid" className="size-6 text-gray-600" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    <Icon icon="solar:trash-bin-trash-line-duotone" className="size-6 text-gray-600" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleSendReply}
                                                className="bg-brand3 text-white px-6 py-2.5 rounded-full hover:bg-brand transition-colors text-sm font-medium"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}