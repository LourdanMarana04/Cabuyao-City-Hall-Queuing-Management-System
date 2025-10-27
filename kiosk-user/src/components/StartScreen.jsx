import React, { useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

const StartScreen = ({ onStart, onHaveCode }) => {
  const [priorityActive, setPriorityActive] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const { t } = useLanguage();

  // Define floor data - you can add more floors here
  const floors = [
    { name: "1st Floor", image: "/path/to/1st-floor-map.jpg" },
    { name: "2nd Floor", image: "/path/to/2nd-floor-map.jpg" },
    { name: "3rd Floor", image: "/path/to/3rd-floor-map.jpg" },
    // Add more floors as needed
  ];

  const goToPreviousFloor = () => {
    setCurrentFloorIndex((prev) => (prev > 0 ? prev - 1 : floors.length - 1));
  };

  const goToNextFloor = () => {
    setCurrentFloorIndex((prev) => (prev < floors.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <div className="text-center mb-6">
        <h2 className="text-5xl font-extrabold text-gray-700 leading-tight">
          {t('welcome')} {t('to')}
        </h2>
        <h2 className="text-5xl font-extrabold text-gray-700 leading-tight">
          Cabuyao City Hall Kiosk
        </h2>
      </div>

      
      {/* Regular Queue Button */}
      <button
  className="h-[56px] px-10 text-xl font-bold text-white text-center rounded-[16px] border-2 transition-all hover:-translate-y-[2px] flex items-center justify-center mx-auto"
  style={{
    background: 'linear-gradient(to bottom, #FFD54F 0%, #FFC107 40%, #FFB300 100%)',
    borderColor: '#FFB300',
    color: '#4A2E05',
    boxShadow:
      '0 8px 20px rgba(255, 179, 0, 0.35), inset 0 2px 2px rgba(255, 255, 255, 0.7)',
    borderRadius: '2rem',
    transition: 'all 0.3s ease',
    width: '280px',
    padding: '0 36px',
    cursor: 'pointer',
    textAlign: 'center',
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(to bottom, #FFEE58 0%, #FFD54F 50%, #FFCA28 100%)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(to bottom, #FFD54F 0%, #FFC107 40%, #FFB300 100%)';
  }}
  onClick={() => onStart(false)}
>
  {t('start')}
</button>


      {/* Priority Queue Button */}
      <button
  className="h-[56px] flex items-center justify-center gap-3 px-10 rounded-[16px] text-lg font-bold text-white text-center border-2 transition-all hover:-translate-y-[2px] mx-auto"
  style={{
    background:
      'linear-gradient(135deg, #42A5F5 0%, #1E88E5 60%, #1565C0 100%)',
    borderColor: '#bbdefb',
    boxShadow:
      '0 6px 16px rgba(33,150,243,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
      borderRadius: '2rem',
    padding: '0 36px',
    width: '280px',
    textAlign: 'center',
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(135deg, #64B5F6 0%, #42A5F5 60%, #1E88E5 100%)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(135deg, #42A5F5 0%, #1E88E5 60%, #1565C0 100%)';
  }}
  onClick={() => onStart(true)}
>
  {t('priority')}
</button>


      {/* Map Button */}
      <button
        className="h-[56px] px-10 text-xl font-bold text-white text-center border-2 transition-all hover:-translate-y-[2px] mx-auto flex items-center justify-center gap-2"
        style={{
          background:
            'linear-gradient(135deg, #4CAF50 0%, #388E3C 60%, #2E7D32 100%)',
          borderColor: '#A5D6A7',
          boxShadow: '0 8px 18px rgba(76,175,80,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
          borderRadius: '2rem',
          width: '280px',
          padding: '0 36px',
          textAlign: 'center',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #66BB6A 0%, #4CAF50 60%, #388E3C 100%)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, #4CAF50 0%, #388E3C 60%, #2E7D32 100%)';
        }}
        onClick={() => setShowMapModal(true)}
      >
        {t('viewMap')}
      </button>

      {/* Have a Code Button */}
      <button
  className="h-[56px] px-10 text-xl font-bold text-white text-center border-2 transition-all hover:-translate-y-[2px] mx-auto flex items-center justify-center gap-2"
  style={{
    background:
      'linear-gradient(135deg,rgb(212, 51, 43) 0%,rgb(226, 87, 82) 60%,rgb(173, 39, 34) 100%)',
    borderColor: '#f5b5b2',
    boxShadow: '0 10px 20px rgba(186,46,39,0.3), inset 0 1px 0 rgba(255,255,255,0.55)',
    borderRadius: '2rem',
    width: '280px',
    padding: '0 36px',
    textAlign: 'center',
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(135deg, rgb(239, 83, 80) 0%, rgb(244, 143, 143) 60%, rgb(212, 51, 43) 100%)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background =
      'linear-gradient(135deg,rgb(212, 51, 43) 0%,rgb(226, 87, 82) 60%,rgb(173, 39, 34) 100%)';
  }}
  onClick={onHaveCode}
>
  {t('confirmationCode')}
</button>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl max-h-[90vh] overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Cabuyao City Hall Map</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                aria-label="Close map"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[400px]">
              {/* Map image container */}
              <div className="w-full h-full flex items-center justify-center">
                {/* Placeholder for map image - replace with actual image */}
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-lg">{floors[currentFloorIndex]?.name} Map</p>
                  <p className="text-sm mt-2">Replace this placeholder with your {floors[currentFloorIndex]?.name.toLowerCase()} image</p>
                </div>
              </div>
            </div>

            {/* Simple Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={goToPreviousFloor}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                aria-label="Previous floor"
              >
                ‹
              </button>
              
              <span className="text-lg font-semibold text-gray-800">
                {floors[currentFloorIndex]?.name}
              </span>
              
              <button
                onClick={goToNextFloor}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                aria-label="Next floor"
              >
                ›
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StartScreen;