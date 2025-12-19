/**
 * Admin Community Link Form Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const communitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platform: z.enum(['SKOOL', 'SLACK', 'DISCORD', 'OTHER']),
  externalLink: z.string().url('Valid URL is required'),
  isActive: z.boolean().optional(),
  displayOrder: z.number().min(0).optional(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

interface CommunityFormProps {
  linkId?: string;
}

const CommunityForm = ({ linkId: propLinkId }: CommunityFormProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const linkId = propLinkId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!linkId;

  const { data: link } = useQuery({
    queryKey: ['community', linkId],
    queryFn: () => communityService.getById(linkId!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      isActive: true,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (link) {
      reset({
        title: link.title,
        description: link.description || undefined,
        platform: link.platform as any,
        externalLink: link.externalLink,
        isActive: link.isActive,
        displayOrder: link.displayOrder,
      });
    }
  }, [link, reset]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const createMutation = useMutation({
    mutationFn: (data: CommunityFormData) =>
      axios.post(`${API_URL}/admin/community`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      navigate('/admin/community');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CommunityFormData) =>
      axios.put(`${API_URL}/admin/community/${linkId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', linkId] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
      navigate('/admin/community');
    },
  });

  const onSubmit = (data: CommunityFormData) => {
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
          <CardTitle>{isEditMode ? 'Edit Community Link' : 'Create Community Link'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update community link information' : 'Add a new community link'}
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
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <select
                  id="platform"
                  {...register('platform')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="SKOOL">Skool</option>
                  <option value="SLACK">Slack</option>
                  <option value="DISCORD">Discord</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.platform && (
                  <p className="text-sm text-destructive mt-1">{errors.platform.message}</p>
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/community')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Link' : 'Create Link'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityForm;

