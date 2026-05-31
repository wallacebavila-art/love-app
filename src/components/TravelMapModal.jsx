import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import TravelMap from './TravelMap';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const TravelMapModal = ({ isOpen, onClose }) => {
  const { getCardBackground, getBorderColor, getTextColor } = useThemeStyles();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    date: '',
    icon: 'star', // ícone padrão
  });
  const [tempPosition, setTempPosition] = useState(null);
  const mapInstanceRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [editingPlace, setEditingPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Pesquisar usando Places API (Legacy)
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term || term.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: term },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
            setShowSearchResults(true);
          } else {
            setSearchResults([]);
          }
        }
      );
    }
  }, []);

  // Selecionar lugar da pesquisa
  const handleSelectSearchResult = useCallback((place) => {
    if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.PlacesService) {
      const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
      service.getDetails(
        { placeId: place.place_id },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();

            // Centralizar no mapa
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo({ lat, lng });
              mapInstanceRef.current.setZoom(16);
            }

            // Preencher formulário
            setNewPlace({
              name: result.name || place.description,
              description: result.formatted_address || '',
              date: new Date().toISOString().split('T')[0],
              icon: 'heart'
            });
            setTempPosition({ lat, lng });
            setShowAddForm(true);
            setShowSearchResults(false);
            setSearchTerm('');
          }
        }
      );
    }
  }, [mapInstanceRef]);

  const getIconEmoji = (iconId) => {
    const icons = {
      heart: '❤️',
      suitcase: '🧳',
      star: '⭐',
      camera: '📸',
      food: '🍽️',
      place: '📍',
    };
    return icons[iconId] || '⭐';
  };

  useEffect(() => {
    if (isOpen) {
      // Carregar Google Maps lazy loading
      setMapsLoading(true);
      loadGoogleMaps()
        .then(() => {
          setMapsLoading(false);
          fetchPlaces();
        })
        .catch((error) => {
          console.error('Erro ao carregar Google Maps:', error);
          setMapsLoading(false);
          setLoading(false);
        });
    }
  }, [isOpen]);

  const fetchPlaces = async () => {
    try {
      const placesRef = collection(db, 'places');
      const snapshot = await getDocs(placesRef);
      const placesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lat: doc.data().lat,
        lng: doc.data().lng,
      }));
      setPlaces(placesData);
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = useCallback((lat, lng) => {
    setTempPosition({ lat, lng });
    setShowAddForm(true);

    // Geocoding reverso para obter o endereço
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          // Preencher o nome do lugar com o endereço obtido
          setNewPlace(prev => ({
            ...prev,
            name: address
          }));
        }
      });
    }
  }, []);

  const handleOpenAddForm = useCallback(() => {
    setShowAddForm(true);
    setTempPosition(null); // Reset position when opening form from header
  }, []);

  const handleSavePlace = async () => {
    console.log('Tentando salvar lugar:', newPlace);
    console.log('TempPosition:', tempPosition);

    if (!tempPosition) {
      alert('Por favor, clique no mapa para selecionar a localização');
      return;
    }

    if (!newPlace.name || newPlace.name.trim() === '') {
      alert('Por favor, preencha o nome do lugar');
      return;
    }

    try {
      if (editingPlace) {
        // Editar lugar existente
        const placeRef = doc(db, 'places', editingPlace.id);
        await updateDoc(placeRef, {
          name: newPlace.name.trim(),
          description: newPlace.description?.trim() || '',
          date: newPlace.date || new Date().toISOString(),
          icon: newPlace.icon || 'heart',
          lat: tempPosition.lat,
          lng: tempPosition.lng,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Adicionar novo lugar
        const placesRef = collection(db, 'places');
        await addDoc(placesRef, {
          name: newPlace.name.trim(),
          description: newPlace.description?.trim() || '',
          date: newPlace.date || new Date().toISOString(),
          icon: newPlace.icon || 'heart',
          lat: tempPosition.lat,
          lng: tempPosition.lng,
          createdAt: new Date().toISOString(),
        });
      }

      setNewPlace({ name: '', description: '', date: '', icon: 'heart' });
      setTempPosition(null);
      setShowAddForm(false);
      setEditingPlace(null);
      fetchPlaces();
    } catch (error) {
      console.error('Erro ao salvar lugar:', error);
      alert('Erro ao salvar lugar');
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Tem certeza que deseja deletar este lugar?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'places', placeId));
      fetchPlaces();
    } catch (error) {
      console.error('Erro ao deletar lugar:', error);
      alert('Erro ao deletar lugar');
    }
  };

  const handlePlaceClick = useCallback((place) => {
    console.log('Place clicked:', place);
    // Centralizar no lugar no mapa
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: place.lat, lng: place.lng });
      mapInstanceRef.current.setZoom(16);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-[32px] shadow-2xl shadow-black/10 w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col`}>
        {/* Map Container */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <span className="material-symbols-outlined text-4xl mb-2 animate-pulse">map</span>
                <p className="ml-2">Carregando mapa...</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <TravelMap
                  places={places}
                  onAddPlace={handleAddPlace}
                  onPlaceClick={handlePlaceClick}
                  isAddingMode={showAddForm}
                  onMapReady={(map) => {
                    mapInstanceRef.current = map;
                  }}
                />
              </div>
            )}

            {/* Add Form Overlay */}
            {showAddForm && (
              <div className="absolute top-4 right-4 w-64 bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl z-10">
                <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>
                  {editingPlace ? 'Editar Lugar' : 'Adicionar Novo Lugar'}
                </h3>
                {!tempPosition && !editingPlace && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                    <p className="text-sm text-yellow-200">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">warning</span>
                      Clique no mapa para selecionar a localização
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-medium text-white/80 mb-1`}>
                      Nome do Lugar *
                    </label>
                    <input
                      type="text"
                      value={newPlace.name}
                      onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white text-sm"
                      placeholder="Ex: Restaurante em Paris"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium text-white/80 mb-1`}>
                      Descrição
                    </label>
                    <textarea
                      value={newPlace.description}
                      onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white text-sm resize-none"
                      rows="2"
                      placeholder="Ex: Jantar romântico com vista para a Torre Eiffel"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium text-white/80 mb-1`}>
                      Data da Visita
                    </label>
                    <input
                      type="date"
                      value={newPlace.date}
                      onChange={(e) => setNewPlace({ ...newPlace, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium text-white/80 mb-1`}>
                      Ícone
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['star', 'suitcase', 'place'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewPlace({ ...newPlace, icon })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                            newPlace.icon === icon
                              ? 'bg-blue-500/50 border-2 border-blue-400'
                              : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {getIconEmoji(icon)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSavePlace}
                    className="flex-1 px-4 py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500/70 transition font-semibold text-sm"
                  >
                    {editingPlace ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPlace({ name: '', description: '', date: '', icon: 'heart' });
                      setTempPosition(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500/50 text-white rounded-lg hover:bg-gray-500/70 transition font-semibold text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Lista de Lugares */}
        <div className={`${isSidebarCollapsed ? 'h-16' : 'h-72'} border-t ${getBorderColor()} flex flex-col flex-shrink-0 transition-all duration-300`}>
          <div className={`px-5 py-4 border-b ${getBorderColor()} flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCardBackground()} border ${getBorderColor()}`}>
                  <span className="material-symbols-outlined text-sm">place</span>
                </div>
                <div>
                  <h2 className={`text-base font-bold ${getTextColor()}`}>Lugares</h2>
                  <p className={`text-xs text-white/50`}>{places.length} salvos</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`${getTextColor()} hover:bg-white/20 rounded-full p-2 transition`}
              title={isSidebarCollapsed ? 'Expandir' : 'Recolher'}
            >
              <span className="material-symbols-outlined text-sm">
                {isSidebarCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className={`p-4 border-b ${getBorderColor()}`}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Pesquisar local..."
                  className="w-full px-4 py-2.5 pl-10 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none text-white text-sm placeholder-white/40 transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">search</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-xl rounded-2xl p-3 space-y-2 z-20 overflow-y-auto border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-semibold ${getTextColor()}`}>Resultados da pesquisa</span>
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchTerm('');
                    }}
                    className="text-xs text-white/60 hover:text-white transition rounded-full p-1 hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                {searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    onClick={() => handleSelectSearchResult(place)}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 hover:bg-white/20 transition cursor-pointer group"
                  >
                    <h4 className={`font-semibold ${getTextColor()} text-sm mb-1 group-hover:text-white/90 transition`}>{place.structured_formatting.main_text}</h4>
                    <p className="text-xs text-white/60 group-hover:text-white/70 transition">{place.structured_formatting.secondary_text}</p>
                  </div>
                ))}
              </div>
            )}
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition cursor-pointer group ${
                  isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'items-start gap-3'}`}>
                  <div className={`${isSidebarCollapsed ? '' : 'w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/20'} flex-shrink-0`}>
                    <span className={`${isSidebarCollapsed ? 'text-xl' : 'text-xl'}`}>{getIconEmoji(place.icon)}</span>
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${getTextColor()} text-sm mb-1 truncate group-hover:text-white/90 transition`}>{place.name}</h4>
                      {place.description && (
                        <p className="text-xs text-white/60 mb-1 line-clamp-2 group-hover:text-white/70 transition">{place.description}</p>
                      )}
                      {place.date && (
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {new Date(place.date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                  {!isSidebarCollapsed && (
                    <div className="flex gap-1 mt-3 pt-2 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlace(place);
                          setNewPlace({
                            name: place.name,
                            description: place.description || '',
                            date: place.date || '',
                            icon: place.icon || 'heart'
                          });
                          setTempPosition({ lat: place.lat, lng: place.lng });
                          setShowAddForm(true);
                        }}
                        className="text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlace(place.id);
                        }}
                        className="text-xs text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg p-1.5 transition-all"
                        title="Deletar"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {places.length === 0 && !isSidebarCollapsed && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-white/30 mb-2">place</span>
                <p className={`text-sm text-white/50`}>Nenhum lugar salvo</p>
                <p className={`text-xs text-white/30 mt-1`}>Clique no mapa para adicionar</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className={`p-4 border-t ${getBorderColor()}`}>
              <button
                onClick={() => {
                  setEditingPlace(null);
                  setIsSidebarCollapsed(true);
                  handleOpenAddForm();
                }}
                className="w-full px-4 py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500/70 transition font-semibold text-sm"
              >
                + Adicionar Lugar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelMapModal;
