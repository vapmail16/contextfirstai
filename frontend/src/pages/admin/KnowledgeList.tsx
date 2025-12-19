/**
 * Admin Knowledge Article List Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const KnowledgeList = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['admin', 'knowledge'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/admin/knowledge`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${API_URL}/admin/knowledge/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Knowledge Articles</h1>
        <Button asChild>
          <Link to="/admin/knowledge/new">Create New Article</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {articles.map((article: any) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{article.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                  <span className="text-xs text-muted-foreground mt-1">
                    Category: {article.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/knowledge/${article.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
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

export default KnowledgeList;

