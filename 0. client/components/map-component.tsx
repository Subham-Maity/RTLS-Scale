'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  locations: Record<string, LocationData>;
}

// Hash function to generate a unique number from the device ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default function MapComponent({ locations }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Define 10 distinct colors for different persons' markers
  const colors = useMemo(
    () => [
      '#e41a1c', // red
      '#377eb8', // blue
      '#4daf4a', // green
      '#984ea3', // purple
      '#ff7f00', // orange
      '#ffff33', // yellow
      '#a65628', // brown
      '#f781bf', // pink
      '#999999', // gray
      '#66c2a5', // teal
    ],
    []
  );

  // Create custom marker icons with different colors
  const icons = useMemo(
    () =>
      colors.map((color) => {
        const svg = `
          <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${color}" />
          </svg>
        `;
        const url = `data:image/svg+xml;base64,${btoa(svg)}`;
        return L.icon({
          iconUrl: url,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -41],
        });
      }),
    [colors]
  );

  useEffect(() => {
    // Initialize the map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        attributionControl: false,
      }).setView([0, 0], 2);
      console.log('Map initialized');
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '© Stadia Maps, © OpenMapTiles © OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Update or create markers for each person's device
    Object.entries(locations).forEach(([id, location]) => {
      const { latitude, longitude } = location;
      // Assign a color based on the device ID
      const colorIndex = hashString(id) % icons.length;
      const icon = icons[colorIndex];

      if (markersRef.current[id]) {
        // Update existing marker position
        console.log(`Updating marker ${id}: ${latitude}, ${longitude}`);
        markersRef.current[id].setLatLng([latitude, longitude]);
      } else {
        // Create new marker with custom colored icon
        console.log(`Creating marker ${id}: ${latitude}, ${longitude}`);
        markersRef.current[id] = L.marker([latitude, longitude], { icon })
          .addTo(map)
          .bindTooltip(
            `Device: ${id.substring(0, 6)}...<br>Lat: ${latitude.toFixed(6)}<br>Lon: ${longitude.toFixed(6)}`,
            {
              permanent: false,
              direction: 'top',
              className: 'dark-tooltip',
            }
          );
      }
    });

    // Adjust map view to fit all markers
    const locationIds = Object.keys(locations);
    if (locationIds.length > 0) {
      // Convert number[][] to proper LatLngExpression[]
      const coords = locationIds.map((id) => [locations[id].latitude, locations[id].longitude] as [number, number]);
      map.fitBounds(L.latLngBounds(coords), { maxZoom: 16 });
    }
  }, [locations, icons]);

  return <div id="map" className="h-full w-full" />;
}