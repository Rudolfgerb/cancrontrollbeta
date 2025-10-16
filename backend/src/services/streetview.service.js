import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const STREET_VIEW_BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';
const GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

class StreetViewService {
  /**
   * Get Street View panorama image
   */
  async getPanorama(location, options = {}) {
    const {
      size = '1024x768',
      heading = 0,
      pitch = 0,
      fov = 90,
    } = options;

    const url = `${STREET_VIEW_BASE_URL}?size=${size}&location=${location}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      const base64Image = imageBuffer.toString('base64');

      return {
        success: true,
        image: `data:image/jpeg;base64,${base64Image}`,
        metadata: {
          location,
          heading,
          pitch,
          fov,
        }
      };
    } catch (error) {
      console.error('Error fetching Street View panorama:', error.message);
      return {
        success: false,
        error: 'Failed to fetch Street View image',
      };
    }
  }

  /**
   * Get Street View metadata
   */
  async getMetadata(location) {
    const url = `${STREET_VIEW_BASE_URL}/metadata?location=${location}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching Street View metadata:', error.message);
      return {
        success: false,
        error: 'Failed to fetch metadata',
      };
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address) {
    const url = `${GEOCODING_BASE_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          location: result.geometry.location,
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components,
        };
      }

      return {
        success: false,
        error: 'No results found',
      };
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      return {
        success: false,
        error: 'Geocoding failed',
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    const url = `${GEOCODING_BASE_URL}?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];

        // Extract city and country
        const addressComponents = result.address_components;
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
        const country = addressComponents.find(c => c.types.includes('country'))?.long_name;

        return {
          success: true,
          address: result.formatted_address,
          city,
          country,
          addressComponents,
        };
      }

      return {
        success: false,
        error: 'No results found',
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error.message);
      return {
        success: false,
        error: 'Reverse geocoding failed',
      };
    }
  }

  /**
   * Get nearby places to calculate population density
   */
  async getPopulationDensity(lat, lng, radius = 500) {
    const url = `${PLACES_BASE_URL}?location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);

      if (response.data.status === 'OK') {
        const placeCount = response.data.results.length;

        // Normalize to 0-1 scale (assuming max 50 places nearby means very dense)
        const density = Math.min(placeCount / 50, 1.0);

        return {
          success: true,
          density,
          placeCount,
        };
      }

      return {
        success: false,
        density: 0.5, // Default medium density
      };
    } catch (error) {
      console.error('Error getting population density:', error.message);
      return {
        success: false,
        density: 0.5,
      };
    }
  }

  /**
   * Generate random spots near a location
   */
  generateRandomSpots(centerLat, centerLng, count = 10, radiusKm = 2) {
    const spots = [];

    for (let i = 0; i < count; i++) {
      // Generate random offset within radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radiusKm;

      // Convert to lat/lng offset (rough approximation)
      const latOffset = (distance / 111) * Math.cos(angle);
      const lngOffset = (distance / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

      const lat = centerLat + latOffset;
      const lng = centerLng + lngOffset;

      // Random spot type
      const spotTypes = ['wall', 'electrical_box', 'bridge', 'train', 'billboard'];
      const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)];

      spots.push({
        lat,
        lng,
        spotType,
        heading: Math.floor(Math.random() * 360),
      });
    }

    return spots;
  }
}

export default new StreetViewService();
