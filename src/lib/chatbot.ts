import { useState, useEffect } from 'react';
import OpenAI from 'openai';
import axios from 'axios';

// Interface for chat messages
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Interface for chatbot options
export interface ChatbotOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

// Default system prompt for the hair brand chatbot
const DEFAULT_SYSTEM_PROMPT = `You are a helpful, friendly customer service assistant for Luxe Hair Collection, a premium brand selling high-quality real human hair products including wigs, extensions, and other hair accessories. 

Your goal is to provide accurate information about our products, help customers find what they're looking for, and answer any questions about hair care, styling, or our policies.

Some key information about our products:
- All our hair is 100% real human hair, ethically sourced
- We offer wigs, extensions, closures, frontals, and bundles
- Our products come in various textures: straight, wavy, curly, and kinky
- We have multiple lengths available from 8" to 30"
- We ship worldwide with free shipping on orders over $100
- We have a 30-day return policy for unused products

Be friendly, helpful, and knowledgeable about hair products and care. If you don't know the answer to a specific question, suggest that the customer contact our support team directly.`;

// Default model to use
const DEFAULT_MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct';

// Function to create a new chat session with Nebius API
export function useNebiusChat(options: ChatbotOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID and load chat history
  useEffect(() => {
    // Generate a session ID if not exists
    const storedSessionId = localStorage.getItem('chatSessionId');
    const newSessionId = storedSessionId || `session_${Date.now()}`;
    
    if (!storedSessionId) {
      localStorage.setItem('chatSessionId', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Load chat history from database
    const loadChatHistory = async () => {
      try {
        const response = await axios.get(`/api/chat/history?sessionId=${newSessionId}`);
        if (response.data.messages && response.data.messages.length > 0) {
          // Ensure the roles are correctly typed
          const typedMessages = response.data.messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }));
          setMessages(typedMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        // Fall back to default system message if history can't be loaded
      }
    };
    
    loadChatHistory();
  }, [options.systemPrompt]);

  // Save message to database
  const saveMessage = async (message: ChatMessage) => {
    try {
      await axios.post('/api/chat/history', {
        sessionId,
        role: message.role,
        content: message.content
      });
    } catch (err) {
      console.error('Failed to save message to database:', err);
      // Continue even if saving fails - the UI will still work
    }
  };

  // Function to send a message to the chatbot
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Create user message
    const userMsg: ChatMessage = { role: 'user', content: userMessage };
    
    // Add user message to the chat
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    // Save user message to database
    await saveMessage(userMsg);

    try {
      // Call Nebius API for inference
      const response = await fetchNebiusResponse(newMessages, options);
      
      // Create assistant message
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      
      // Add assistant response to the chat
      setMessages((prevMessages) => [...prevMessages, assistantMsg]);
      
      // Save assistant message to database
      await saveMessage(assistantMsg);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get a response. Please try again.';
      setError(errorMessage);
      console.error('Error getting chat response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the chat
  const resetChat = async () => {
    const systemMsg: ChatMessage = {
      role: 'system',
      content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    };
    
    setMessages([systemMsg]);
    setError(null);
    
    // Generate new session ID
    const newSessionId = `session_${Date.now()}`;
    localStorage.setItem('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    
    // Save system message to database
    await saveMessage(systemMsg);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
    sessionId,
  };
}

// Function to create OpenAI client with Nebius API configuration
function createNebiusClient() {
  const apiKey = process.env.NEXT_PUBLIC_NEBIUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Nebius API key is not defined');
  }
  
  return new OpenAI({
    apiKey,
    baseURL: process.env.NEXT_PUBLIC_NEBIUS_API_URL || 'https://api.studio.nebius.com/v1/',
    dangerouslyAllowBrowser: true, // Allow client-side usage
  });
}

// Function to fetch a response from the Nebius API
async function fetchNebiusResponse(
  messages: ChatMessage[],
  options: ChatbotOptions = {}
): Promise<string> {
  try {
    const client = createNebiusClient();
    
    // Format messages for Nebius API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call Nebius API using OpenAI client
    const completion = await client.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      messages: formattedMessages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error calling Nebius API:', error);
    
    if (error instanceof OpenAI.APIError) {
      throw new Error(`Nebius API error: ${error.message}`);
    }
    
    // Fallback response if API fails
    throw new Error("I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact our support team for immediate assistance.");
  }
}
