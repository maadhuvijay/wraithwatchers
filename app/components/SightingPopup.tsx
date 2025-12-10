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

  const formatTime = (timeOfDay: string, actualTime?: string) => {
    // If we have the actual time, use it and format it nicely
    if (actualTime !== undefined && actualTime !== null && String(actualTime).trim() !== '') {
      try {
        // Handle TIME format (HH:MM:SS) or HH:MM format
        // Remove any whitespace and split by colon
        const cleanTime = String(actualTime).trim();
        const timeParts = cleanTime.split(':');
        
        if (timeParts.length >= 2) {
          const hour = parseInt(timeParts[0], 10);
          const min = timeParts[1] || '00';
          
          // Validate hour is a number
          if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            // Ensure minutes are always 2 digits, remove seconds if present
            const paddedMin = min.substring(0, 2).padStart(2, '0');
            return `${displayHour}:${paddedMin} ${period}`;
          }
        }
      } catch (error) {
        console.warn('Error formatting actualTime:', actualTime, error);
      }
    }
    
    // Fallback to time of day category if actual time is not available
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
          <p><strong>Time of Sighting:</strong> {formatTime(sighting.timeOfDay, sighting.actualTime)} EST</p>
          <p><strong>Type of Sighting:</strong> {sighting.tag}</p>
          <p><strong>Sighting Notes:</strong> {sighting.notes}</p>
        </div>
      </div>
    </div>
  );
}

