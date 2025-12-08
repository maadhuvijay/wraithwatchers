'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StatsCards from './components/StatsCards';
import SightingsMap from './components/SightingsMap';
import SightingPopup from './components/SightingPopup';
import SightingsTable from './components/SightingsTable';
import FilterControlPanel from './components/FilterControlPanel';
import { Sighting, calculateStats } from './lib/utils';

export default function Home() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<Sighting[]>([]);
  const [stats, setStats] = useState({ averagePerWeek: 0, peakTime: 'N/A', topCity: 'N/A' });
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // First, try to fetch from API (Supabase database)
        const apiResponse = await fetch('/api/sightings');
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.sightings && apiData.sightings.length > 0) {
            setSightings(apiData.sightings);
            setFilteredSightings(apiData.sightings);
            setStats(calculateStats(apiData.sightings));
            setLoading(false);
            return;
          }
        }
        
        // Fallback to CSV if API fails or returns no data
        console.warn('API fetch failed or returned no data, falling back to CSV');
        const csvResponse = await fetch('/data/ghost_sightings_ohio_with_images.csv');
        const csvText = await csvResponse.text();
        const parsed = parseCSV(csvText);
        setSightings(parsed);
        setFilteredSightings(parsed);
        setStats(calculateStats(parsed));
      } catch (error) {
        console.error('Error loading data:', error);
        // Try CSV as last resort
        try {
          const csvResponse = await fetch('/data/ghost_sightings_ohio_with_images.csv');
          const csvText = await csvResponse.text();
          const parsed = parseCSV(csvText);
          setSightings(parsed);
          setFilteredSightings(parsed);
          setStats(calculateStats(parsed));
        } catch (csvError) {
          console.error('Error loading CSV fallback:', csvError);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Simple CSV parser
  function parseCSV(csvText: string): Sighting[] {
    const lines = csvText.trim().split('\n');
    const sightings: Sighting[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
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

  return (
    <div 
      className="min-h-screen bg-[#5D5D5D] text-black flex flex-col"
      style={{
        backgroundImage: 'url(/ghost3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Loading sightings...</p>
        </div>
      ) : (
        <>
          <Navbar activePage="sightings" />
          
          <main className="flex-1 p-4 md:p-8 max-w-7xl mr-auto w-full">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-3xl font-bold text-[#F79486]">Buckeye Sighting Stats</h1>
              <p className="text-lg text-white">Track paranormal activity across Ohio</p>
            </div>
            <StatsCards stats={stats} />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-[#F79486]">Sightings Map</h2>
              <SightingsMap
                sightings={filteredSightings}
                selectedSighting={selectedSighting}
                onMarkerClick={setSelectedSighting}
              />
            </div>

            <FilterControlPanel 
              sightings={sightings}
              onFilterChange={setFilteredSightings}
            />

            <SightingsTable sightings={filteredSightings} />
          </main>

          {selectedSighting && (
            <SightingPopup
              sighting={selectedSighting}
              onClose={() => setSelectedSighting(null)}
            />
          )}

          <Footer />
        </>
      )}
    </div>
  );
}
