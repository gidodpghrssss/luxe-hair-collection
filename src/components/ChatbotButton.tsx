import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Hi there! 👋 How can I help you with our hair products today?', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages([...messages, { text: inputValue, isUser: true }]);
    setInputValue('');

    // Simulate AI response (in a real app, this would call the AI API)
    setTimeout(() => {
      handleAIResponse(inputValue);
    }, 1000);
  };

  const handleAIResponse = (query: string) => {
    // Simple response logic - in a real app, this would be replaced with actual AI integration
    let response = '';
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
      response = 'We offer free shipping on all orders over $100. Standard shipping takes 3-5 business days, and express shipping is available for an additional fee.';
    } else if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
      response = 'We have a 30-day return policy. If you\'re not satisfied with your purchase, you can return it for a full refund within 30 days of delivery.';
    } else if (lowerQuery.includes('quality') || lowerQuery.includes('real hair')) {
      response = 'All our products are made from 100% real human hair, ethically sourced and carefully processed to maintain the highest quality.';
    } else if (lowerQuery.includes('wig') || lowerQuery.includes('wigs')) {
      response = 'Our wigs are available in various styles, lengths, and colors. They feature natural hairlines and are customizable to fit your needs.';
    } else if (lowerQuery.includes('extension') || lowerQuery.includes('extensions')) {
      response = 'We offer clip-in, tape-in, and sew-in extensions in different lengths and textures. All our extensions blend seamlessly with your natural hair.';
    } else if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      response = 'Our prices vary depending on the product type, length, and style. You can view detailed pricing on each product page.';
    } else if (lowerQuery.includes('try on') || lowerQuery.includes('virtual')) {
      response = 'Yes! We have a virtual try-on feature that lets you see how our products would look on you. You can access it from the "Virtual Try-On" page.';
    } else {
      response = 'Thank you for your question. I\'d be happy to help with that. Could you provide more details so I can give you the most accurate information?';
    }

    setMessages([...messages, { text: inputValue, isUser: true }, { text: response, isUser: false }]);
  };

  // Quick question suggestions
  const quickQuestions = [
    'How long does shipping take?',
    'What\'s your return policy?',
    'Do you offer customization?',
    'How to use the virtual try-on?',
  ];

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label="Chat with us"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className="bg-primary-600 p-4 text-white">
              <h3 className="font-medium">Luxe Hair Assistant</h3>
              <p className="text-xs text-white/80">Ask me anything about our products</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '350px' }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setMessages([...messages, { text: question, isUser: true }]);
                        setTimeout(() => handleAIResponse(question), 1000);
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t p-4 flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 border-0 focus:ring-0 text-sm"
              />
              <button
                type="submit"
                className="ml-2 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
