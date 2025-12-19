/**
 * Admin Tool Form Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toolService } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const toolSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  problemSolved: z.string().min(1, 'Problem solved is required'),
  whoShouldUse: z.string().optional(),
  externalLink: z.string().url('Valid URL is required'),
  relatedTrainingIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().min(0).optional(),
});

type ToolFormData = z.infer<typeof toolSchema>;

interface ToolFormProps {
  toolId?: string;
}

const ToolForm = ({ toolId: propToolId }: ToolFormProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const toolId = propToolId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!toolId;

  const { data: tool } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: () => toolService.getById(toolId!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      featured: false,
      isActive: true,
      displayOrder: 0,
      relatedTrainingIds: [],
    },
  });

  useEffect(() => {
    if (tool) {
      reset({
        title: tool.title,
        description: tool.description,
        problemSolved: tool.problemSolved,
        whoShouldUse: tool.whoShouldUse || undefined,
        externalLink: tool.externalLink,
        relatedTrainingIds: tool.relatedTrainingIds || [],
        featured: tool.featured,
        isActive: tool.isActive,
        displayOrder: tool.displayOrder,
      });
    }
  }, [tool, reset]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const createMutation = useMutation({
    mutationFn: (data: ToolFormData) =>
      axios.post(`${API_URL}/admin/tools`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      navigate('/admin/tools');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ToolFormData) =>
      axios.put(`${API_URL}/admin/tools/${toolId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool', toolId] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      navigate('/admin/tools');
    },
  });

  const onSubmit = (data: ToolFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Tool' : 'Create Tool'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update tool information' : 'Add a new tool to the platform'}
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
              <Label htmlFor="problemSolved">Problem Solved *</Label>
              <textarea
                id="problemSolved"
                {...register('problemSolved')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-[100px]"
              />
              {errors.problemSolved && (
                <p className="text-sm text-destructive mt-1">{errors.problemSolved.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whoShouldUse">Who Should Use</Label>
              <textarea
                id="whoShouldUse"
                {...register('whoShouldUse')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="externalLink">External Link *</Label>
              <Input id="externalLink" type="url" {...register('externalLink')} />
              {errors.externalLink && (
                <p className="text-sm text-destructive mt-1">{errors.externalLink.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/tools')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Tool' : 'Create Tool'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolForm;

