/**
 * Content Service
 * TDD Approach: This file implements methods to make tests pass (GREEN phase)
 *
 * Manages content items (trainings, tools, products, etc.) that redirect to external platforms
 */
import { Training, TrainingCategory, TrainingLevel, Tool, Product, KnowledgeArticle, CommunityLink } from '@prisma/client';
interface CreateTrainingData {
    title: string;
    description: string;
    category: TrainingCategory;
    level: TrainingLevel;
    externalLink: string;
    duration?: number;
    price?: number;
    image?: string;
    featured?: boolean;
    isActive?: boolean;
    displayOrder?: number;
}
interface UpdateTrainingData {
    title?: string;
    description?: string;
    category?: TrainingCategory;
    level?: TrainingLevel;
    externalLink?: string;
    duration?: number;
    price?: number;
    image?: string;
    featured?: boolean;
    isActive?: boolean;
    displayOrder?: number;
}
export declare class ContentService {
    static createTraining(data: CreateTrainingData): Promise<Training>;
    static getActiveTrainings(): Promise<Training[]>;
    static getFeaturedTrainings(): Promise<Training[]>;
    static getTrainingById(id: string): Promise<Training>;
    static updateTraining(id: string, data: UpdateTrainingData): Promise<Training>;
    static deleteTraining(id: string): Promise<void>;
    static createTool(data: any): Promise<Tool>;
    static getActiveTools(): Promise<Tool[]>;
    static getToolById(id: string): Promise<Tool>;
    static updateTool(id: string, data: any): Promise<Tool>;
    static deleteTool(id: string): Promise<void>;
    static createProduct(data: any): Promise<Product>;
    static getActiveProducts(): Promise<Product[]>;
    static getProductById(id: string): Promise<Product>;
    static updateProduct(id: string, data: any): Promise<Product>;
    static deleteProduct(id: string): Promise<void>;
    static createKnowledgeArticle(data: any): Promise<KnowledgeArticle>;
    static getActiveKnowledgeArticles(): Promise<KnowledgeArticle[]>;
    static getKnowledgeArticleById(id: string): Promise<KnowledgeArticle>;
    static searchKnowledgeArticles(query: string): Promise<KnowledgeArticle[]>;
    static updateKnowledgeArticle(id: string, data: any): Promise<KnowledgeArticle>;
    static deleteKnowledgeArticle(id: string): Promise<void>;
    static createCommunityLink(data: any): Promise<CommunityLink>;
    static getActiveCommunityLinks(): Promise<CommunityLink[]>;
    static getCommunityLinkById(id: string): Promise<CommunityLink>;
    static updateCommunityLink(id: string, data: any): Promise<CommunityLink>;
    static deleteCommunityLink(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=contentService.d.ts.map