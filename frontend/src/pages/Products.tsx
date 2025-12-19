/**
 * Products Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useQuery } from '@tanstack/react-query';
import { productService, Product } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Products = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'BETA':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'COMING_SOON':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our SaaS products designed to solve real-world problems.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{product.title}</CardTitle>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Problem Solved:</p>
                      <p className="text-sm text-muted-foreground">{product.problemSolved}</p>
                    </div>
                    {product.pricing && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Pricing: </span>
                        {product.pricing}
                      </p>
                    )}
                    <Button
                      asChild
                      className="w-full"
                    >
                      <a
                        href={product.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {product.status === 'LIVE' ? 'Try Now' : product.status === 'BETA' ? 'Join Beta' : 'Join Waitlist'}
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

export default Products;

