'use client';

import { Sighting } from '../lib/utils';
import { useState } from 'react';

interface SightingsTableProps {
  sightings: Sighting[];
}

export default function SightingsTable({ sightings }: SightingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(sightings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSightings = sightings.slice(startIndex, endIndex);

  const exportData = () => {
    const csv = [
      'Date,City,State,Time,Type,Notes',
      ...sightings.map(s => 
        `"${s.date}","${s.city}","${s.state}","${s.timeOfDay}","${s.tag}","${s.notes.replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ghost_sightings_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg p-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sightings Table</h2>
        <button
          onClick={exportData}
          className="bg-[#FFB36A] text-black px-4 py-2 rounded hover:bg-[#ff9f4a] transition-colors"
        >
          Export Data
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">City</th>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {currentSightings.map((sighting, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{sighting.date}</td>
                <td className="p-2">{sighting.city}</td>
                <td className="p-2">{sighting.timeOfDay}</td>
                <td className="p-2">{sighting.tag}</td>
                <td className="p-2 max-w-xs truncate">{sighting.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


