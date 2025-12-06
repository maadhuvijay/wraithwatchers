import { Sighting, parseCSV } from './utils';

let cachedSightings: Sighting[] | null = null;

export async function loadSightings(): Promise<Sighting[]> {
  if (cachedSightings) {
    return cachedSightings;
  }

  try {
    const response = await fetch('/data/ghost_sightings_ohio_with_images.csv');
    const csvText = await response.text();
    cachedSightings = parseCSV(csvText);
    return cachedSightings;
  } catch (error) {
    console.error('Error loading sightings:', error);
    return [];
  }
}

