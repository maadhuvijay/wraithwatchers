import { Sighting } from '../lib/utils';
import Image from 'next/image';

interface SightingPopupProps {
  sighting: Sighting;
  onClose: () => void;
}

export default function SightingPopup({ sighting, onClose }: SightingPopupProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeOfDay: string) => {
    // Convert time of day to a more readable format
    const timeMap: Record<string, string> = {
      'Dawn': '5:00 AM',
      'Morning': '8:00 AM',
      'Afternoon': '2:00 PM',
      'Evening': '6:00 PM',
      'Night': '10:00 PM',
      'Midnight': '12:00 AM',
    };
    return timeMap[timeOfDay] || timeOfDay;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
        >
          ×
        </button>
        
        {sighting.imageLink && (
          <div className="mb-4">
            <Image
              src={sighting.imageLink}
              alt="Sighting"
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded"
              unoptimized
            />
          </div>
        )}
        
        <div className="space-y-2 text-black">
          <p><strong>Date of Sighting:</strong> {formatDate(sighting.date)}</p>
          <p><strong>Time of Sighting:</strong> {formatTime(sighting.timeOfDay)} EST</p>
          <p><strong>Type of Sighting:</strong> {sighting.tag}</p>
          <p><strong>Sighting Notes:</strong> {sighting.notes}</p>
        </div>
      </div>
    </div>
  );
}

