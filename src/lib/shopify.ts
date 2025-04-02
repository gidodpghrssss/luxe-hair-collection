import { ShopifyAPI } from '@shopify/shopify-api';

// Initialize Shopify API client
const shopifyConfig = {
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: [
    'read_products',
    'write_products',
    'read_orders',
    'write_orders',
    'read_customers',
    'write_customers',
    'read_inventory',
    'write_inventory',
  ],
  hostName: process.env.SHOPIFY_STORE_DOMAIN || '',
};

// Storefront API access token for client-side requests
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const domain = process.env.SHOPIFY_STORE_DOMAIN || '';

// GraphQL endpoint for Storefront API
const storefrontApiUrl = `https://${domain}/api/2023-07/graphql.json`;

// Function to fetch products from Shopify
export async function getProducts(limit = 10, cursor?: string) {
  const query = `
    query GetProducts($limit: Int!, $cursor: String) {
      products(first: $limit, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price
                  availableForSale
                }
              }
            }
            tags
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const variables = {
    limit,
    cursor,
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products from Shopify:', error);
    throw error;
  }
}

// Function to fetch a single product by handle
export async function getProductByHandle(handle: string) {
  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          name
          values
        }
        tags
      }
    }
  `;

  const variables = {
    handle,
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.productByHandle;
  } catch (error) {
    console.error('Error fetching product from Shopify:', error);
    throw error;
  }
}

// Function to fetch products by collection
export async function getProductsByCollection(collectionHandle: string, limit = 10) {
  const query = `
    query GetProductsByCollection($handle: String!, $limit: Int!) {
      collectionByHandle(handle: $handle) {
        title
        products(first: $limit) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
              tags
            }
          }
        }
      }
    }
  `;

  const variables = {
    handle: collectionHandle,
    limit,
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.collectionByHandle;
  } catch (error) {
    console.error('Error fetching collection from Shopify:', error);
    throw error;
  }
}

// Function to create a checkout
export async function createCheckout(variantId: string, quantity: number) {
  const query = `
    mutation CheckoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          totalPriceV2 {
            amount
            currencyCode
          }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lineItems: [{ variantId, quantity }],
    },
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.checkoutCreate.checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

// Function to search products
export async function searchProducts(searchTerm: string, limit = 10) {
  const query = `
    query SearchProducts($query: String!, $limit: Int!) {
      products(query: $query, first: $limit) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            tags
          }
        }
      }
    }
  `;

  const variables = {
    query: searchTerm,
    limit,
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// Function to get all collections
export async function getCollections(limit = 10) {
  const query = `
    query GetCollections($limit: Int!) {
      collections(first: $limit) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              originalSrc
              altText
            }
          }
        }
      }
    }
  `;

  const variables = {
    limit,
  };

  try {
    const response = await fetch(storefrontApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();
    return data.collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

export default {
  getProducts,
  getProductByHandle,
  getProductsByCollection,
  createCheckout,
  searchProducts,
  getCollections,
};
