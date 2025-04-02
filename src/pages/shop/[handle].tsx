import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { ShoppingBagIcon, HeartIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import { getProductByHandle } from '@/lib/shopify';

// Product interface
interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        originalSrc: string;
        altText: string | null;
      };
    }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: string;
        availableForSale: boolean;
        selectedOptions: {
          name: string;
          value: string;
        }[];
      };
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
  tags: string[];
}

// Mock reviews data
const reviews = {
  average: 4.8,
  totalCount: 117,
  counts: [
    { rating: 5, count: 85 },
    { rating: 4, count: 27 },
    { rating: 3, count: 3 },
    { rating: 2, count: 1 },
    { rating: 1, count: 1 },
  ],
  featured: [
    {
      id: 1,
      rating: 5,
      content: `
        I absolutely love this hair! It's so soft and natural looking. I've been wearing it for 3 weeks now and it still looks amazing. The quality is outstanding and it blends perfectly with my natural hair.
      `,
      author: 'Emily Johnson',
      date: 'May 16, 2023',
    },
    {
      id: 2,
      rating: 5,
      content: `
        This is my third purchase from Luxe Hair and I'm never disappointed. The hair is true to length, minimal shedding, and holds a curl beautifully. Highly recommend!
      `,
      author: 'Sophia Williams',
      date: 'April 23, 2023',
    },
    {
      id: 3,
      rating: 4,
      content: `
        Great quality hair! The only reason I'm giving 4 stars instead of 5 is because it took a bit longer to arrive than expected. But the product itself is amazing.
      `,
      author: 'Olivia Martinez',
      date: 'March 12, 2023',
    },
  ],
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProductDetail() {
  const router = useRouter();
  const { handle } = router.query;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!handle || typeof handle !== 'string') return;
      
      try {
        // In a real implementation, this would be an actual API call
        // For now, we'll use placeholder data
        
        // Simulate product data based on handle
        const mockProduct: Product = {
          id: 'gid://shopify/Product/1',
          title: handle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          handle: handle as string,
          description: 'Premium quality hair product made from 100% real human hair. Ethically sourced and carefully processed to maintain the highest quality. Double-drawn for consistent thickness from root to tip.',
          descriptionHtml: '<p>Premium quality hair product made from 100% real human hair. Ethically sourced and carefully processed to maintain the highest quality. Double-drawn for consistent thickness from root to tip.</p><ul><li>100% real human hair</li><li>Can be colored, permed, and styled</li><li>Minimal shedding and tangling</li><li>Lasts up to 12 months with proper care</li></ul>',
          priceRange: {
            minVariantPrice: {
              amount: '249.99',
              currencyCode: 'USD',
            },
          },
          images: {
            edges: [
              {
                node: {
                  originalSrc: '/images/product-detail-1.jpg',
                  altText: 'Product Image 1',
                },
              },
              {
                node: {
                  originalSrc: '/images/product-detail-2.jpg',
                  altText: 'Product Image 2',
                },
              },
              {
                node: {
                  originalSrc: '/images/product-detail-3.jpg',
                  altText: 'Product Image 3',
                },
              },
              {
                node: {
                  originalSrc: '/images/product-detail-4.jpg',
                  altText: 'Product Image 4',
                },
              },
            ],
          },
          variants: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/ProductVariant/1',
                  title: '14" / Natural Black',
                  price: '249.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '14"' },
                    { name: 'Color', value: 'Natural Black' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/2',
                  title: '16" / Natural Black',
                  price: '279.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '16"' },
                    { name: 'Color', value: 'Natural Black' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/3',
                  title: '18" / Natural Black',
                  price: '309.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '18"' },
                    { name: 'Color', value: 'Natural Black' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/4',
                  title: '20" / Natural Black',
                  price: '339.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '20"' },
                    { name: 'Color', value: 'Natural Black' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/5',
                  title: '14" / Dark Brown',
                  price: '249.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '14"' },
                    { name: 'Color', value: 'Dark Brown' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/6',
                  title: '16" / Dark Brown',
                  price: '279.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '16"' },
                    { name: 'Color', value: 'Dark Brown' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/7',
                  title: '18" / Dark Brown',
                  price: '309.99',
                  availableForSale: true,
                  selectedOptions: [
                    { name: 'Length', value: '18"' },
                    { name: 'Color', value: 'Dark Brown' },
                  ],
                },
              },
              {
                node: {
                  id: 'gid://shopify/ProductVariant/8',
                  title: '20" / Dark Brown',
                  price: '339.99',
                  availableForSale: false,
                  selectedOptions: [
                    { name: 'Length', value: '20"' },
                    { name: 'Color', value: 'Dark Brown' },
                  ],
                },
              },
            ],
          },
          options: [
            {
              name: 'Length',
              values: ['14"', '16"', '18"', '20"'],
            },
            {
              name: 'Color',
              values: ['Natural Black', 'Dark Brown'],
            },
          ],
          tags: ['Brazilian', 'Body Wave', 'Human Hair'],
        };

        setProduct(mockProduct);
        
        // Set default selected options
        if (mockProduct.options.length > 0) {
          const defaultOptions: { [key: string]: string } = {};
          mockProduct.options.forEach(option => {
            defaultOptions[option.name] = option.values[0];
          });
          setSelectedOptions(defaultOptions);
        }
        
        // Set default selected variant
        if (mockProduct.variants.edges.length > 0) {
          setSelectedVariant(mockProduct.variants.edges[0].node.id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [handle]);

  // Find the current variant based on selected options
  const findVariantByOptions = () => {
    if (!product) return null;
    
    return product.variants.edges.find(({ node }) => {
      return node.selectedOptions.every(
        option => selectedOptions[option.name] === option.value
      );
    })?.node || null;
  };

  // Update selected variant when options change
  useEffect(() => {
    const variant = findVariantByOptions();
    if (variant) {
      setSelectedVariant(variant.id);
    }
  }, [selectedOptions]);

  // Handle option selection
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    
    setIsAddingToCart(true);
    
    try {
      // In a real implementation, this would call the Shopify API to add the item to cart
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Get current variant
  const currentVariant = product?.variants.edges.find(
    ({ node }) => node.id === selectedVariant
  )?.node;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/shop')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Shop
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{product.title} | Luxe Hair Collection</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="bg-white">
        <div className="pt-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb">
            <ol role="list" className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
              <li>
                <div className="flex items-center">
                  <a href="/shop" className="mr-2 text-sm font-medium text-gray-900">
                    Shop
                  </a>
                  <svg
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li className="text-sm">
                <a href="#" className="font-medium text-gray-500 hover:text-gray-600">
                  {product.title}
                </a>
              </li>
            </ol>
          </nav>

          {/* Product */}
          <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            {/* Product gallery */}
            <div className="lg:col-span-1 lg:border-r lg:border-gray-200 lg:pr-8">
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                <Image
                  src={product.images.edges[activeImage].node.originalSrc}
                  alt={product.images.edges[activeImage].node.altText || product.title}
                  width={800}
                  height={800}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              
              {/* Image thumbnails */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.edges.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={classNames(
                      'relative aspect-w-1 aspect-h-1 overflow-hidden rounded-md',
                      activeImage === index ? 'ring-2 ring-primary-500' : 'ring-1 ring-gray-200'
                    )}
                  >
                    <Image
                      src={image.node.originalSrc}
                      alt={image.node.altText || `Thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900">{product.title}</h1>
              
              {/* Reviews */}
              <div className="mt-3">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={classNames(
                          reviews.average > rating ? 'text-yellow-400' : 'text-gray-300',
                          'h-5 w-5 flex-shrink-0'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="ml-3 text-sm font-medium text-primary-600 hover:text-primary-500">
                    {reviews.totalCount} reviews
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4">
                <p className="text-2xl tracking-tight text-gray-900">
                  ${currentVariant ? parseFloat(currentVariant.price).toFixed(2) : parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div className="mt-6">
                <div
                  className="space-y-6 text-base text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <form>
                  {/* Options */}
                  {product.options.map((option) => (
                    <div key={option.name} className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900">{option.name}</h3>
                      <div className="mt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {option.values.map((value) => {
                            // Check if this option combination is available
                            const isAvailable = product.variants.edges.some(
                              ({ node }) =>
                                node.selectedOptions.some(
                                  (opt) => opt.name === option.name && opt.value === value
                                ) &&
                                node.availableForSale &&
                                Object.entries(selectedOptions)
                                  .filter(([key]) => key !== option.name)
                                  .every(
                                    ([key, val]) =>
                                      node.selectedOptions.some(
                                        (opt) => opt.name === key && opt.value === val
                                      )
                                  )
                            );

                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => handleOptionChange(option.name, value)}
                                disabled={!isAvailable}
                                className={classNames(
                                  'rounded-md py-2 px-4 text-sm font-medium',
                                  selectedOptions[option.name] === value
                                    ? 'bg-primary-600 text-white'
                                    : isAvailable
                                    ? 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                )}
                              >
                                {value}
                                {!isAvailable && ' (Sold out)'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Quantity */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                    <div className="mt-2 flex items-center">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="rounded-l-md border border-r-0 border-gray-300 bg-white py-2 px-3 text-gray-400 hover:bg-gray-50 focus:outline-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                        min="1"
                        max="10"
                        className="w-16 border-gray-300 text-center focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= 10}
                        className="rounded-r-md border border-l-0 border-gray-300 bg-white py-2 px-3 text-gray-400 hover:bg-gray-50 focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to cart */}
                  <div className="mt-10 flex sm:flex-col1">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!currentVariant?.availableForSale || isAddingToCart}
                      className={classNames(
                        'max-w-xs flex-1 items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-full',
                        currentVariant?.availableForSale && !isAddingToCart
                          ? 'bg-primary-600 hover:bg-primary-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      )}
                    >
                      {isAddingToCart ? (
                        <div className="flex items-center">
                          <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                          Adding...
                        </div>
                      ) : currentVariant?.availableForSale ? (
                        <div className="flex items-center">
                          <ShoppingBagIcon className="h-5 w-5 mr-2" />
                          Add to Cart
                        </div>
                      ) : (
                        'Sold Out'
                      )}
                    </button>

                    <button
                      type="button"
                      className="ml-4 flex items-center justify-center rounded-md py-3 px-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                      <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">Add to favorites</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Shipping and returns */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900">Shipping & Returns</h2>
                <div className="mt-4 space-y-4 text-sm text-gray-600">
                  <p>
                    Free shipping on orders over $100. Standard shipping takes 3-5 business days.
                  </p>
                  <p>
                    30-day return policy for unused products in original packaging. Custom orders cannot be returned unless there's a manufacturing defect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
            <h2 className="text-2xl font-serif font-bold tracking-tight text-gray-900">Customer Reviews</h2>
            
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
              {/* Review summary */}
              <div>
                <div className="flex items-center">
                  <p className="text-3xl font-bold tracking-tight text-gray-900">{reviews.average.toFixed(1)}</p>
                  <div className="ml-4">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            reviews.average > rating ? 'text-yellow-400' : 'text-gray-300',
                            'h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{reviews.totalCount} reviews</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Rating breakdown</h3>

                  <div className="mt-2 space-y-2">
                    {reviews.counts.map((count) => (
                      <div key={count.rating} className="flex items-center text-sm">
                        <div className="flex flex-1 items-center">
                          <p className="w-6 text-gray-900">{count.rating}</p>
                          <div className="ml-1 flex flex-1 items-center">
                            <StarIcon
                              className={classNames(
                                count.count > 0 ? 'text-yellow-400' : 'text-gray-300',
                                'h-5 w-5 flex-shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            <div className="relative ml-3 flex-1">
                              <div className="h-3 rounded-full border border-gray-200 bg-gray-100"></div>
                              <div
                                className="absolute inset-y-0 rounded-full bg-yellow-400"
                                style={{
                                  width: `${(count.count / reviews.totalCount) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <p className="ml-4 w-10 text-right text-sm text-gray-600">
                          {Math.round((count.count / reviews.totalCount) * 100)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="text-sm font-medium text-gray-900">Write a review</h3>
                  <button
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto"
                  >
                    Write a Review
                  </button>
                </div>
              </div>

              {/* Review list */}
              <div className="mt-16 lg:mt-0">
                <h3 className="text-sm font-medium text-gray-900">Recent reviews</h3>

                <div className="mt-4 space-y-6">
                  {reviews.featured.map((review) => (
                    <div key={review.id} className="border-t border-gray-200 pt-4">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={classNames(
                                review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-5 w-5 flex-shrink-0'
                              )}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="ml-2 text-sm font-medium text-gray-900">{review.author}</p>
                        <p className="ml-4 text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">{review.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
