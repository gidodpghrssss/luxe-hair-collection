import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    content:
      'The quality of these hair extensions is unmatched. I've tried many brands over the years, but Luxe Hair Collection truly stands out. The hair feels natural, blends perfectly with my own, and lasts much longer than any other brand I've used.',
    author: 'Sophia Martinez',
    role: 'Professional Stylist',
    image: '/images/testimonial-1.jpg',
  },
  {
    id: 2,
    content:
      'I was hesitant to invest in a high-quality wig, but it was worth every penny. The customer service team helped me find the perfect match for my skin tone and face shape. I receive compliments everywhere I go!',
    author: 'Jasmine Williams',
    role: 'Loyal Customer',
    image: '/images/testimonial-2.jpg',
  },
  {
    id: 3,
    content:
      'As a salon owner, I only recommend products I truly believe in. Luxe Hair Collection has become my go-to brand for clients seeking premium hair solutions. The consistency in quality and the range of options make it perfect for all my clients.',
    author: 'Rebecca Johnson',
    role: 'Salon Owner',
    image: '/images/testimonial-3.jpg',
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  
  // Auto-advance the slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  const next = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prev = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="section-heading text-center">What Our Customers Say</h2>
        <div className="mt-10 relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
                  <Image
                    src={testimonials[current].image}
                    alt={testimonials[current].author}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="max-w-3xl mx-auto">
                  <p className="text-lg italic text-gray-600 mb-6">"{testimonials[current].content}"</p>
                  <p className="font-medium text-gray-900">{testimonials[current].author}</p>
                  <p className="text-sm text-gray-500">{testimonials[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center">
            <button
              onClick={prev}
              className="rounded-full p-2 bg-white shadow-md hover:bg-gray-50 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center justify-center">
            <button
              onClick={next}
              className="rounded-full p-2 bg-white shadow-md hover:bg-gray-50 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  current === index ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
