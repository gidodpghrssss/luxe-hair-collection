import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type HealthResponse = {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  database?: string;
};

/**
 * Health check endpoint for monitoring application status
 * Used by Render for health checks
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  let dbStatus = 'unknown';
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: dbStatus
  });
}
