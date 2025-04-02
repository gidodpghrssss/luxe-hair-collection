import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Sample product data - in a real app, this would come from an API
const products = [
  {
    id: 1,
    name: 'Brazilian Body Wave Wig',
    href: '/product/brazilian-body-wave-wig',
    price: '$249.99',
    imageSrc: '/images/product-1.jpg',
    imageAlt: 'Brazilian Body Wave Wig',
    rating: 5,
    reviewCount: 38,
    tags: ['New', 'Bestseller'],
  },
  {
    id: 2,
    name: 'Peruvian Straight Hair Extensions',
    href: '/product/peruvian-straight-hair-extensions',
    price: '$179.99',
    imageSrc: '/images/product-2.jpg',
    imageAlt: 'Peruvian Straight Hair Extensions',
    rating: 4.5,
    reviewCount: 21,
    tags: ['Sale'],
  },
  {
    id: 3,
    name: 'Malaysian Curly Lace Frontal',
    href: '/product/malaysian-curly-lace-frontal',
    price: '$159.99',
    imageSrc: '/images/product-3.jpg',
    imageAlt: 'Malaysian Curly Lace Frontal',
    rating: 4.8,
    reviewCount: 42,
    tags: ['Bestseller'],
  },
  {
    id: 4,
    name: 'Indian Remy Hair Bundles',
    href: '/product/indian-remy-hair-bundles',
    price: '$129.99',
    imageSrc: '/images/product-4.jpg',
    imageAlt: 'Indian Remy Hair Bundles',
    rating: 4.7,
    reviewCount: 16,
    tags: ['New'],
  },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="section-heading">Featured Products</h2>
          <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tag === 'New'
                          ? 'bg-primary-100 text-primary-800'
                          : tag === 'Sale'
                          ? 'bg-accent-100 text-accent-800'
                          : 'bg-secondary-100 text-secondary-800'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    <Link href={product.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <div className="mt-1 flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <svg
                        key={rating}
                        className={`h-4 w-4 flex-shrink-0 ${
                          product.rating > rating ? 'text-accent-400' : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">{product.price}</p>
              </div>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full btn-primary py-2 text-sm">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
