import { useState, useEffect, useRef, memo } from 'react';

const TravelMap = memo(({ places, onAddPlace, onPlaceClick, isAddingMode: externalAddingMode, onMapReady }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userLocationRef = useRef(null);
  const tempMarkerRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);

  const getIconEmoji = (iconId) => {
    const icons = {
      heart: '❤️',
      suitcase: '🧳',
      star: '⭐',
      camera: '📸',
      food: '🍽️',
    };
    return icons[iconId] || '❤️';
  };

  const handleCenterOnUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          userLocationRef.current = { lat: userLat, lng: userLng };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: userLat, lng: userLng });
            mapInstanceRef.current.setZoom(15);

            // Remover marcador anterior se existir
            if (userMarker) {
              userMarker.setMap(null);
            }

            // Adicionar marcador de localização do usuário
            const newUserMarker = new window.google.maps.Marker({
              position: { lat: userLat, lng: userLng },
              map: mapInstanceRef.current,
              title: 'Sua localização',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }
            });

            setUserMarker(newUserMarker);
          }
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          alert('Não foi possível obter sua localização');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocalização não suportada neste navegador');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      if (!mapInstanceRef.current && mapRef.current) {
        try {
          // Centralizar no primeiro lugar salvo se houver
          const center = places.length > 0
            ? { lat: places[0].lat, lng: places[0].lng }
            : { lat: -22.9068, lng: -43.1729 }; // Rio de Janeiro como padrão

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: places.length > 0 ? 16 : 13,
            mapTypeId: 'hybrid',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
              }
            ]
          });

          // Expor a instância do mapa para o componente pai
          if (onMapReady) {
            onMapReady(mapInstanceRef.current);
          }

          // Se não houver lugares, tentar obter localização atual do usuário
          if (places.length === 0 && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                userLocationRef.current = { lat: userLat, lng: userLng };

                // Centralizar na localização do usuário
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setCenter({ lat: userLat, lng: userLng });
                  mapInstanceRef.current.setZoom(15);

                  // Adicionar marcador de localização do usuário
                  const userMarker = new window.google.maps.Marker({
                    position: { lat: userLat, lng: userLng },
                    map: mapInstanceRef.current,
                    title: 'Sua localização',
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#4285F4',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }
                  });

                  markersRef.current.push({ marker: userMarker, infoWindow: null });
                }
              },
              (error) => {
                console.log('Erro ao obter localização:', error);
                // Continua com o centro padrão (Rio de Janeiro)
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          }

          // Adicionar marcadores existentes
          places.forEach(place => {
            const iconEmoji = getIconEmoji(place.icon);
            const marker = new window.google.maps.Marker({
              position: { lat: place.lat, lng: place.lng },
              map: mapInstanceRef.current,
              title: place.name,
              label: {
                text: iconEmoji,
                fontSize: '24px',
                className: 'custom-marker'
              },
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0,
              }
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
            if (externalAddingMode) {
              const { lat, lng } = e.latLng;

              // Remover marcador temporário anterior se existir
              if (tempMarkerRef.current) {
                tempMarkerRef.current.setMap(null);
              }

              // Adicionar marcador temporário
              tempMarkerRef.current = new window.google.maps.Marker({
                position: { lat: lat(), lng: lng() },
                map: mapInstanceRef.current,
                title: 'Localização selecionada',
                label: {
                  text: '📍',
                  fontSize: '24px',
                },
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 0,
                },
                animation: window.google.maps.Animation.DROP
              });

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
          if (infoWindow) {
            infoWindow.close();
          }
        });
        mapInstanceRef.current = null;
      }
    };
  }, [externalAddingMode, onAddPlace]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Limpar marcadores antigos
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        if (infoWindow) {
          infoWindow.close();
        }
      });
      markersRef.current = [];

      // Adicionar novos marcadores
      places.forEach(place => {
        const iconEmoji = getIconEmoji(place.icon);
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstanceRef.current,
          title: place.name,
          label: {
            text: iconEmoji,
            fontSize: '24px',
            className: 'custom-marker'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 0,
          }
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
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapRef}
        className="w-full h-full"
      />
      <button
        onClick={handleCenterOnUser}
        className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        title="Minha localização"
      >
        <span className="material-symbols-outlined text-blue-500">my_location</span>
      </button>
    </div>
  );
});

export default TravelMap;
