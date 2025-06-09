import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Utensils, ChefHat, Navigation, LogOut, Plus, Dice6, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Meal, Restaurant, MealLog } from '@/types/database';
import { MealCard } from './MealCard';
import { RestaurantCard } from './RestaurantCard';
import { GuidedChoice } from './GuidedChoice';
import { MealLogger } from './MealLogger';
import { MealForm } from './MealForm';
import { RestaurantForm } from './RestaurantForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner';

type View = 'home' | 'guided' | 'meals' | 'restaurants' | 'logging' | 'manage';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ meal?: Meal; restaurant?: Restaurant } | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [restaurantFormOpen, setRestaurantFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>();
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | undefined>();

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'meal' | 'restaurant'; item: Meal | Restaurant } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mealsRes, restaurantsRes, logsRes] = await Promise.all([
        supabase.from('meals').select('*').order('name'),
        supabase.from('restaurants').select('*').order('name'),
        supabase.from('meal_logs').select('*').eq('user_id', user!.id).order('eaten_at', { ascending: false }),
      ]);

      if (mealsRes.error) throw mealsRes.error;
      if (restaurantsRes.error) throw restaurantsRes.error;
      if (logsRes.error) throw logsRes.error;

      setMeals(mealsRes.data);
      setRestaurants(restaurantsRes.data);
      setMealLogs(logsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getRandomMeal = () => {
    if (meals.length === 0) return;
    
    const carbs = meals.filter(m => m.category === 'carb');
    const proteins = meals.filter(m => m.category === 'protein');
    const vegetables = meals.filter(m => m.category === 'vegetable');
    
    const randomCarb = carbs[Math.floor(Math.random() * carbs.length)];
    const randomProtein = proteins[Math.floor(Math.random() * proteins.length)];
    const randomVegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    
    toast.success(`Random meal: ${randomCarb?.name}, ${randomProtein?.name}, ${randomVegetable?.name}!`);
  };

  const getRandomRestaurant = () => {
    if (restaurants.length === 0) return;
    
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    toast.success(`How about ${randomRestaurant.name}?`);
  };

  const getMealStats = (meal: Meal) => {
    const mealEntries = mealLogs.filter(log => log.meal_id === meal.id);
    const lastEaten = mealEntries.length > 0 ? mealEntries[0].eaten_at : undefined;
    const ratings = mealEntries.filter(log => log.rating).map(log => log.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;
    
    return { lastEaten, averageRating };
  };

  const getRestaurantStats = (restaurant: Restaurant) => {
    const restaurantEntries = mealLogs.filter(log => log.restaurant_id === restaurant.id);
    const lastVisited = restaurantEntries.length > 0 ? restaurantEntries[0].eaten_at : undefined;
    const ratings = restaurantEntries.filter(log => log.rating).map(log => log.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;
    
    return { lastVisited, averageRating };
  };

  const handleMealSelect = (meal: Meal) => {
    setSelectedItem({ meal });
    setCurrentView('logging');
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedItem({ restaurant });
    setCurrentView('logging');
  };

  const handleGuidedComplete = (selectedMeals: { carb: Meal; protein: Meal; vegetable: Meal }) => {
    toast.success(`Great choice! ${selectedMeals.carb.name}, ${selectedMeals.protein.name}, and ${selectedMeals.vegetable.name}!`);
    setCurrentView('home');
  };

  const handleLogComplete = () => {
    setSelectedItem(null);
    setCurrentView('home');
    loadData();
  };

  // CRUD handlers
  const handleAddMeal = () => {
    setEditingMeal(undefined);
    setMealFormOpen(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealFormOpen(true);
  };

  const handleDeleteMeal = (meal: Meal) => {
    setDeleteTarget({ type: 'meal', item: meal });
    setDeleteConfirmOpen(true);
  };

  const handleAddRestaurant = () => {
    setEditingRestaurant(undefined);
    setRestaurantFormOpen(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantFormOpen(true);
  };

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    setDeleteTarget({ type: 'restaurant', item: restaurant });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from(deleteTarget.type === 'meal' ? 'meals' : 'restaurants')
        .delete()
        .eq('id', deleteTarget.item.id);

      if (error) throw error;

      toast.success(`${deleteTarget.type === 'meal' ? 'Meal' : 'Restaurant'} deleted successfully!`);
      loadData();
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your meal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  MealChoice
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentView('manage')}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </Button>
              <Button
                onClick={getRandomMeal}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2"
              >
                <Dice6 className="w-4 h-4" />
                <span>Random Meal</span>
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'guided' && (
          <GuidedChoice
            onComplete={handleGuidedComplete}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'logging' && selectedItem && (
          <MealLogger
            meal={selectedItem.meal}
            restaurant={selectedItem.restaurant}
            onComplete={handleLogComplete}
            onCancel={() => {
              setSelectedItem(null);
              setCurrentView('home');
            }}
          />
        )}

        {currentView === 'manage' && (
          <>
            <div className="mb-6">
              <Button
                onClick={() => setCurrentView('home')}
                variant="outline"
                className="mb-4"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Data</h2>
              <p className="text-gray-600">Add, edit, or remove meals and restaurants</p>
            </div>

            <GlassCard>
              <Tabs defaultValue="meals">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search meals or restaurants..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/50 border-white/20"
                        />
                      </div>
                    </div>
                    <TabsList className="bg-gray-100/50">
                      <TabsTrigger value="meals">Meals</TabsTrigger>
                      <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="meals" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Meals</h3>
                    <Button onClick={handleAddMeal} className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeals.map((meal) => {
                      const stats = getMealStats(meal);
                      return (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          lastEaten={stats.lastEaten}
                          averageRating={stats.averageRating}
                          onSelect={handleMealSelect}
                          onEdit={handleEditMeal}
                          onDelete={handleDeleteMeal}
                          showActions={true}
                        />
                      );
                    })}
                  </div>
                  {filteredMeals.length === 0 && (
                    <div className="text-center py-12">
                      <Utensils className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No meals found matching your search.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="restaurants" className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Restaurants</h3>
                    <Button onClick={handleAddRestaurant} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Restaurant
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => {
                      const stats = getRestaurantStats(restaurant);
                      return (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          lastVisited={stats.lastVisited}
                          averageRating={stats.averageRating}
                          onSelect={handleRestaurantSelect}
                          onEdit={handleEditRestaurant}
                          onDelete={handleDeleteRestaurant}
                          showActions={true}
                        />
                      );
                    })}
                  </div>
                  {filteredRestaurants.length === 0 && (
                    <div className="text-center py-12">
                      <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No restaurants found matching your search.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </GlassCard>
          </>
        )}

        {currentView === 'home' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <GlassCard className="p-6 text-center cursor-pointer" hover>
                <div onClick={() => setCurrentView('guided')}>
                  <Navigation className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Guided Choice</h3>
                  <p className="text-gray-600 text-sm">Let us help you build the perfect meal</p>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6 text-center cursor-pointer" hover>
                <div onClick={getRandomMeal}>
                  <Dice6 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">Random Meal</h3>
                  <p className="text-gray-600 text-sm">Feeling adventurous? Get a surprise combination</p>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6 text-center cursor-pointer" hover>
                <div onClick={getRandomRestaurant}>
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h3 className="text-lg font-semibold mb-2">Random Restaurant</h3>
                  <p className="text-gray-600 text-sm">Discover a restaurant for tonight</p>
                </div>
              </GlassCard>
            </div>

            {/* Browse Options */}
            <GlassCard>
              <Tabs defaultValue="meals">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search meals or restaurants..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/50 border-white/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setCurrentView('manage')}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage</span>
                      </Button>
                      <TabsList className="bg-gray-100/50">
                        <TabsTrigger value="meals">Meals</TabsTrigger>
                        <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>

                <TabsContent value="meals" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeals.map((meal) => {
                      const stats = getMealStats(meal);
                      return (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          lastEaten={stats.lastEaten}
                          averageRating={stats.averageRating}
                          onSelect={handleMealSelect}
                        />
                      );
                    })}
                  </div>
                  {filteredMeals.length === 0 && (
                    <div className="text-center py-12">
                      <Utensils className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No meals found matching your search.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="restaurants" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => {
                      const stats = getRestaurantStats(restaurant);
                      return (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          lastVisited={stats.lastVisited}
                          averageRating={stats.averageRating}
                          onSelect={handleRestaurantSelect}
                        />
                      );
                    })}
                  </div>
                  {filteredRestaurants.length === 0 && (
                    <div className="text-center py-12">
                      <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No restaurants found matching your search.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </GlassCard>
          </>
        )}
      </main>

      {/* Forms and Dialogs */}
      <MealForm
        meal={editingMeal}
        open={mealFormOpen}
        onOpenChange={setMealFormOpen}
        onSuccess={loadData}
      />

      <RestaurantForm
        restaurant={editingRestaurant}
        open={restaurantFormOpen}
        onOpenChange={setRestaurantFormOpen}
        onSuccess={loadData}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={`Delete ${deleteTarget?.type === 'meal' ? 'Meal' : 'Restaurant'}`}
        description={`Are you sure you want to delete "${deleteTarget?.item.name}"? This action cannot be undone.`}
      />
    </div>
  );
}