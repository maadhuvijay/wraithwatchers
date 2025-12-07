import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase';
import { dbRowToSighting } from '@/app/lib/utils';

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

// GET endpoint: Fetch all sightings from database
export async function GET() {
  try {
    const supabase = createServerSupabase();
    
    const { data, error } = await supabase
      .from('ghost_sightings')
      .select('*')
      .order('sighting_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sightings', details: error.message },
        { status: 500 }
      );
    }

    // Convert database rows to Sighting interface
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

    // Save to Supabase database
    const supabase = createServerSupabase();
    
    const { data, error } = await supabase
      .from('ghost_sightings')
      .insert({
        sighting_date: date,
        latitude: latitude,
        longitude: longitude,
        nearest_city: city || 'Unknown',
        us_state: state || 'Ohio',
        notes: notes,
        time_of_day: timeOfDay,
        tag_of_apparition: type,
        image_link: '' // No image link from form submission
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save sighting', details: error.message },
        { status: 500 }
      );
    }

    // Convert database row to Sighting interface
    const sighting = dbRowToSighting(data);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Sighting submitted successfully',
        data: sighting
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

