import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { ChatMessage } from '@/lib/chatbot';

/**
 * API endpoint for managing chat history
 * Supports GET (retrieve history) and POST (save message)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const userId = session?.user?.email || null;
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // GET: Retrieve chat history for a session
  if (req.method === 'GET') {
    try {
      const chatHistory = await prisma.chatHistory.findMany({
        where: {
          sessionId,
          userId: userId || undefined
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const messages: ChatMessage[] = chatHistory.map(entry => ({
        role: entry.role as 'user' | 'assistant' | 'system',
        content: entry.content
      }));

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      return res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  }

  // POST: Save a new message to chat history
  if (req.method === 'POST') {
    try {
      const { role, content } = req.body;

      if (!role || !content) {
        return res.status(400).json({ error: 'Role and content are required' });
      }

      const chatEntry = await prisma.chatHistory.create({
        data: {
          userId: userId || null,
          role,
          content,
          sessionId
        }
      });

      return res.status(201).json({ success: true, id: chatEntry.id });
    } catch (error) {
      console.error('Error saving chat message:', error);
      return res.status(500).json({ error: 'Failed to save chat message' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
