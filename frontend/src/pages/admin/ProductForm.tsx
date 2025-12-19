/**
 * Admin Product Form Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  problemSolved: z.string().min(1, 'Problem solved is required'),
  status: z.enum(['LIVE', 'BETA', 'COMING_SOON']),
  externalLink: z.string().url('Valid URL is required'),
  pricing: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

const ProductForm = ({ productId: propProductId }: ProductFormProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const productId = propProductId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!productId;

  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getById(productId!),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
      isActive: true,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        problemSolved: product.problemSolved,
        status: product.status as any,
        externalLink: product.externalLink,
        pricing: product.pricing || undefined,
        featured: product.featured,
        isActive: product.isActive,
        displayOrder: product.displayOrder,
      });
    }
  }, [product, reset]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      axios.post(`${API_URL}/admin/products`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      axios.put(`${API_URL}/admin/products/${productId}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
  });

  const onSubmit = (data: ProductFormData) => {
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
          <CardTitle>{isEditMode ? 'Edit Product' : 'Create Product'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update product information' : 'Add a new product to the platform'}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="LIVE">Live</option>
                  <option value="BETA">Beta</option>
                  <option value="COMING_SOON">Coming Soon</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pricing">Pricing</Label>
                <Input id="pricing" {...register('pricing')} placeholder="e.g., $9/month" />
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
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;

