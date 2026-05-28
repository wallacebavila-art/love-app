import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import TravelMap from './TravelMap';
import { useTimePeriod } from '../contexts/TimePeriodContext';

const TravelMapModal = ({ isOpen, onClose }) => {
  const { period } = useTimePeriod();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    date: '',
  });
  const [tempPosition, setTempPosition] = useState(null);

  const getCardBackground = () => {
    switch (period) {
      case 'morning':
        return 'bg-black/40';
      case 'afternoon':
        return 'bg-black/40';
      case 'night':
        return 'bg-black/50';
      default:
        return 'bg-black/40';
    }
  };

  const getBorderColor = () => {
    switch (period) {
      case 'morning':
        return 'border-white/35';
      case 'afternoon':
        return 'border-white/35';
      case 'night':
        return 'border-white/25';
      default:
        return 'border-white/35';
    }
  };

  const getTextColor = () => {
    switch (period) {
      case 'morning':
        return 'text-white';
      case 'afternoon':
        return 'text-white';
      case 'night':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlaces();
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

  const handleAddPlace = (lat, lng) => {
    setTempPosition({ lat, lng });
    setShowAddForm(true);
  };

  const handleSavePlace = async () => {
    if (!newPlace.name.trim() || !tempPosition) {
      alert('Por favor, preencha o nome do lugar');
      return;
    }

    try {
      const placesRef = collection(db, 'places');
      await addDoc(placesRef, {
        name: newPlace.name,
        description: newPlace.description,
        date: newPlace.date || new Date().toISOString(),
        lat: tempPosition.lat,
        lng: tempPosition.lng,
        createdAt: new Date().toISOString(),
      });

      setNewPlace({ name: '', description: '', date: '' });
      setTempPosition(null);
      setShowAddForm(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} rounded-[32px] shadow-2xl shadow-black/10 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className={`px-6 py-4 flex justify-between items-center border-b ${getBorderColor()}`}>
          <h2 className={`text-2xl font-bold ${getTextColor()}`}>Mapa de Viagens</h2>
          <button
            onClick={onClose}
            className={`${getTextColor()} hover:bg-white/20 rounded-full p-2 transition`}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-white/60">
              <span className="material-symbols-outlined text-4xl mb-2">map</span>
              <p>Carregando mapa...</p>
            </div>
          ) : (
            <>
              <TravelMap
                places={places}
                onAddPlace={handleAddPlace}
                onPlaceClick={(place) => console.log('Place clicked:', place)}
              />

              {showAddForm && (
                <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Adicionar Novo Lugar</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-white/80 mb-2`}>
                        Nome do Lugar *
                      </label>
                      <input
                        type="text"
                        value={newPlace.name}
                        onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white"
                        placeholder="Ex: Restaurante em Paris"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-white/80 mb-2`}>
                        Descrição
                      </label>
                      <textarea
                        value={newPlace.description}
                        onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white"
                        placeholder="Descrição do lugar..."
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-white/80 mb-2`}>
                        Data da Visita
                      </label>
                      <input
                        type="date"
                        value={newPlace.date}
                        onChange={(e) => setNewPlace({ ...newPlace, date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePlace}
                        className="flex-1 px-4 py-2 bg-blue-500/50 text-white rounded-lg hover:bg-blue-500/70 transition font-semibold"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewPlace({ name: '', description: '', date: '' });
                          setTempPosition(null);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-500/50 text-white rounded-lg hover:bg-gray-500/70 transition font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Lugares Visitados ({places.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {places.map((place) => (
                    <div key={place.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                      <h4 className={`font-semibold ${getTextColor()} mb-2`}>{place.name}</h4>
                      {place.description && (
                        <p className="text-sm text-white/70 mb-2">{place.description}</p>
                      )}
                      {place.date && (
                        <p className="text-xs text-white/50 mb-3">
                          Visitado em: {new Date(place.date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Deletar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelMapModal;
