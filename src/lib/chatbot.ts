import { useState, useEffect } from 'react';
import OpenAI from 'openai';

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

  // Function to send a message to the chatbot
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to the chat
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Call Nebius API for inference
      const response = await fetchNebiusResponse(newMessages, options);
      
      // Add assistant response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get a response. Please try again.';
      setError(errorMessage);
      console.error('Error getting chat response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the chat
  const resetChat = () => {
    setMessages([
      {
        role: 'system',
        content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      },
    ]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
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

// Hook for managing chat history in local storage
export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage[] }>({});

  // Load chat history from local storage on initial render
  useEffect(() => {
    const storedHistory = localStorage.getItem('luxeHairChatHistory');
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('luxeHairChatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Function to save a chat session
  const saveChat = (sessionId: string, messages: ChatMessage[]) => {
    setChatHistory((prev) => ({
      ...prev,
      [sessionId]: messages,
    }));
  };

  // Function to load a chat session
  const loadChat = (sessionId: string): ChatMessage[] | null => {
    return chatHistory[sessionId] || null;
  };

  // Function to delete a chat session
  const deleteChat = (sessionId: string) => {
    setChatHistory((prev) => {
      const newHistory = { ...prev };
      delete newHistory[sessionId];
      return newHistory;
    });
  };

  return {
    chatHistory,
    saveChat,
    loadChat,
    deleteChat,
  };
}
