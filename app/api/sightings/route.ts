import { NextRequest, NextResponse } from 'next/server';

// Convert time string (HH:MM) to time-of-day category
function timeToTimeOfDay(time: string): string {
  const [hours] = time.split(':').map(Number);
  
  if (hours >= 5 && hours < 12) {
    return 'Morning';
  } else if (hours >= 12 && hours < 17) {
    return 'Afternoon';
  } else if (hours >= 17 && hours < 21) {
    return 'Evening';
  } else {
    return 'Night';
  }
}

// POST endpoint: Handle form submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, type, notes, latitude, longitude, city, state } = body;

    // Validate required fields
    if (!date || !time || !type || !notes || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert time to time-of-day category
    const timeOfDay = timeToTimeOfDay(time);

    // Return success response (data is not saved to database)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Sighting submitted successfully',
        data: {
          date,
          time,
          type,
          notes,
          latitude,
          longitude,
          city: city || 'Unknown',
          state: state || 'Ohio',
          timeOfDay
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

