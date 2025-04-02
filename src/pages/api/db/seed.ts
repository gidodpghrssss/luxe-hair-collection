import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * Database seeding endpoint - only available in development
 * Seeds the database with initial data for testing
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow this endpoint in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      error: 'This endpoint is only available in development mode' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear existing data (optional)
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed products
    const products = await prisma.product.createMany({
      data: [
        {
          title: 'Brazilian Straight Wig',
          description: 'Premium 100% human hair Brazilian straight wig with lace front closure.',
          price: 299.99,
          imageUrl: '/images/products/brazilian-straight-wig.jpg',
          category: 'Wigs',
          type: 'Straight',
          length: '18"',
          color: 'Natural Black',
          material: 'Human Hair',
          inStock: true
        },
        {
          title: 'Peruvian Body Wave Bundles',
          description: 'Set of 3 bundles of Peruvian body wave hair, 100% human hair.',
          price: 249.99,
          imageUrl: '/images/products/peruvian-body-wave.jpg',
          category: 'Bundles',
          type: 'Body Wave',
          length: '20"',
          color: 'Natural Black',
          material: 'Human Hair',
          inStock: true
        },
        {
          title: 'Malaysian Curly Closure',
          description: 'Premium 4x4 lace closure with Malaysian curly texture.',
          price: 89.99,
          imageUrl: '/images/products/malaysian-curly-closure.jpg',
          category: 'Closures',
          type: 'Curly',
          length: '16"',
          color: 'Natural Black',
          material: 'Human Hair',
          inStock: true
        },
        {
          title: 'Indian Deep Wave Frontal',
          description: '13x4 lace frontal with Indian deep wave texture.',
          price: 159.99,
          imageUrl: '/images/products/indian-deep-wave-frontal.jpg',
          category: 'Frontals',
          type: 'Deep Wave',
          length: '18"',
          color: 'Natural Black',
          material: 'Human Hair',
          inStock: true
        }
      ]
    });

    // Seed test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      }
    });

    // Seed reviews
    const reviews = await prisma.review.createMany({
      data: [
        {
          productId: (await prisma.product.findFirst())?.id || '',
          userId: user.id,
          userName: 'Test User',
          rating: 5,
          comment: 'Amazing quality hair! Will definitely purchase again.'
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        products: products.count,
        users: 1,
        reviews: reviews.count
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return res.status(500).json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
