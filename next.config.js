/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.shopify.com', 'res.cloudinary.com'],
  },
  env: {
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    MONGODB_URI: process.env.MONGODB_URI,
    NEBIUS_API_KEY: process.env.NEBIUS_API_KEY,
    NEBIUS_API_URL: process.env.NEBIUS_API_URL,
  },
}

module.exports = nextConfig
