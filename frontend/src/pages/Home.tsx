/**
 * Home Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { trainingService, productService, toolService, knowledgeService } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const Home = () => {
  // Fetch featured content
  const { data: featuredTrainings = [], isLoading: trainingsLoading } = useQuery({
    queryKey: ['featuredTrainings'],
    queryFn: trainingService.getFeatured,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: toolService.getAll,
  });

  const { data: knowledgeArticles = [] } = useQuery({
    queryKey: ['knowledge'],
    queryFn: knowledgeService.getAll,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            AI Forge Hub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your gateway to AI training, practical guides, tools, and community.
            Learn, build, and grow with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/trainings">Explore Trainings</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/community">Join Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links / Pillars Overview */}
      <section className="container mx-auto px-4 py-12 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-8">Explore Our Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Training</CardTitle>
              <CardDescription>Learn AI through structured courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/trainings">View Trainings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Knowledge</CardTitle>
              <CardDescription>Deep dive into AI concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/knowledge">Explore Knowledge</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Tools</CardTitle>
              <CardDescription>Master AI tools and platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/tools">Browse Tools</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Discover our SaaS products</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/products">View Products</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>Join our growing community</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/community">Join Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Trainings Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Trainings</h2>
        {trainingsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : featuredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{training.title}</CardTitle>
                  <CardDescription>{training.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {training.category} • {training.level}
                    </span>
                    <Button asChild size="sm">
                      <a
                        href={training.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Training
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No featured trainings available at the moment.
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>Subscribe to our newsletter for the latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <NewsletterForm />
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 bg-primary/10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Start Your AI Journey?</h2>
          <p className="text-lg text-muted-foreground">
            Join our community and connect with like-minded learners and builders.
          </p>
          <Button asChild size="lg">
            <Link to="/community">Join Community</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

// Newsletter Form Component
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      await axios.post(`${API_URL}/newsletter/subscribe`, { email });
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Subscribe'}
        </Button>
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">Subscribed successfully!</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Subscription failed. Please try again.</p>
      )}
    </form>
  );
};

export default Home;

