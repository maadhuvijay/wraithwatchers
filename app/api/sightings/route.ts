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
    let supabase;
    try {
      supabase = createServerSupabase();
    } catch (supabaseError) {
      console.error('Supabase configuration error:', supabaseError);
      // Return empty array if Supabase is not configured
      return NextResponse.json({ sightings: [] }, { status: 200 });
    }
    
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
    
    // Log first sighting for debugging actual_time retrieval
    if (sightings.length > 0) {
      console.log('Sample sighting data:', {
        time_of_day: sightings[0].timeOfDay,
        actualTime: sightings[0].actualTime,
        raw_actual_time: data?.[0]?.actual_time
      });
    }

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

    // Try to save to Supabase database
    let supabase;
    try {
      supabase = createServerSupabase();
    } catch (supabaseError) {
      console.error('Supabase configuration error:', supabaseError);
      return NextResponse.json(
        { 
          error: 'Database not configured', 
          details: 'Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file. If you just updated them, make sure to restart your development server (stop and run `npm run dev` again).',
          message: supabaseError instanceof Error ? supabaseError.message : 'Database configuration error'
        },
        { status: 500 }
      );
    }
    
    // Build insert object - conditionally include actual_time if column exists
    const insertData: any = {
      sighting_date: date,
      latitude: latitude,
      longitude: longitude,
      nearest_city: city || 'Unknown',
      us_state: state || 'Ohio',
      notes: notes,
      time_of_day: timeOfDay,
      tag_of_apparition: type,
      image_link: '' // No image link from form submission
    };

    // Try to include actual_time, but handle gracefully if column doesn't exist
    // First attempt: try with actual_time
    // The time from HTML input is in HH:MM format (24-hour), which PostgreSQL TIME accepts
    console.log('Attempting to save sighting with time:', time);
    let { data, error } = await supabase
      .from('ghost_sightings')
      .insert({
        ...insertData,
        actual_time: time, // Store the actual time entered by the user (HH:MM format)
      })
      .select()
      .single();

    // If error is about missing column, retry without actual_time
    if (error && (error.message?.includes('actual_time') || error.message?.includes('column') || error.code === '42703')) {
      console.warn('⚠️ actual_time column not found! Saving without it. Please run migration 002_add_actual_time_field.sql');
      console.warn('Error details:', error.message);
      ({ data, error } = await supabase
        .from('ghost_sightings')
        .insert(insertData)
        .select()
        .single());
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save sighting', details: error.message },
        { status: 500 }
      );
    }

    // Convert database row to Sighting interface
    const sighting = dbRowToSighting(data);
    
    // Log for debugging - check if actual_time was saved
    console.log('Sighting saved:', {
      id: data.id,
      time_of_day: data.time_of_day,
      actual_time: data.actual_time,
      mapped_actualTime: sighting.actualTime
    });

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

