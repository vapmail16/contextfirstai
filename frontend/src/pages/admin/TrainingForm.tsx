/**
 * Admin Training Form Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService, Training } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import ImageUpload from '../../components/ImageUpload';
import axios from 'axios';

const trainingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['INTRODUCTORY', 'NICHE_TOPICS', 'TOOL_BASED', 'CODE_ALONG', 'APPS', 'UTILITIES', 'SAAS_SCAFFOLDING']),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  externalLink: z.string().url('Valid URL is required'),
  duration: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().min(0).optional(),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  trainingId?: string;
}

const TrainingForm = ({ trainingId: propTrainingId }: TrainingFormProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const trainingId = propTrainingId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!trainingId;

  const { data: training } = useQuery({
    queryKey: ['training', trainingId],
    queryFn: () => trainingService.getById(trainingId!),
    enabled: isEditMode,
  });

  const [imageUrl, setImageUrl] = useState<string | undefined>(training?.image || undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      featured: false,
      isActive: true,
      displayOrder: 0,
    },
  });

  // Populate form when training data loads
  useEffect(() => {
    if (training) {
      reset({
        title: training.title,
        description: training.description,
        category: training.category as any,
        level: training.level as any,
        externalLink: training.externalLink,
        duration: training.duration || undefined,
        price: training.price ? Number(training.price) : undefined,
        featured: training.featured,
        isActive: training.isActive,
        displayOrder: training.displayOrder,
      });
      setImageUrl(training.image || undefined);
    }
  }, [training, reset]);

  const handleImageUpload = (result: { url: string; filename: string }) => {
    setImageUrl(result.url);
    // Note: We'll need to add image field to the form schema if it's not already there
    // For now, we'll store it separately and include it in the submit
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const createMutation = useMutation({
    mutationFn: (data: TrainingFormData) =>
      axios.post(`${API_URL}/admin/trainings`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      navigate('/admin/trainings');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TrainingFormData) =>
      axios.put(`${API_URL}/admin/trainings/${trainingId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training', trainingId] });
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      navigate('/admin/trainings');
    },
  });

  const onSubmit = (data: TrainingFormData) => {
    const submitData = {
      ...data,
      image: imageUrl || undefined,
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
          <CardTitle>{isEditMode ? 'Edit Training' : 'Create Training'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update training information' : 'Add a new training to the platform'}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="INTRODUCTORY">Introductory</option>
                  <option value="NICHE_TOPICS">Niche Topics</option>
                  <option value="TOOL_BASED">Tool Based</option>
                  <option value="CODE_ALONG">Code Along</option>
                  <option value="APPS">Apps</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="SAAS_SCAFFOLDING">SaaS Scaffolding</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <select
                  id="level"
                  {...register('level')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
                {errors.level && (
                  <p className="text-sm text-destructive mt-1">{errors.level.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="externalLink">External Link *</Label>
              <Input id="externalLink" type="url" {...register('externalLink')} />
              {errors.externalLink && (
                <p className="text-sm text-destructive mt-1">{errors.externalLink.message}</p>
              )}
            </div>

            <div>
              <Label>Image</Label>
              <ImageUpload
                onUploadComplete={handleImageUpload}
                currentImageUrl={imageUrl}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/trainings')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Training' : 'Create Training'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingForm;

