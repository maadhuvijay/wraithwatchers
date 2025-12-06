-- Create the ghost_sightings table
CREATE TABLE IF NOT EXISTS ghost_sightings (
  id BIGSERIAL PRIMARY KEY,
  date_of_sighting DATE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  notes TEXT,
  time_of_day VARCHAR(50),
  tag_of_apparition VARCHAR(100),
  image_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_date ON ghost_sightings(date_of_sighting);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_city ON ghost_sightings(city);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_state ON ghost_sightings(state);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_tag ON ghost_sightings(tag_of_apparition);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_latitude ON ghost_sightings(latitude);
CREATE INDEX IF NOT EXISTS idx_ghost_sightings_longitude ON ghost_sightings(longitude);

-- Enable Row Level Security (RLS)
ALTER TABLE ghost_sightings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the sightings
CREATE POLICY "Allow public read access" ON ghost_sightings
  FOR SELECT
  USING (true);

-- Create a policy that allows authenticated users to insert sightings
CREATE POLICY "Allow authenticated insert" ON ghost_sightings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_ghost_sightings_updated_at
  BEFORE UPDATE ON ghost_sightings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

