import { SightingStats } from '../lib/utils';

interface StatsCardsProps {
  stats: SightingStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white text-black p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-600 mb-1">Average Sightings per week</p>
        <p className="text-2xl font-bold">{stats.averagePerWeek}</p>
      </div>
      <div className="bg-white text-black p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-600 mb-1">Peak sighting time</p>
        <p className="text-2xl font-bold">{stats.peakTime}</p>
      </div>
      <div className="bg-white text-black p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-600 mb-1">Top Haunted City</p>
        <p className="text-2xl font-bold">{stats.topCity}</p>
      </div>
    </div>
  );
}



