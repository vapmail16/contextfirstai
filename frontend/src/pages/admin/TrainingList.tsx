/**
 * Admin Training List Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { trainingService } from '../../services/api/contentService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const TrainingList = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['admin', 'trainings'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/admin/trainings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${API_URL}/admin/trainings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trainings'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this training?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trainings</h1>
        <Button asChild>
          <Link to="/admin/trainings/new">Create New Training</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {trainings.map((training: any) => (
          <Card key={training.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{training.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{training.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/trainings/${training.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(training.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingList;

