/**
 * Componente de conteúdo principal
 * 
 * Renderiza o layout principal com o grid de cards (mensagem, versículo, galeria, calendário)
 * para desktop e mobile.
 */

import DailyMessageCard from './DailyMessageCard';
import DailyVerseCard from './DailyVerseCard';
import PhotoGalleryCard from './PhotoGalleryCard';
import JourneyCard from './JourneyCard';
import ICloudCalendarWidget from './ICloudCalendarWidget';

const MainContent = ({ selectedDate, dailyMessage, dailyVerse }) => {
  return (
    <div className="flex-1 px-4 md:px-8 pt-4 pb-4 overflow-hidden">
      {/* Desktop: grid com 3 colunas - altura total da tela */}
      <div className="flex flex-col gap-4 mt-0 h-full md:grid md:grid-cols-[1fr_auto_20rem] md:grid-rows-[auto_1fr] md:gap-x-4 md:gap-y-4">
        {/* Coluna 1: Mensagem (linha 1) */}
        <div className="hidden md:col-start-1 md:row-start-1 md:row-span-1 min-h-0 md:block">
          <DailyMessageCard
            key={selectedDate || 'today'}
            message={dailyMessage}
          />
        </div>

        {/* Coluna 2: Nossa Jornada (mobile: abaixo da mensagem) */}
        <div className="hidden md:col-start-2 md:row-start-1 md:row-span-1 min-h-0 md:block">
          <JourneyCard />
        </div>

        {/* Coluna 1: Versículo (linha 2) */}
        <div className="hidden md:col-start-1 md:row-start-2 md:row-span-1 min-h-0 overflow-hidden md:block">
          <DailyVerseCard
            key={selectedDate || 'today'}
            verse={dailyVerse}
          />
        </div>

        {/* Coluna 2: Galeria de Fotos (mobile: abaixo do versículo) */}
        <div className="hidden md:col-start-2 md:row-start-2 md:row-span-1 min-h-0 overflow-hidden -mt-[165px] md:block">
          <PhotoGalleryCard />
        </div>

        {/* Coluna 3: Calendário iCloud (mobile: abaixo da galeria) */}
        <div className="hidden md:col-start-3 md:row-start-1 md:row-span-2 min-h-0 overflow-hidden md:block">
          <ICloudCalendarWidget />
        </div>

        {/* Move JourneyCard to be visible on mobile here if needed, or remove existing hidden class */}
        <div className="md:hidden">
          <JourneyCard />
        </div>

        {/* DailyMessageCard mobile version */}
        <div className="md:hidden">
          <DailyMessageCard
            key={selectedDate || 'today'}
            message={dailyMessage}
          />
        </div>

        {/* DailyVerseCard mobile version */}
        <div className="md:hidden">
          <DailyVerseCard
            key={selectedDate || 'today'}
            verse={dailyVerse}
          />
        </div>

        {/* Move PhotoGalleryCard to be visible on mobile here if needed, or remove existing hidden class */}
        <div className="md:hidden">
          <PhotoGalleryCard />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
