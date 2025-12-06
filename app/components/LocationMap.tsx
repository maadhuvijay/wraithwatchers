'use client';

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationMap({ onLocationSelect, initialLat = 40.0, initialLng = -82.5 }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([initialLat, initialLng]);
  const isInitializingRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Keep the callback ref up to date
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

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

      // Clean up marker
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (e) {
          // Marker might already be removed
        }
        markerRef.current = null;
      }

      // Check if container already has a map instance
      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }

      // CDN version exposes L directly, npm version might have L.default
      const Leaflet = L.default || L;

      const map = Leaflet.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 10,
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

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add initial marker
      const marker = Leaflet.marker([initialLat, initialLng], {
        icon: Leaflet.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: black; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white;"></div>',
          iconSize: [16, 16],
        }),
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedLocation([lat, lng]);
        onLocationSelectRef.current(lat, lng);
      });

      // Handle marker drag
      marker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setSelectedLocation([lat, lng]);
        onLocationSelectRef.current(lat, lng);
      });

      // Initial location selection
      onLocationSelectRef.current(initialLat, initialLng);

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
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
        markerRef.current = null;
      }
      
      // Clear container's leaflet ID
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, [initialLat, initialLng]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-600" ref={mapRef} />
  );
}

