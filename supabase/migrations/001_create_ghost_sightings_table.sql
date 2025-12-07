-- Create the ghost_sightings table
CREATE TABLE IF NOT EXISTS public.ghost_sightings (
  id BIGSERIAL PRIMARY KEY,
  sighting_date DATE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  nearest_city VARCHAR(255),
  us_state VARCHAR(100),
  notes TEXT,
  time_of_day VARCHAR(50),
  tag_of_apparition VARCHAR(100),
  image_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_date ON public.ghost_sightings(sighting_date);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_location ON public.ghost_sightings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_city ON public.ghost_sightings(nearest_city);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_state ON public.ghost_sightings(us_state);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_tag ON public.ghost_sightings(tag_of_apparition);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_ghost_sightings_updated_at ON public.ghost_sightings;
CREATE TRIGGER update_ghost_sightings_updated_at
  BEFORE UPDATE ON public.ghost_sightings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.ghost_sightings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow anyone to read (SELECT) ghost sightings
DROP POLICY IF EXISTS "Allow public read access" ON public.ghost_sightings;
CREATE POLICY "Allow public read access"
  ON public.ghost_sightings
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert new sightings
DROP POLICY IF EXISTS "Allow public insert access" ON public.ghost_sightings;
CREATE POLICY "Allow public insert access"
  ON public.ghost_sightings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow service role to update/delete (for admin operations)
-- Note: Service role bypasses RLS, so this is mainly for documentation
-- Regular users won't be able to update/delete unless you add specific policies

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.ghost_sightings TO anon;
GRANT SELECT, INSERT ON public.ghost_sightings TO authenticated;
GRANT ALL ON public.ghost_sightings TO service_role;

