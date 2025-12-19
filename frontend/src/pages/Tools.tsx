/**
 * Tools Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery } from '@tanstack/react-query';
import { toolService, Tool } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Tools = () => {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: toolService.getAll,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tools</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master AI tools and platforms with step-by-step walkthroughs.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No tools available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Problem Solved:</p>
                      <p className="text-sm text-muted-foreground">{tool.problemSolved}</p>
                    </div>
                    {tool.whoShouldUse && (
                      <div>
                        <p className="text-sm font-medium mb-1">Who Should Use:</p>
                        <p className="text-sm text-muted-foreground">{tool.whoShouldUse}</p>
                      </div>
                    )}
                    <Button
                      asChild
                      className="w-full"
                    >
                      <a
                        href={tool.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn More
                      </a>
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

export default Tools;

