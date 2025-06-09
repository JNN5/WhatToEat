export interface Database {
  public: {
    Tables: {
      meals: {
        Row: {
          id: string;
          name: string;
          category: 'carb' | 'protein' | 'vegetable';
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: 'carb' | 'protein' | 'vegetable';
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: 'carb' | 'protein' | 'vegetable';
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          cuisine_type: string;
          description: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cuisine_type: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cuisine_type?: string;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_id: string | null;
          restaurant_id: string | null;
          rating: number | null;
          notes: string | null;
          eaten_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_id?: string | null;
          restaurant_id?: string | null;
          rating?: number | null;
          notes?: string | null;
          eaten_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_id?: string | null;
          restaurant_id?: string | null;
          rating?: number | null;
          notes?: string | null;
          eaten_at?: string;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_carbs: string[];
          preferred_proteins: string[];
          preferred_vegetables: string[];
          dietary_restrictions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_carbs?: string[];
          preferred_proteins?: string[];
          preferred_vegetables?: string[];
          dietary_restrictions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_carbs?: string[];
          preferred_proteins?: string[];
          preferred_vegetables?: string[];
          dietary_restrictions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Meal = Database['public']['Tables']['meals']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type MealLog = Database['public']['Tables']['meal_logs']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];