import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Meal } from '@/types/database';
import { GlassCard } from './GlassCard';

interface MealCardProps {
  meal: Meal;
  lastEaten?: string;
  averageRating?: number;
  onSelect: (meal: Meal) => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
  showActions?: boolean;
}

export function MealCard({ 
  meal, 
  lastEaten, 
  averageRating, 
  onSelect, 
  onEdit, 
  onDelete, 
  showActions = false 
}: MealCardProps) {
  const categoryColors = {
    carb: 'bg-blue-100 text-blue-800 border-blue-200',
    protein: 'bg-green-100 text-green-800 border-green-200',
    vegetable: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const formatLastEaten = (date: string) => {
    const now = new Date();
    const eaten = new Date(date);
    const diffDays = Math.floor((now.getTime() - eaten.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <GlassCard className="p-4">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900">{meal.name}</h3>
              {showActions && onEdit && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(meal)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(meal)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {meal.description && (
              <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={categoryColors[meal.category]} variant="outline">
            {meal.category}
          </Badge>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {lastEaten && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatLastEaten(lastEaten)}</span>
            </div>
          )}
          {averageRating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)}/5</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => onSelect(meal)}
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
        >
          Select This Meal
        </Button>
      </div>
    </GlassCard>
  );
}