'use client';

import { useEffect, useRef } from 'react';
import { Sighting } from '../lib/utils';

interface SightingsMapProps {
  sightings: Sighting[];
  selectedSighting: Sighting | null;
  onMarkerClick: (sighting: Sighting) => void;
}

export default function SightingsMap({ sightings, selectedSighting, onMarkerClick }: SightingsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) return;

    // Load Leaflet from CDN (works without npm install)
    const loadLeaflet = () => {
      // Check if Leaflet is already loaded
      if ((window as any).L) {
        initializeMap((window as any).L);
        return;
      }
      
      // Load Leaflet from CDN
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        const L = (window as any).L;
        if (L) {
          initializeMap(L);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Leaflet from CDN');
        isInitializingRef.current = false;
      };
      document.head.appendChild(script);
    };

    const initializeMap = (L: any) => {
      if (!mapRef.current) return;
      
      isInitializingRef.current = true;

      // Clean up existing map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Map might already be removed
        }
        mapInstanceRef.current = null;
      }

      // Clean up markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Marker might already be removed
        }
      });
      markersRef.current = [];

      // Check if container already has a map instance (Leaflet stores this)
      if ((mapRef.current as any)._leaflet_id) {
        // Clear the container's leaflet ID
        delete (mapRef.current as any)._leaflet_id;
      }

      // CDN version exposes L directly, npm version might have L.default
      const Leaflet = L.default || L;

      // Initialize map centered on Ohio
      const map = Leaflet.map(mapRef.current, {
        center: [40.0, -82.5],
        zoom: 7,
        zoomControl: true,
      });

      // Apply grayscale filter
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container {
          filter: grayscale(100%);
        }
      `;
      document.head.appendChild(style);

      // Add OpenStreetMap tiles
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for each sighting
      sightings.forEach((sighting) => {
        if (sighting.latitude && sighting.longitude) {
          const marker = Leaflet.marker([sighting.latitude, sighting.longitude], {
            icon: Leaflet.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: black; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
              iconSize: [12, 12],
            }),
          }).addTo(map);

          marker.on('click', () => {
            onMarkerClick(sighting);
          });

          markersRef.current.push(marker);
        }
      });

      // Center map on selected sighting
      if (selectedSighting && selectedSighting.latitude && selectedSighting.longitude) {
        map.setView([selectedSighting.latitude, selectedSighting.longitude], 12);
      }

      isInitializingRef.current = false;
    };

    loadLeaflet();

    return () => {
      isInitializingRef.current = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
        mapInstanceRef.current = null;
      }
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      markersRef.current = [];
      
      // Clear container's leaflet ID
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, [sightings, selectedSighting, onMarkerClick]);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden mb-4" ref={mapRef} />
  );
}

