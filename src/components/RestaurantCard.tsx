import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Restaurant } from '@/types/database';
import { GlassCard } from './GlassCard';

interface RestaurantCardProps {
  restaurant: Restaurant;
  lastVisited?: string;
  averageRating?: number;
  onSelect: (restaurant: Restaurant) => void;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (restaurant: Restaurant) => void;
  showActions?: boolean;
}

export function RestaurantCard({ 
  restaurant, 
  lastVisited, 
  averageRating, 
  onSelect, 
  onEdit, 
  onDelete, 
  showActions = false 
}: RestaurantCardProps) {
  const formatLastVisited = (date: string) => {
    const now = new Date();
    const visited = new Date(date);
    const diffDays = Math.floor((now.getTime() - visited.getTime()) / (1000 * 60 * 60 * 24));
    
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
              <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
              {showActions && onEdit && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(restaurant)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(restaurant)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {restaurant.description && (
              <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            {restaurant.cuisine_type}
          </Badge>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {lastVisited && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatLastVisited(lastVisited)}</span>
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
          onClick={() => onSelect(restaurant)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          Visit This Restaurant
        </Button>
      </div>
    </GlassCard>
  );
}