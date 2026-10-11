import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ARView } from '../ar/ARView';
import { useEnvironmentalData } from '../context/EnvironmentalDataContext';
import { useLocationContext } from '../context/LocationContext';

export const ARVisualizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation } = useLocationContext();
  const { data: selectedCity } = useEnvironmentalData();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
