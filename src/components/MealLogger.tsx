import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Meal, Restaurant } from '@/types/database';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner';

interface MealLoggerProps {
  meal?: Meal;
  restaurant?: Restaurant;
  onComplete: () => void;
  onCancel: () => void;
}

export function MealLogger({ meal, restaurant, onComplete, onCancel }: MealLoggerProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [eatenAt, setEatenAt] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_id: meal?.id || null,
          restaurant_id: restaurant?.id || null,
          rating: rating || null,
          notes: notes.trim() || null,
          eaten_at: new Date(eatenAt).toISOString(),
        });

      if (error) throw error;

      toast.success('Meal logged successfully!');
      onComplete();
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error('Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Log Your Meal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Item Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900">
              {meal?.name || restaurant?.name}
            </h3>
            {meal?.description && (
              <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
            )}
            {restaurant?.cuisine_type && (
              <p className="text-sm text-gray-600 mt-1">{restaurant.cuisine_type} cuisine</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating (optional)</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= rating
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <Label htmlFor="eaten-at">When did you eat this?</Label>
            <Input
              id="eaten-at"
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              className="bg-white/50 border-white/20"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How was it? Any thoughts or memories..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-white/50 border-white/20"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {loading ? 'Logging...' : 'Log Meal'}
            </Button>
          </div>
        </form>
      </CardContent>
    </GlassCard>
  );
}