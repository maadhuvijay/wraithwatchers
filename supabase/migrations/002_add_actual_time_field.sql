-- Add actual_time field to store the exact time entered by the user
ALTER TABLE public.ghost_sightings 
ADD COLUMN IF NOT EXISTS actual_time TIME;

