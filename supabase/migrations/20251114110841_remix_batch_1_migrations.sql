
-- Migration: 20251019171333
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create pond designs table
CREATE TABLE public.pond_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  land_length DECIMAL NOT NULL,
  land_width DECIMAL NOT NULL,
  total_land_area DECIMAL NOT NULL,
  pond_area DECIMAL NOT NULL,
  num_rows INTEGER NOT NULL,
  num_columns INTEGER NOT NULL,
  inner_length DECIMAL NOT NULL,
  inner_width DECIMAL NOT NULL,
  pond_volume DECIMAL NOT NULL,
  pond_depth DECIMAL NOT NULL DEFAULT 1.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for pond designs
ALTER TABLE public.pond_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pond designs" 
ON public.pond_designs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pond designs" 
ON public.pond_designs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create fish species data table
CREATE TABLE public.fish_species_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pond_length DECIMAL NOT NULL,
  pond_width DECIMAL NOT NULL,
  water_type TEXT NOT NULL,
  location TEXT NOT NULL,
  temperature DECIMAL,
  detected_species TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fish_species_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fish species data" 
ON public.fish_species_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fish species data" 
ON public.fish_species_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
