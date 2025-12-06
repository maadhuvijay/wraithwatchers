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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would POST to an API
    // For now, we'll just navigate to confirmation
    router.push('/confirmation');
  };

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF3E1] text-black flex flex-col">
      <Navbar activePage="post" />
      
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-4 text-[#222222]">Post a Sighting</h1>
        <p className="text-gray-700 mb-6">
          Did you spot a spirit? Post information below so that our community can stand vigilant!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date of Sighting</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-black bg-white border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time of Sighting</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-black bg-white border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type of Sighting</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg text-black bg-white border border-gray-300"
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
            <label className="block text-sm font-medium mb-2">Sighting Notes</label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 rounded-lg text-black bg-white border border-gray-300"
              placeholder="Describe what you saw..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Where Were You Exactly? (Place a Pin)
            </label>
            <LocationMap
              onLocationSelect={handleLocationSelect}
              initialLat={40.0}
              initialLng={-82.5}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Post Your Sighting
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

