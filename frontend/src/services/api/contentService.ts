/**
 * Content API Service
 * Handles all API calls to the backend content endpoints
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  externalLink: string;
  duration?: number;
  price?: number;
  image?: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  problemSolved: string;
  whoShouldUse?: string;
  externalLink: string;
  image?: string;
  relatedTrainingIds: string[];
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  problemSolved: string;
  status: 'LIVE' | 'BETA' | 'COMING_SOON';
  externalLink: string;
  pricing?: string;
  image?: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime?: number;
  image?: string;
  externalLink?: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityLink {
  id: string;
  platform: 'SKOOL' | 'SLACK' | 'DISCORD' | 'OTHER';
  title: string;
  description?: string;
  externalLink: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Training endpoints
export const trainingService = {
  getAll: async (): Promise<Training[]> => {
    const response = await api.get('/content/trainings');
    return response.data.data;
  },

  getFeatured: async (): Promise<Training[]> => {
    const response = await api.get('/content/trainings/featured');
    return response.data.data;
  },

  getById: async (id: string): Promise<Training> => {
    const response = await api.get(`/content/trainings/${id}`);
    return response.data.data;
  },
};

// Tool endpoints
export const toolService = {
  getAll: async (): Promise<Tool[]> => {
    const response = await api.get('/content/tools');
    return response.data.data;
  },

  getById: async (id: string): Promise<Tool> => {
    const response = await api.get(`/content/tools/${id}`);
    return response.data.data;
  },
};

// Product endpoints
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/content/products');
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/content/products/${id}`);
    return response.data.data;
  },
};

// Knowledge Article endpoints
export const knowledgeService = {
  getAll: async (): Promise<KnowledgeArticle[]> => {
    const response = await api.get('/content/knowledge');
    return response.data.data;
  },

  getById: async (id: string): Promise<KnowledgeArticle> => {
    const response = await api.get(`/content/knowledge/${id}`);
    return response.data.data;
  },

  search: async (query: string): Promise<KnowledgeArticle[]> => {
    const response = await api.get('/content/knowledge/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};

// Community Link endpoints
export const communityService = {
  getAll: async (): Promise<CommunityLink[]> => {
    const response = await api.get('/content/community');
    return response.data.data;
  },

  getById: async (id: string): Promise<CommunityLink> => {
    const response = await api.get(`/content/community/${id}`);
    return response.data.data;
  },
};

