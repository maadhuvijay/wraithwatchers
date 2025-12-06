'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LocationMap from '../components/LocationMap';

export default function PostSighting() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: '',
    notes: '',
    latitude: 0,
    longitude: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; state: string }> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'WraithWatchers/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      return {
        city: address.city || address.town || address.village || address.municipality || 'Unknown',
        state: address.state || 'Ohio'
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return { city: 'Unknown', state: 'Ohio' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate location is selected
      if (!formData.latitude || !formData.longitude) {
        setError('Please select a location on the map');
        setIsSubmitting(false);
        return;
      }

      // Reverse geocode to get city and state
      const { city, state } = await reverseGeocode(formData.latitude, formData.longitude);

      // Submit to API
      const response = await fetch('/api/sightings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          type: formData.type,
          notes: formData.notes,
          latitude: formData.latitude,
          longitude: formData.longitude,
          city: city,
          state: state,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit sighting: ${response.statusText}`);
      }

      // Success - navigate to confirmation page
      router.push('/confirmation');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit sighting. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#5D5D5D] text-[#F79486] flex flex-col"
      style={{
        backgroundImage: 'url(/ghost3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay'
      }}
    >
      <Navbar activePage="post" />
      
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-4 text-[#F79486]">Post a Sighting</h1>
        <p className="text-[#F79486] mb-6">
          Did you spot a spirit? Post information below so that our community can stand vigilant!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#F79486]">Date of Sighting</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-[#F79486] bg-white border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#F79486]">Time of Sighting</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-[#F79486] bg-white border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#F79486]">Type of Sighting</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-[#F79486] bg-white border border-gray-300"
            >
              <option value="">Select a type</option>
              <option value="White Lady">White Lady</option>
              <option value="Orbs">Orbs</option>
              <option value="Shadow Figure">Shadow Figure</option>
              <option value="Full-Body Apparition">Full-Body Apparition</option>
              <option value="Headless Spirit">Headless Spirit</option>
              <option value="Poltergeist">Poltergeist</option>
              <option value="Phantom Sounds">Phantom Sounds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#F79486]">Sighting Notes</label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 rounded-lg text-[#F79486] bg-white border border-gray-300"
              placeholder="Describe what you saw..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#F79486]">
              Where Were You Exactly? (Place a Pin)
            </label>
            <LocationMap
              onLocationSelect={handleLocationSelect}
              initialLat={40.0}
              initialLng={-82.5}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-[#F79486] py-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Post Your Sighting'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

