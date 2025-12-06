# WraithWatchers

A Next.js application for tracking and reporting ghost sightings across Ohio. Built with Next.js, React, Tailwind CSS, and Leaflet.js.

## Features

- **Sightings Map Page**: View ghost sightings on an interactive map with statistics
- **Post a Sighting**: Submit new ghost sighting reports with location pinning
- **Confirmation Page**: Thank you page after submitting a sighting
- **Responsive Design**: Mobile-friendly interface with dark theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  components/          # Reusable React components
    Navbar.tsx        # Navigation bar with logo and links
    Footer.tsx        # Footer component
    StatsCards.tsx    # Statistics display cards
    SightingsMap.tsx  # Interactive map with markers
    SightingPopup.tsx # Popup modal for sighting details
    SightingsTable.tsx # Data table with pagination
    LocationMap.tsx   # Map for selecting location
  lib/                # Utility functions
    utils.ts          # Data parsing and statistics
    loadSightings.ts  # CSV data loading
  post/               # Post a sighting page
  confirmation/       # Confirmation page
  page.tsx           # Main sightings map page
public/
  data/              # CSV data file
```

## Visual Identity

- **Primary Color**: Deep teal blue (#001C30)
- **Primary Background**: Deep midnight blue (#0A0F1C)
- **Text**: Soft spectral white (#F4F4F4)
- **Accent**: Warm orange rim-lighting (#FFB36A)
- **Secondary Accent**: Cool blue (#7CA7D9)
- **Typography**: Inter font family

## Technology Stack

- **Next.js 16**: React framework
- **React 19**: UI library
- **Tailwind CSS 4**: Styling
- **Leaflet.js**: Interactive maps
- **TypeScript**: Type safety

## Supabase Integration

This project now includes Supabase database integration! Upload your CSV data to Supabase with these steps:

1. **Quick Start**: See [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md) for a fast setup guide
2. **Full Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

### Upload CSV to Supabase

```bash
npm install                    # Install dependencies (including Supabase client)
npm run upload-csv            # Upload CSV data to Supabase
```

## Future Enhancements

- Real-time sighting submissions
- Advanced filtering and search
- User authentication
- Image upload functionality

## License

Private project for WraithWatchers organization.
