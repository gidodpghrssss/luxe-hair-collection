import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getProducts, getCollections } from '@/lib/shopify';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
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
  tags: string[];
}

interface Collection {
  id: string;
  title: string;
  handle: string;
}

const sortOptions = [
  { name: 'Most Popular', value: 'popularity' },
  { name: 'Newest', value: 'newest' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
];

const hairTypes = [
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'kinky', label: 'Kinky Curly' },
];

const hairLengths = [
  { value: '8-12', label: '8"-12" (Short)' },
  { value: '14-18', label: '14"-18" (Medium)' },
  { value: '20-24', label: '20"-24" (Long)' },
  { value: '26-30', label: '26"-30" (Extra Long)' },
];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedHairTypes, setSelectedHairTypes] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products and collections on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // In a real implementation, these would be actual API calls
        // For now, we'll use placeholder data
        
        // Simulated products data
        const productsData = [
          {
            id: 'prod1',
            title: 'Brazilian Body Wave Wig',
            handle: 'brazilian-body-wave-wig',
            description: 'Premium quality Brazilian body wave wig with natural hairline.',
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
                    originalSrc: '/images/product-1.jpg',
                    altText: 'Brazilian Body Wave Wig',
                  },
                },
              ],
            },
            tags: ['Wig', 'Body Wave', 'Brazilian', '18-inch'],
          },
          {
            id: 'prod2',
            title: 'Peruvian Straight Hair Extensions',
            handle: 'peruvian-straight-hair-extensions',
            description: 'Silky smooth Peruvian straight hair extensions that blend perfectly.',
            priceRange: {
              minVariantPrice: {
                amount: '179.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-2.jpg',
                    altText: 'Peruvian Straight Hair Extensions',
                  },
                },
              ],
            },
            tags: ['Extensions', 'Straight', 'Peruvian', '20-inch'],
          },
          {
            id: 'prod3',
            title: 'Malaysian Curly Lace Frontal',
            handle: 'malaysian-curly-lace-frontal',
            description: 'Natural looking Malaysian curly lace frontal with pre-plucked hairline.',
            priceRange: {
              minVariantPrice: {
                amount: '159.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-3.jpg',
                    altText: 'Malaysian Curly Lace Frontal',
                  },
                },
              ],
            },
            tags: ['Frontal', 'Curly', 'Malaysian', '16-inch'],
          },
          {
            id: 'prod4',
            title: 'Indian Remy Hair Bundles',
            handle: 'indian-remy-hair-bundles',
            description: 'Premium Indian Remy hair bundles, double drawn and tangle-free.',
            priceRange: {
              minVariantPrice: {
                amount: '129.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-4.jpg',
                    altText: 'Indian Remy Hair Bundles',
                  },
                },
              ],
            },
            tags: ['Bundles', 'Straight', 'Indian', '22-inch'],
          },
          {
            id: 'prod5',
            title: 'Brazilian Deep Wave Bundles',
            handle: 'brazilian-deep-wave-bundles',
            description: 'Luxurious Brazilian deep wave hair bundles with natural shine.',
            priceRange: {
              minVariantPrice: {
                amount: '149.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-5.jpg',
                    altText: 'Brazilian Deep Wave Bundles',
                  },
                },
              ],
            },
            tags: ['Bundles', 'Deep Wave', 'Brazilian', '24-inch'],
          },
          {
            id: 'prod6',
            title: 'Peruvian Kinky Curly Wig',
            handle: 'peruvian-kinky-curly-wig',
            description: 'Full and voluminous Peruvian kinky curly wig for a natural look.',
            priceRange: {
              minVariantPrice: {
                amount: '279.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-6.jpg',
                    altText: 'Peruvian Kinky Curly Wig',
                  },
                },
              ],
            },
            tags: ['Wig', 'Kinky Curly', 'Peruvian', '16-inch'],
          },
          {
            id: 'prod7',
            title: 'Malaysian Straight Lace Closure',
            handle: 'malaysian-straight-lace-closure',
            description: 'Seamless Malaysian straight lace closure for a flawless finish.',
            priceRange: {
              minVariantPrice: {
                amount: '89.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-7.jpg',
                    altText: 'Malaysian Straight Lace Closure',
                  },
                },
              ],
            },
            tags: ['Closure', 'Straight', 'Malaysian', '14-inch'],
          },
          {
            id: 'prod8',
            title: 'Indian Wavy Tape-In Extensions',
            handle: 'indian-wavy-tape-in-extensions',
            description: 'Easy to apply Indian wavy tape-in extensions for added volume and length.',
            priceRange: {
              minVariantPrice: {
                amount: '169.99',
                currencyCode: 'USD',
              },
            },
            images: {
              edges: [
                {
                  node: {
                    originalSrc: '/images/product-8.jpg',
                    altText: 'Indian Wavy Tape-In Extensions',
                  },
                },
              ],
            },
            tags: ['Extensions', 'Wavy', 'Indian', '18-inch'],
          },
        ];

        // Simulated collections data
        const collectionsData = [
          { id: 'col1', title: 'Wigs', handle: 'wigs' },
          { id: 'col2', title: 'Extensions', handle: 'extensions' },
          { id: 'col3', title: 'Closures & Frontals', handle: 'closures-frontals' },
          { id: 'col4', title: 'Bundles', handle: 'bundles' },
          { id: 'col5', title: 'New Arrivals', handle: 'new-arrivals' },
          { id: 'col6', title: 'Best Sellers', handle: 'best-sellers' },
        ];

        setProducts(productsData);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort products based on selected options
  const filteredProducts = products
    .filter((product) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((product) => {
      // Filter by collection
      if (selectedCollection) {
        // In a real implementation, this would check if the product belongs to the selected collection
        // For now, we'll use a simple check based on the collection name and product tags
        const collectionTitle = collections.find((c) => c.handle === selectedCollection)?.title || '';
        return product.tags.some((tag) => tag.includes(collectionTitle.split(' ')[0]));
      }
      return true;
    })
    .filter((product) => {
      // Filter by hair type
      if (selectedHairTypes.length > 0) {
        return selectedHairTypes.some((type) =>
          product.tags.some((tag) => tag.toLowerCase().includes(type.toLowerCase()))
        );
      }
      return true;
    })
    .filter((product) => {
      // Filter by length
      if (selectedLengths.length > 0) {
        // In a real implementation, this would check the product's length attribute
        // For now, we'll use a simple check based on the product tags
        return selectedLengths.some((lengthRange) => {
          const [min, max] = lengthRange.split('-').map(Number);
          const productLength = product.tags
            .find((tag) => tag.includes('-inch'))
            ?.replace('-inch', '')
            .trim();
          if (productLength) {
            const length = parseInt(productLength, 10);
            return length >= min && length <= max;
          }
          return false;
        });
      }
      return true;
    })
    .sort((a, b) => {
      // Sort products
      switch (sortBy) {
        case 'price-asc':
          return (
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
          );
        case 'price-desc':
          return (
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
          );
        case 'newest':
          // In a real implementation, this would sort by creation date
          // For now, we'll use the product ID as a proxy for newness
          return b.id.localeCompare(a.id);
        case 'popularity':
        default:
          // In a real implementation, this would sort by popularity metrics
          // For now, we'll use a random order
          return 0;
      }
    });

  const handleHairTypeChange = (value: string) => {
    setSelectedHairTypes((prev) =>
      prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]
    );
  };

  const handleLengthChange = (value: string) => {
    setSelectedLengths((prev) =>
      prev.includes(value) ? prev.filter((length) => length !== value) : [...prev, value]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the filteredProducts computation
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCollection(null);
    setSelectedHairTypes([]);
    setSelectedLengths([]);
    setSortBy('popularity');
  };

  return (
    <Layout>
      <Head>
        <title>Shop | Luxe Hair Collection</title>
        <meta
          name="description"
          content="Shop our premium collection of high-quality hair products including wigs, extensions, closures, and more."
        />
      </Head>

      <div className="bg-white">
        <div>
          {/* Mobile filter dialog */}
          <div
            className={`relative z-40 lg:hidden ${
              mobileFiltersOpen ? 'block' : 'hidden'
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25"></div>

            <div className="fixed inset-0 z-40 flex">
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <div className="mt-4 border-t border-gray-200">
                  <h3 className="sr-only">Categories</h3>
                  <ul role="list" className="px-2 py-3 font-medium text-gray-900">
                    {collections.map((collection) => (
                      <li key={collection.handle}>
                        <button
                          onClick={() => setSelectedCollection(collection.handle)}
                          className={`block px-2 py-3 ${
                            selectedCollection === collection.handle
                              ? 'text-primary-600'
                              : 'text-gray-900 hover:text-primary-600'
                          }`}
                        >
                          {collection.title}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-200 px-4 py-6">
                    <h3 className="-mx-2 -my-3 flow-root">
                      <span className="font-medium text-gray-900">Hair Type</span>
                    </h3>
                    <div className="pt-6">
                      <div className="space-y-4">
                        {hairTypes.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`hair-type-${option.value}`}
                              name="hair-type[]"
                              value={option.value}
                              type="checkbox"
                              checked={selectedHairTypes.includes(option.value)}
                              onChange={() => handleHairTypeChange(option.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`hair-type-${option.value}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6">
                    <h3 className="-mx-2 -my-3 flow-root">
                      <span className="font-medium text-gray-900">Length</span>
                    </h3>
                    <div className="pt-6">
                      <div className="space-y-4">
                        {hairLengths.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`length-${option.value}`}
                              name="length[]"
                              value={option.value}
                              type="checkbox"
                              checked={selectedLengths.includes(option.value)}
                              onChange={() => handleLengthChange(option.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`length-${option.value}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
              <h1 className="text-4xl font-serif font-bold tracking-tight text-gray-900">
                Shop Collection
              </h1>

              <div className="flex items-center">
                <div className="relative inline-block text-left">
                  <select
                    id="sort-by"
                    name="sort-by"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <span className="sr-only">Filters</span>
                  <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <section aria-labelledby="products-heading" className="pb-24 pt-6">
              <h2 id="products-heading" className="sr-only">
                Products
              </h2>

              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                {/* Filters */}
                <div className="hidden lg:block">
                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Search</h3>
                      <div className="mt-2">
                        <form onSubmit={handleSearch} className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            placeholder="Search products..."
                          />
                        </form>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                      <ul role="list" className="mt-2 space-y-2">
                        {collections.map((collection) => (
                          <li key={collection.handle} className="flex items-center">
                            <button
                              onClick={() =>
                                setSelectedCollection(
                                  selectedCollection === collection.handle ? null : collection.handle
                                )
                              }
                              className={`text-sm ${
                                selectedCollection === collection.handle
                                  ? 'font-medium text-primary-600'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {collection.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hair Type */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Hair Type</h3>
                      <div className="mt-4 space-y-4">
                        {hairTypes.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`desktop-hair-type-${option.value}`}
                              name="hair-type[]"
                              value={option.value}
                              type="checkbox"
                              checked={selectedHairTypes.includes(option.value)}
                              onChange={() => handleHairTypeChange(option.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`desktop-hair-type-${option.value}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Length */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Length</h3>
                      <div className="mt-4 space-y-4">
                        {hairLengths.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`desktop-length-${option.value}`}
                              name="length[]"
                              value={option.value}
                              type="checkbox"
                              checked={selectedLengths.includes(option.value)}
                              onChange={() => handleLengthChange(option.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`desktop-length-${option.value}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery ||
                      selectedCollection ||
                      selectedHairTypes.length > 0 ||
                      selectedLengths.length > 0) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Product grid */}
                <div className="lg:col-span-3">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Try adjusting your filters or search query.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="group relative">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={product.images.edges[0].node.originalSrc}
                              alt={product.images.edges[0].node.altText || product.title}
                              width={500}
                              height={500}
                              className="h-full w-full object-cover object-center group-hover:opacity-75"
                            />
                          </div>
                          <div className="mt-4 flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                <Link href={`/shop/${product.handle}`}>
                                  <span aria-hidden="true" className="absolute inset-0" />
                                  {product.title}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {product.tags.slice(0, 2).join(' • ')}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                            </p>
                          </div>
                          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-full btn-primary py-2 text-sm">Add to Cart</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
}
