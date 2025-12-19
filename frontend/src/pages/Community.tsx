/**
 * Community Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery } from '@tanstack/react-query';
import { communityService, CommunityLink } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Community = () => {
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['community'],
    queryFn: communityService.getAll,
  });

  const formatPlatform = (platform: string) => {
    return platform.charAt(0) + platform.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our growing community of learners, builders, and AI enthusiasts.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading community links...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No community links available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{link.title}</CardTitle>
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {formatPlatform(link.platform)}
                    </span>
                  </div>
                  {link.description && (
                    <CardDescription>{link.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    className="w-full"
                  >
                    <a
                      href={link.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Community
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;

