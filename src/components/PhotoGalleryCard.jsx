import { useState, useEffect } from 'react';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { fetchAllPhotos } from '../services/photoService';

const PhotoGalleryCard = () => {
  const { period } = useTimePeriod();
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Carregar fotos do Firebase
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photosData = await fetchAllPhotos();
        setPhotos(photosData);
      } catch (error) {
        console.error('Erro ao carregar fotos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotos();
  }, []);

  // Slide automático
  useEffect(() => {
    if (photos.length <= 1 || isPaused || isExpanded) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000); // Troca a cada 3 segundos

    return () => clearInterval(interval);
  }, [photos.length, isPaused, isExpanded]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % photos.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

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
      case 'afternoon':
      case 'night':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full h-[500px] rounded-[28px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center`}>
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-white/30 rounded-full mb-2"></div>
                <div className="h-3 bg-white/30 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <div className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border ${getBorderColor()} w-full h-[150px] rounded-[28px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center text-center p-4`}>
              <span className="material-symbols-outlined text-white/60 text-[36px] mb-2">photo_library</span>
              <p className={`font-body-md text-[12px] ${getTextColor()}/70`}>
                Nenhuma foto ainda
              </p>
              <p className={`font-body-md text-[10px] ${getTextColor()}/50 mt-1`}>
                Adicione fotos no painel administrativo
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <section className="w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-2xl">
          <div
            className={`${getCardBackground()} backdrop-blur-[24px] -webkit-backdrop-blur-[24px] border-2 ${getBorderColor()} w-full h-[450px] rounded-[32px] shadow-2xl shadow-black/10 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:bg-white/40 hover:shadow-2xl hover:shadow-black/20`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Badge de Origem (Opcional, apenas para debug interno se necessário, mas vamos deixar discreto) */}
            {currentPhoto.isLocal && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full z-20 pointer-events-none">
                <span className="text-[8px] text-white/40 uppercase tracking-tighter">Modo Offline</span>
              </div>
            )}

            {/* Header */}
            <div className="absolute top-3 right-6 z-10">
              <div className="flex gap-1">
                <button
                  onClick={goToPrevious}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-[16px]">chevron_left</span>
                </button>
                <button
                  onClick={goToNext}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Photo */}
            <div className="w-full h-full flex items-center justify-center p-2 cursor-pointer" onClick={() => setIsExpanded(true)}>
              {currentPhoto.url ? (
                <img
                  src={currentPhoto.url.startsWith('http') ? currentPhoto.url : currentPhoto.url}
                  alt={currentPhoto.caption || 'Foto'}
                  referrerPolicy={currentPhoto.url.startsWith('http') ? "no-referrer" : undefined}
                  crossOrigin={currentPhoto.url.startsWith('http') ? "anonymous" : undefined}
                  className="w-full h-full object-cover rounded-[32px] shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-2xl">
                  <span className="material-symbols-outlined text-white/30 text-[48px]">image</span>
                </div>
              )}
            </div>

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-4 left-0 right-0 p-2">
                <p className={`font-body-md text-[10px] ${getTextColor()} text-center drop-shadow-lg`}>
                  {currentPhoto.caption}
                </p>
              </div>
            )}

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de foto expandida */}
      {isExpanded && (
        <div className="fixed inset-0 z-10 flex items-start justify-center bg-black/90 backdrop-blur-sm pt-16" onClick={() => setIsExpanded(false)}>
          <div className="relative w-full flex items-center justify-center p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-white text-[24px]">close</span>
            </button>

            {/* Botão anterior */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
            </button>

            {/* Botão próximo */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center z-10"
            >
              <span className="material-symbols-outlined text-white text-[32px]">chevron_right</span>
            </button>

            <div className="relative max-w-[365px] max-h-[95vh]">
              <img
                src={currentPhoto.url.startsWith('http') ? currentPhoto.url : currentPhoto.url}
                alt={currentPhoto.caption || 'Foto'}
                referrerPolicy={currentPhoto.url.startsWith('http') ? "no-referrer" : undefined}
                crossOrigin={currentPhoto.url.startsWith('http') ? "anonymous" : undefined}
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
              />
              {currentPhoto.caption && (
                <p className={`font-body-md text-[12px] text-white text-center mt-2 drop-shadow-lg`}>
                  {currentPhoto.caption}
                </p>
              )}
            </div>

            {/* Dots de navegação */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGalleryCard;