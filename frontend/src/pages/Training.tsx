/**
 * Training Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainingService, Training } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

type TrainingCategory = 'ALL' | 'INTRODUCTORY' | 'NICHE_TOPICS' | 'TOOL_BASED' | 'CODE_ALONG' | 'APPS' | 'UTILITIES' | 'SAAS_SCAFFOLDING';
type TrainingLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const Training = () => {
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<TrainingLevel>('ALL');

  const { data: trainings = [], isLoading, error } = useQuery({
    queryKey: ['trainings'],
    queryFn: trainingService.getAll,
  });

  // Filter trainings based on selected filters
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const categoryMatch = selectedCategory === 'ALL' || training.category === selectedCategory;
      const levelMatch = selectedLevel === 'ALL' || training.level === selectedLevel;
      return categoryMatch && levelMatch;
    });
  }, [trainings, selectedCategory, selectedLevel]);

  const categories: TrainingCategory[] = ['ALL', 'INTRODUCTORY', 'NICHE_TOPICS', 'TOOL_BASED', 'CODE_ALONG', 'APPS', 'UTILITIES', 'SAAS_SCAFFOLDING'];
  const levels: TrainingLevel[] = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatLevel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Trainings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn AI through structured courses. From introductory sessions to advanced techniques,
            explore our comprehensive training library.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex-1 max-w-xs">
            <label htmlFor="category-filter" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TrainingCategory)}
              className="w-full px-4 py-2 border border-input bg-background rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-xs">
            <label htmlFor="level-filter" className="block text-sm font-medium mb-2">
              Level
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as TrainingLevel)}
              className="w-full px-4 py-2 border border-input bg-background rounded-md"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {formatLevel(level)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Training List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading trainings...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading trainings. Please try again later.
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {trainings.length === 0
                ? 'No trainings available at the moment. Check back soon!'
                : 'No trainings match your selected filters.'}
            </p>
            {(selectedCategory !== 'ALL' || selectedLevel !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedLevel('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{training.title}</CardTitle>
                  <CardDescription>{training.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded" data-testid="training-category">
                        {formatCategory(training.category)}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded" data-testid="training-level">
                        {formatLevel(training.level)}
                      </span>
                      {training.duration && (
                        <span className="px-2 py-1 bg-muted rounded">
                          {training.duration} min
                        </span>
                      )}
                      {training.price !== undefined && training.price > 0 && (
                        <span className="px-2 py-1 bg-muted rounded">
                          ${training.price}
                        </span>
                      )}
                    </div>
                    <Button
                      asChild
                      className="w-full"
                    >
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
        )}
      </div>
    </div>
  );
};

export default Training;

