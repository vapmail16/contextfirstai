/**
 * Admin Community Link List Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const CommunityList = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['admin', 'community'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/community`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${API_URL}/admin/community/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'community'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this community link?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Links</h1>
        <Button asChild>
          <Link to="/admin/community/new">Create New Link</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {links.map((link: any) => (
          <Card key={link.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{link.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{link.description || 'No description'}</p>
                  <span className="text-xs text-muted-foreground mt-1">
                    Platform: {link.platform}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/community/${link.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
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

export default CommunityList;

