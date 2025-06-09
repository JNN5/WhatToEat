/*
  # Meal Choice App Database Schema

  1. New Tables
    - `meals`
      - `id` (uuid, primary key)
      - `name` (text, meal name)
      - `category` (text, carb/protein/vegetable)
      - `description` (text, optional description)
      - `image_url` (text, optional image)
      - `created_at` (timestamp)
    - `restaurants`
      - `id` (uuid, primary key) 
      - `name` (text, restaurant name)
      - `cuisine_type` (text, type of cuisine)
      - `description` (text, optional description)
      - `image_url` (text, optional image)
      - `created_at` (timestamp)
    - `meal_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `meal_id` (uuid, references meals, nullable)
      - `restaurant_id` (uuid, references restaurants, nullable)
      - `rating` (integer, 1-5 rating)
      - `notes` (text, optional notes)
      - `eaten_at` (timestamp, when it was eaten)
      - `created_at` (timestamp)
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `preferred_carbs` (text array)
      - `preferred_proteins` (text array)
      - `preferred_vegetables` (text array)
      - `dietary_restrictions` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for meals and restaurants
    - User-specific access for meal_logs and preferences

  3. Sample Data
    - Pre-populate meals with common carbs, proteins, and vegetables
    - Add some sample restaurants
*/

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('carb', 'protein', 'vegetable')),
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cuisine_type text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES meals(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  eaten_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_carbs text[] DEFAULT '{}',
  preferred_proteins text[] DEFAULT '{}',
  preferred_vegetables text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for meals (public read, authenticated users can add)
CREATE POLICY "Anyone can read meals"
  ON meals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for restaurants (public read, authenticated users can add)
CREATE POLICY "Anyone can read restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for meal_logs (users can only access their own)
CREATE POLICY "Users can read own meal logs"
  ON meal_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
  ON meal_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs"
  ON meal_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs"
  ON meal_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_preferences (users can only access their own)
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample meals
INSERT INTO meals (name, category, description) VALUES
-- Carbs
('Rice', 'carb', 'Steamed white or brown rice'),
('Pasta', 'carb', 'Various pasta shapes and styles'),
('Bread', 'carb', 'Fresh bread or rolls'),
('Quinoa', 'carb', 'Protein-rich superfood grain'),
('Sweet Potato', 'carb', 'Roasted or baked sweet potato'),
('Noodles', 'carb', 'Asian-style noodles'),
('Potatoes', 'carb', 'Mashed, roasted, or baked potatoes'),
('Couscous', 'carb', 'Light and fluffy semolina grain'),

-- Proteins
('Chicken', 'protein', 'Grilled, baked, or pan-seared chicken'),
('Beef', 'protein', 'Various cuts of beef'),
('Fish', 'protein', 'Fresh fish, grilled or baked'),
('Pork', 'protein', 'Pork chops, tenderloin, or other cuts'),
('Tofu', 'protein', 'Marinated and cooked tofu'),
('Eggs', 'protein', 'Scrambled, fried, or boiled eggs'),
('Turkey', 'protein', 'Lean turkey breast or ground turkey'),
('Beans', 'protein', 'Various legumes and beans'),
('Salmon', 'protein', 'Fresh or smoked salmon'),
('Shrimp', 'protein', 'Grilled or sautéed shrimp'),

-- Vegetables
('Broccoli', 'vegetable', 'Steamed or roasted broccoli'),
('Carrots', 'vegetable', 'Fresh or cooked carrots'),
('Spinach', 'vegetable', 'Fresh spinach or sautéed'),
('Bell Peppers', 'vegetable', 'Colorful bell peppers'),
('Zucchini', 'vegetable', 'Grilled or sautéed zucchini'),
('Asparagus', 'vegetable', 'Grilled or roasted asparagus'),
('Green Beans', 'vegetable', 'Fresh green beans'),
('Mushrooms', 'vegetable', 'Various mushroom varieties'),
('Tomatoes', 'vegetable', 'Fresh tomatoes or cherry tomatoes'),
('Brussels Sprouts', 'vegetable', 'Roasted Brussels sprouts'),
('Cauliflower', 'vegetable', 'Roasted or steamed cauliflower'),
('Kale', 'vegetable', 'Fresh kale or kale chips');

-- Insert sample restaurants
INSERT INTO restaurants (name, cuisine_type, description) VALUES
('The Local Bistro', 'American', 'Farm-to-table American cuisine with seasonal menu'),
('Sakura Sushi', 'Japanese', 'Fresh sushi and traditional Japanese dishes'),
('Mama Mia''s', 'Italian', 'Authentic Italian pasta and pizza'),
('Spice Route', 'Indian', 'Traditional Indian curries and naan'),
('Taco Libre', 'Mexican', 'Fresh Mexican food and craft cocktails'),
('Golden Dragon', 'Chinese', 'Classic Chinese dishes and dim sum'),
('Mediterranean Breeze', 'Mediterranean', 'Fresh Mediterranean flavors and healthy options'),
('BBQ Smokehouse', 'American', 'Slow-smoked meats and classic sides'),
('Green Garden', 'Vegetarian', 'Plant-based meals and fresh salads'),
('Ocean''s Catch', 'Seafood', 'Fresh seafood and coastal cuisine');