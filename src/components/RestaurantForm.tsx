import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import type { Restaurant } from '@/types/database';
import { toast } from 'sonner';

interface RestaurantFormProps {
  restaurant?: Restaurant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RestaurantForm({ restaurant, open, onOpenChange, onSuccess }: RestaurantFormProps) {
  const [name, setName] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCuisineType(restaurant.cuisine_type);
      setDescription(restaurant.description || '');
      setImageUrl(restaurant.image_url || '');
    } else {
      setName('');
      setCuisineType('');
      setDescription('');
      setImageUrl('');
    }
  }, [restaurant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const restaurantData = {
        name: name.trim(),
        cuisine_type: cuisineType.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      if (restaurant) {
        // Update existing restaurant
        const { error } = await supabase
          .from('restaurants')
          .update(restaurantData)
          .eq('id', restaurant.id);

        if (error) throw error;
        toast.success('Restaurant updated successfully!');
      } else {
        // Create new restaurant
        const { error } = await supabase
          .from('restaurants')
          .insert(restaurantData);

        if (error) throw error;
        toast.success('Restaurant created successfully!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter restaurant name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuisine-type">Cuisine Type *</Label>
            <Input
              id="cuisine-type"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g., Italian, Chinese, Mexican"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter restaurant description (optional)"
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
              disabled={loading || !name.trim() || !cuisineType.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Saving...' : restaurant ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}