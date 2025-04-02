import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNebiusChat, ChatMessage } from '@/lib/chatbot';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, ShoppingBagIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

// Define the AdminLayout props interface
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Admin-specific system prompt for the Nebius AI
const ADMIN_SYSTEM_PROMPT = `You are an AI business assistant for Luxe Hair Collection, a premium brand selling high-quality hair products.
Your purpose is to help the business owner/admin with analytics, inventory management, marketing strategies, and customer insights.

You have access to the following business data (though you'll need to ask the admin for specific numbers):
- Sales data: revenue, popular products, trends
- Inventory levels and product performance
- Customer demographics and purchase patterns
- Marketing campaign performance

Please provide data-driven insights, actionable recommendations, and help the admin make informed business decisions.
Be professional, strategic, and focus on business growth and efficiency.`;

// Define the suggestion category interface
interface SuggestionCategory {
  name: string;
  icon: React.ReactNode;
  suggestions: string[];
}

// Suggestion categories with icons
const suggestionCategories: SuggestionCategory[] = [
  {
    name: 'Sales Analytics',
    icon: <ChartBarIcon className="h-5 w-5" />,
    suggestions: [
      'Analyze our sales performance this month',
      'Which products are trending right now?',
      'Compare revenue from last month to this month',
      'What days of the week have the highest sales?'
    ]
  },
  {
    name: 'Inventory',
    icon: <ShoppingBagIcon className="h-5 w-5" />,
    suggestions: [
      'Which products are low in stock?',
      'Should we restock any items soon?',
      'Which hair lengths are selling fastest?',
      'Analyze inventory turnover rate'
    ]
  },
  {
    name: 'Customers',
    icon: <UserGroupIcon className="h-5 w-5" />,
    suggestions: [
      'What is our customer retention rate?',
      'Analyze customer demographics',
      'Which customers spend the most?',
      'Customer feedback analysis'
    ]
  },
  {
    name: 'Marketing',
    icon: <TagIcon className="h-5 w-5" />,
    suggestions: [
      'Suggest marketing strategies for this season',
      'How effective was our last promotion?',
      'Ideas for increasing our social media engagement',
      'Email marketing campaign suggestions'
    ]
  }
];

export default function AIAssistant() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use our Nebius-powered chat hook with admin-specific system prompt
  const { messages, isLoading, error, sendMessage, resetChat } = useNebiusChat({
    systemPrompt: ADMIN_SYSTEM_PROMPT,
    temperature: 0.3, // Lower temperature for more focused business responses
    maxTokens: 1500, // Allow longer responses for detailed analysis
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct', // Specify the model to use
  });

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleSuggestion = (suggestion: string) => {
    if (!isLoading) {
      sendMessage(suggestion);
    }
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">AI Business Assistant</h1>
          <p className="mt-1 text-sm text-gray-500">
            Powered by Nebius AI - Get insights, recommendations, and assistance for your business
          </p>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Suggestions sidebar */}
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-1">
              <h2 className="font-medium text-gray-900 mb-4">Ask me about...</h2>
              
              <div className="space-y-4">
                {suggestionCategories.map((category, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setActiveCategory(index)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-md ${
                        activeCategory === index
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`mr-2 ${activeCategory === index ? 'text-primary-600' : 'text-gray-500'}`}>
                        {category.icon}
                      </span>
                      {category.name}
                    </button>
                    
                    {activeCategory === index && (
                      <div className="mt-2 ml-9 space-y-2">
                        {category.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestion(suggestion)}
                            disabled={isLoading}
                            className="text-sm text-gray-600 hover:text-primary-600 block"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">About this assistant</h3>
                <p className="text-sm text-gray-500">
                  This AI assistant uses Nebius's advanced language model to provide business insights and recommendations based on your data. All conversations are private and secure.
                </p>
                <button
                  onClick={resetChat}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-800"
                >
                  Start new conversation
                </button>
              </div>
            </div>
            
            {/* Chat area */}
            <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-12rem)] lg:col-span-3">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length <= 1 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Welcome to your AI Business Assistant</h4>
                    <p className="text-gray-600 mb-6">
                      I can help you analyze sales data, manage inventory, understand customer trends, and develop marketing strategies. What would you like to know today?
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[80%]">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
                          {error}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about your business..."
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className={`bg-primary-600 text-white rounded-r-lg px-4 py-2 ${
                      isLoading || !inputValue.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-primary-700'
                    }`}
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
