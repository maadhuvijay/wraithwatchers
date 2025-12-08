'use client';

import { useEffect } from 'react';

export default function HeadLinks() {
  useEffect(() => {
    // Preload background image to prevent visual shifts
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = '/ghost3.png';
    preloadLink.as = 'image';
    
    // Check if already added
    if (!document.querySelector(`link[href="/ghost3.png"]`)) {
      document.head.appendChild(preloadLink);
    }

    // Load Leaflet CSS from CDN as fallback
    // This ensures the app works even if npm packages aren't installed yet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = 'anonymous';
    
    // Check if already added
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }, []);

  return null;
}

