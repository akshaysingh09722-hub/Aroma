import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ARView } from '../ar/ARView';
import { CITIES_DATA } from '../data/mockAirQualityData';

export const ARVisualizationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cityParam = searchParams.get('city') || 'tokyo';

  const selectedCity =
    CITIES_DATA.find((c) => c.id.toLowerCase() === cityParam.toLowerCase()) ||
    CITIES_DATA[0];

  const handleBackToDashboard = () => {
    navigate(`/dashboard?city=${selectedCity.id}`);
  };

  return (
    <div className="py-2">
      <ARView
        initialAQI={selectedCity.currentAQI}
        initialCityName={selectedCity.name}
        onClose={handleBackToDashboard}
      />
    </div>
  );
};

export default ARVisualizationPage;
