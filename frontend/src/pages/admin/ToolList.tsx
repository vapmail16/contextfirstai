/**
 * Admin Tool List Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const ToolList = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['admin', 'tools'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/tools`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${API_URL}/admin/tools/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tools'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tools</h1>
        <Button asChild>
          <Link to="/admin/tools/new">Create New Tool</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {tools.map((tool: any) => (
          <Card key={tool.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{tool.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/tools/${tool.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tool.id)}
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

export default ToolList;

