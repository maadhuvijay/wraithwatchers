'use client';

import { useState } from 'react';
import { Sighting } from '../lib/utils';

interface FilterControlPanelProps {
  sightings: Sighting[];
  onFilterChange: (filteredSightings: Sighting[]) => void;
}

const SIGHTING_TYPES = [
  'White Lady',
  'Orbs',
  'Shadow Figure',
  'Full-Body Apparition',
  'Headless Spirit',
  'Poltergeist',
  'Phantom Sounds',
];

export default function FilterControlPanel({ sightings, onFilterChange }: FilterControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  // Get unique types from actual data
  const uniqueTypes = Array.from(new Set(sightings.map(s => s.tag).filter(Boolean))).sort();
  const allTypes = uniqueTypes.length > 0 ? uniqueTypes : SIGHTING_TYPES;

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    
    // Filter sightings based on selected type
    const filtered = type === '' 
      ? sightings 
      : sightings.filter(sighting => sighting.tag === type);
    
    onFilterChange(filtered);
  };

  const handleClearFilter = () => {
    setSelectedType('');
    onFilterChange(sightings);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-700 text-white py-4 rounded-lg mb-4 hover:bg-gray-600 transition-colors flex items-center justify-between px-6"
      >
        <span className="font-semibold">Filter Control Panel</span>
        <span className="text-xl">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="bg-white rounded-lg p-6 text-black shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Filter by Type of Sighting
            </label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">All Types</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {selectedType && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-700">
                Filtering by: <strong>{selectedType}</strong>
              </span>
              <button
                onClick={handleClearFilter}
                className="text-sm text-gray-600 hover:text-black underline"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

