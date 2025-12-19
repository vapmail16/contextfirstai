/**
 * Training Detail Page Component
 * TDD Approach: Implemented to make tests pass (GREEN phase)
 */

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trainingService } from '../services/api/contentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface TrainingDetailProps {
  trainingId?: string;
}

const TrainingDetail = ({ trainingId: propTrainingId }: TrainingDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const trainingId = propTrainingId || id || '';

  const { data: training, isLoading, error } = useQuery({
    queryKey: ['training', trainingId],
    queryFn: () => trainingService.getById(trainingId),
    enabled: !!trainingId,
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (error || !training) {
    return <div className="container mx-auto px-4 py-12 text-center">Training not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{training.title}</CardTitle>
            <CardDescription className="text-lg">{training.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted rounded">{training.category}</span>
              <span className="px-3 py-1 bg-muted rounded">{training.level}</span>
              {training.duration && (
                <span className="px-3 py-1 bg-muted rounded">{training.duration} min</span>
              )}
            </div>
            <Button asChild size="lg">
              <a href={training.externalLink} target="_blank" rel="noopener noreferrer">
                View Training
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingDetail;

