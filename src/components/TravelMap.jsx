import { useState, useEffect, useRef } from 'react';

const TravelMap = ({ places, onAddPlace, onPlaceClick }) => {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      if (!mapInstanceRef.current && mapRef.current) {
        try {
          const center = places.length > 0
            ? { lat: places[0].lat, lng: places[0].lng }
            : { lat: -23.5505, lng: -46.6333 }; // São Paulo como padrão

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: 13,
            mapTypeId: 'hybrid',
            tilt: 45,
            heading: -17.6,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
              }
            ]
          });

          // Adicionar marcadores existentes
          places.forEach(place => {
            const marker = new window.google.maps.Marker({
              position: { lat: place.lat, lng: place.lng },
              map: mapInstanceRef.current,
              title: place.name
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-bold text-lg">${place.name}</h3>
                  <p class="text-sm text-gray-600">${place.description || ''}</p>
                  ${place.date ? `<p class="text-xs text-gray-500 mt-1">Visitado em: ${new Date(place.date).toLocaleDateString('pt-BR')}</p>` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
              if (onPlaceClick) {
                onPlaceClick(place);
              }
            });

            markersRef.current.push({ marker, infoWindow });
          });

          // Adicionar evento de clique no mapa
          mapInstanceRef.current.addListener('click', (e) => {
            if (isAddingMode) {
              const { lat, lng } = e.latLng;
              setIsAddingMode(false);
              if (onAddPlace) {
                onAddPlace(lat(), lng());
              }
            }
          });
        } catch (error) {
          console.error('Erro ao inicializar o mapa:', error);
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(({ marker, infoWindow }) => {
          marker.setMap(null);
          infoWindow.close();
        });
        mapInstanceRef.current = null;
      }
    };
  }, [places, isAddingMode, onAddPlace]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Limpar marcadores antigos
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow.close();
      });
      markersRef.current = [];

      // Adicionar novos marcadores
      places.forEach(place => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstanceRef.current,
          title: place.name
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${place.name}</h3>
              <p class="text-sm text-gray-600">${place.description || ''}</p>
              ${place.date ? `<p class="text-xs text-gray-500 mt-1">Visitado em: ${new Date(place.date).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
          if (onPlaceClick) {
            onPlaceClick(place);
          }
        });

        markersRef.current.push({ marker, infoWindow });
      });

      // Centralizar no primeiro lugar se houver
      if (places.length > 0) {
        mapInstanceRef.current.panTo({ lat: places[0].lat, lng: places[0].lng });
      }
    }
  }, [places]);

  const rotateMap = (heading) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setHeading(heading);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setIsAddingMode(!isAddingMode)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isAddingMode
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isAddingMode ? '❌ Cancelar' : '➕ Adicionar Lugar'}
        </button>
        {isAddingMode && (
          <p className="text-sm text-gray-600">Clique no mapa para adicionar um lugar</p>
        )}
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
        />
        
        {/* Controles de rotação customizados */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => rotateMap(0)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition"
            title="Norte"
          >
            <span className="material-symbols-outlined text-gray-700">north</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => rotateMap(-90)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition"
              title="Oeste"
            >
              <span className="material-symbols-outlined text-gray-700">west</span>
            </button>
            <button
              onClick={() => rotateMap(90)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition"
              title="Leste"
            >
              <span className="material-symbols-outlined text-gray-700">east</span>
            </button>
          </div>
          <button
            onClick={() => rotateMap(180)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-white transition"
            title="Sul"
          >
            <span className="material-symbols-outlined text-gray-700">south</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelMap;
