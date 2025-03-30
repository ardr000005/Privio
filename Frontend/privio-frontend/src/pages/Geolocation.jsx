import { useGeolocated } from 'react-geolocated';
import { MapPin } from 'lucide-react';

export default function GeoLocation() {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  if (!isGeolocationAvailable)
    return (
      <div className="text-yellow-500 text-sm mt-2">
        Your browser doesn't support geolocation
      </div>
    );

  if (!isGeolocationEnabled)
    return (
      <div className="text-yellow-500 text-sm mt-2">
        Please enable location services
      </div>
    );

  return (
    <div className="flex items-center text-sm text-gray-400 mt-2">
      <MapPin className="h-4 w-4 mr-1" />
      {coords ? (
        <span>
          Location: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
        </span>
      ) : (
        <span>Getting location...</span>
      )}
    </div>
  );
}