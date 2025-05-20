import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ stations = [], cars = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Fix for Leaflet default icon not showing correctly
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    
    // Initialize map
    if (!mapInstance.current) {
      // Calculate center point or use default if no stations
      let centerLat = 40.7128; // New York default
      let centerLng = -74.0060;
      let zoom = 10;
      
      if (stations.length > 0) {
        // Calculate the center point from all station coordinates
        const validStations = stations.filter(s => 
          typeof s.lat === 'number' && !isNaN(s.lat) && 
          typeof s.lng === 'number' && !isNaN(s.lng)
        );
        
        if (validStations.length > 0) {
          const latTotal = validStations.reduce((sum, station) => sum + parseFloat(station.lat), 0);
          const lngTotal = validStations.reduce((sum, station) => sum + parseFloat(station.lng), 0);
          centerLat = latTotal / validStations.length;
          centerLng = lngTotal / validStations.length;
        }
      }
      
      mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], zoom);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    } else {
      // Clear previous markers
      mapInstance.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
    }
    
    // Custom station icon
    const stationIcon = L.divIcon({
      className: 'custom-station-icon',
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-red-500">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    // Add station markers
    stations.forEach(station => {
      // Skip if missing coordinates or not numeric
      if (!station.lat || !station.lng || isNaN(parseFloat(station.lat)) || isNaN(parseFloat(station.lng))) {
        console.warn(`Station ${station.id} has invalid coordinates:`, station);
        return;
      }
      
      const lat = parseFloat(station.lat);
      const lng = parseFloat(station.lng);
      
      try {
        const marker = L.marker([lat, lng], { icon: stationIcon }).addTo(mapInstance.current);
        marker.bindPopup(`
          <div class="font-semibold">${station.name || 'Unnamed Station'}</div>
          <div>Available Cars: ${station.cars || 0}</div>
        `);
      } catch (error) {
        console.error(`Error adding marker for station ${station.id}:`, error);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [stations, cars]); // Dependency on stations and cars to update when they change
  
  return (
    <div ref={mapRef} className="h-full"></div>
  );
};

export default MapView;
