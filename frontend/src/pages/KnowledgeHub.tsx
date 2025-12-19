/**
 * Knowledge Hub Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeService, KnowledgeArticle } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const KnowledgeHub = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledge', searchQuery],
    queryFn: () => searchQuery 
      ? knowledgeService.search(searchQuery)
      : knowledgeService.getAll(),
    enabled: true,
  });

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Knowledge Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dive into AI concepts, best practices, and case studies.
          </p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery ? 'No articles found matching your search.' : 'No articles available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded">
                        {formatCategory(article.category)}
                      </span>
                      {article.readTime && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {article.readTime} min read
                        </span>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <a href={`/knowledge/${article.id}`}>Read Article</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHub;

