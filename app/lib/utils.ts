export interface Sighting {
  date: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  notes: string;
  timeOfDay: string;
  tag: string;
  imageLink: string;
}

export interface SightingStats {
  averagePerWeek: number;
  peakTime: string;
  topCity: string;
}

export function calculateStats(sightings: Sighting[]): SightingStats {
  // Calculate average sightings per week
  // Assuming sightings span from earliest to latest date
  const dates = sightings
    .map(s => new Date(s.date))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (dates.length === 0) {
    return { averagePerWeek: 0, peakTime: 'N/A', topCity: 'N/A' };
  }

  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  const weeks = Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const averagePerWeek = Math.round(sightings.length / weeks);

  // Find peak time of day
  const timeCounts: Record<string, number> = {};
  sightings.forEach(s => {
    timeCounts[s.timeOfDay] = (timeCounts[s.timeOfDay] || 0) + 1;
  });
  const peakTime = Object.entries(timeCounts).reduce((a, b) => 
    timeCounts[a[0]] > timeCounts[b[0]] ? a : b
  )[0];

  // Find top city
  const cityCounts: Record<string, number> = {};
  sightings.forEach(s => {
    cityCounts[s.city] = (cityCounts[s.city] || 0) + 1;
  });
  const topCity = Object.entries(cityCounts).reduce((a, b) => 
    cityCounts[a[0]] > cityCounts[b[0]] ? a : b
  )[0];

  return {
    averagePerWeek,
    peakTime,
    topCity: `${topCity}, ${sightings.find(s => s.city === topCity)?.state || 'OH'}`,
  };
}

export function parseCSV(csvText: string): Sighting[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const sightings: Sighting[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 9) {
      sightings.push({
        date: values[0] || '',
        latitude: parseFloat(values[1]) || 0,
        longitude: parseFloat(values[2]) || 0,
        city: values[3] || '',
        state: values[4] || '',
        notes: values[5] || '',
        timeOfDay: values[6] || '',
        tag: values[7] || '',
        imageLink: values[8] || '',
      });
    }
  }
  
  return sightings;
}

