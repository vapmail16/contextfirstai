/**
 * Admin Knowledge Article Form Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const knowledgeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['GLOSSARY', 'CORE_CONCEPTS', 'BEST_PRACTICES', 'CASE_STUDIES', 'SAAS_SCAFFOLDING']),
  readTime: z.number().min(0).optional(),
  externalLink: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().min(0).optional(),
});

type KnowledgeFormData = z.infer<typeof knowledgeSchema>;

interface KnowledgeFormProps {
  articleId?: string;
}

const KnowledgeForm = ({ articleId: propArticleId }: KnowledgeFormProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const articleId = propArticleId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!articleId;

  const { data: article } = useQuery({
    queryKey: ['knowledge', articleId],
    queryFn: () => knowledgeService.getById(articleId!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      featured: false,
      isActive: true,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        description: article.description,
        content: article.content,
        category: article.category as any,
        readTime: article.readTime || undefined,
        externalLink: article.externalLink || '',
        featured: article.featured,
        isActive: article.isActive,
        displayOrder: article.displayOrder,
      });
    }
  }, [article, reset]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) =>
      axios.post(`${API_URL}/admin/knowledge`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigate('/admin/knowledge');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) =>
      axios.put(`${API_URL}/admin/knowledge/${articleId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigate('/admin/knowledge');
    },
  });

  const onSubmit = (data: KnowledgeFormData) => {
    // Clean up empty externalLink
    const submitData = {
      ...data,
      externalLink: data.externalLink || undefined,
    };
    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Knowledge Article' : 'Create Knowledge Article'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update article information' : 'Add a new knowledge article'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Content (Markdown) *</Label>
              <textarea
                id="content"
                {...register('content')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-[300px] font-mono"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="GLOSSARY">Glossary</option>
                  <option value="CORE_CONCEPTS">Core Concepts</option>
                  <option value="BEST_PRACTICES">Best Practices</option>
                  <option value="CASE_STUDIES">Case Studies</option>
                  <option value="SAAS_SCAFFOLDING">SaaS Scaffolding</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  {...register('readTime', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="externalLink">External Link (optional)</Label>
              <Input id="externalLink" type="url" {...register('externalLink')} />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/knowledge')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Article' : 'Create Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeForm;

