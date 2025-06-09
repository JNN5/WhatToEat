import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import type { Meal } from '@/types/database';
import { toast } from 'sonner';

interface MealFormProps {
  meal?: Meal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MealForm({ meal, open, onOpenChange, onSuccess }: MealFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'carb' | 'protein' | 'vegetable'>('carb');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setCategory(meal.category);
      setDescription(meal.description || '');
      setImageUrl(meal.image_url || '');
    } else {
      setName('');
      setCategory('carb');
      setDescription('');
      setImageUrl('');
    }
  }, [meal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mealData = {
        name: name.trim(),
        category,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      if (meal) {
        // Update existing meal
        const { error } = await supabase
          .from('meals')
          .update(mealData)
          .eq('id', meal.id);

        if (error) throw error;
        toast.success('Meal updated successfully!');
      } else {
        // Create new meal
        const { error } = await supabase
          .from('meals')
          .insert(mealData);

        if (error) throw error;
        toast.success('Meal created successfully!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{meal ? 'Edit Meal' : 'Add New Meal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter meal name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value: 'carb' | 'protein' | 'vegetable') => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carb">Carb</SelectItem>
                <SelectItem value="protein">Protein</SelectItem>
                <SelectItem value="vegetable">Vegetable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter meal description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL (optional)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {loading ? 'Saving...' : meal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}