import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '../../lib/supabase';
import { dbRowToSighting } from '../../lib/utils';

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

    // Get Supabase client
    const supabase = createServerSupabase();

    // Insert into database
    const { data, error } = await supabase
      .from('ghost_sightings')
      .insert({
        date_of_sighting: date,
        latitude: latitude,
        longitude: longitude,
        city: city || 'Unknown',
        state: state || 'Ohio',
        notes: notes,
        time_of_day: timeOfDay,
        tag_of_apparition: type,
        image_link: '', // No image for user-submitted sightings
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save sighting to database', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: dbRowToSighting(data) },
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

// GET endpoint: Fetch all sightings
export async function GET() {
  try {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('ghost_sightings')
      .select('*')
      .order('date_of_sighting', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sightings', details: error.message },
        { status: 500 }
      );
    }

    const sightings = (data || []).map(dbRowToSighting);

    return NextResponse.json({ sightings }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

