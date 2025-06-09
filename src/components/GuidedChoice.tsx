import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Utensils } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Meal } from '@/types/database';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner';

interface GuidedChoiceProps {
  onComplete: (selectedMeals: { carb: Meal; protein: Meal; vegetable: Meal }) => void;
  onBack: () => void;
}

type Step = 'carb' | 'protein' | 'vegetable';

export function GuidedChoice({ onComplete, onBack }: GuidedChoiceProps) {
  const [currentStep, setCurrentStep] = useState<Step>('carb');
  const [selectedMeals, setSelectedMeals] = useState<{
    carb?: Meal;
    protein?: Meal;
    vegetable?: Meal;
  }>({});
  const [meals, setMeals] = useState<Record<Step, Meal[]>>({
    carb: [],
    protein: [],
    vegetable: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('name');

      if (error) throw error;

      const mealsByCategory = {
        carb: data.filter(meal => meal.category === 'carb'),
        protein: data.filter(meal => meal.category === 'protein'),
        vegetable: data.filter(meal => meal.category === 'vegetable'),
      };

      setMeals(mealsByCategory);
    } catch (error) {
      console.error('Error loading meals:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const stepOrder: Step[] = ['carb', 'protein', 'vegetable'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const handleMealSelect = (meal: Meal) => {
    setSelectedMeals(prev => ({ ...prev, [currentStep]: meal }));
    
    if (currentStep === 'vegetable') {
      // Complete the process
      const finalSelection = {
        ...selectedMeals,
        vegetable: meal,
      } as { carb: Meal; protein: Meal; vegetable: Meal };
      
      onComplete(finalSelection);
    } else {
      // Move to next step
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStep(stepOrder[nextStepIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    } else {
      onBack();
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'carb': return 'Choose Your Carb';
      case 'protein': return 'Pick Your Protein';
      case 'vegetable': return 'Select Your Vegetable';
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case 'carb': return 'What sounds good as your main carbohydrate?';
      case 'protein': return 'What protein would you like today?';
      case 'vegetable': return 'Complete your meal with a vegetable!';
    }
  };

  const getStepColor = (step: Step) => {
    switch (step) {
      case 'carb': return 'from-blue-500 to-cyan-500';
      case 'protein': return 'from-green-500 to-emerald-500';
      case 'vegetable': return 'from-orange-500 to-amber-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stepOrder.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStepIndex
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {selectedMeals[step] ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < stepOrder.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 rounded ${
                    index < currentStepIndex ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {stepOrder.length}
          </p>
        </div>
      </div>

      {/* Current Step */}
      <GlassCard className="mb-6">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${getStepColor(currentStep)} rounded-full flex items-center justify-center mb-4`}>
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{getStepTitle(currentStep)}</CardTitle>
          <p className="text-gray-600">{getStepDescription(currentStep)}</p>
        </CardHeader>
      </GlassCard>

      {/* Meal Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {meals[currentStep].map((meal) => (
          <GlassCard key={meal.id} className="p-4 cursor-pointer" hover>
            <div
              onClick={() => handleMealSelect(meal)}
              className="text-center space-y-3"
            >
              <h3 className="font-semibold text-lg text-gray-900">{meal.name}</h3>
              {meal.description && (
                <p className="text-sm text-gray-600">{meal.description}</p>
              )}
              <Badge className={`${
                currentStep === 'carb' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                currentStep === 'protein' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-orange-100 text-orange-800 border-orange-200'
              }`} variant="outline">
                {meal.category}
              </Badge>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        {/* Show selected meals */}
        <div className="flex items-center space-x-2">
          {Object.entries(selectedMeals).map(([category, meal]) => (
            meal && (
              <Badge key={category} variant="secondary" className="px-3 py-1">
                {meal.name}
              </Badge>
            )
          ))}
        </div>
      </div>
    </div>
  );
}