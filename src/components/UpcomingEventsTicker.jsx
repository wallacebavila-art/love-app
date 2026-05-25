import { Fragment, useMemo } from 'react';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useCalendarEvents } from '../contexts/CalendarEventsContext';
import {
  formatEventForTicker,
  getUpcomingEvents,
} from '../services/icloudCalendarService';

const TickerSegment = ({ items, textColor, duplicate = false }) => (
  <div
    className="events-ticker__segment"
    aria-hidden={duplicate || undefined}
  >
    {items.map((item, index) => (
      <Fragment key={index}>
        {index > 0 && <span className="events-ticker__divider" />}
        <span className={`events-ticker__item font-body-md text-[12px] ${textColor}`}>
          {item}
        </span>
      </Fragment>
    ))}
  </div>
);

const UpcomingEventsTicker = () => {
  const { period } = useTimePeriod();
  const { events, isLoading } = useCalendarEvents();

  const tickerItems = useMemo(
    () => getUpcomingEvents(events).map(formatEventForTicker),
    [events]
  );

  const getBarStyles = () => {
    switch (period) {
      case 'night':
        return 'bg-white/10 border-white/20';
      default:
        return 'bg-white/15 border-white/25';
    }
  };

  const getTextColor = () => 'text-white/90';

  if (isLoading) {
    return (
      <div
        className={`mx-4 md:mx-8 mb-2 px-3 py-1.5 rounded-xl border backdrop-blur-md ${getBarStyles()}`}
        aria-live="polite"
      >
        <p className={`font-body-md text-[11px] text-center ${getTextColor()} opacity-70`}>
          Carregando...
        </p>
      </div>
    );
  }

  const hasEvents = tickerItems.length > 0;
  const textColor = getTextColor();

  return (
    <div
      className={`mx-4 md:mx-8 mb-2 rounded-xl border backdrop-blur-md overflow-hidden ${getBarStyles()}`}
      aria-live="polite"
    >
      <div className="flex items-stretch gap-2 px-2 py-1">
        <div className="flex items-center flex-shrink-0 pr-1 border-r border-white/25">
          <span
            className={`material-symbols-outlined text-[18px] ${textColor}`}
            style={{ fontVariationSettings: 'FILL 1' }}
          >
            event
          </span>
        </div>

        <div className={`flex-1 min-w-0 flex items-center ${hasEvents ? 'events-ticker' : ''}`}>
          {hasEvents ? (
            <div className="events-ticker__track">
              <TickerSegment items={tickerItems} textColor={textColor} />
              <TickerSegment items={tickerItems} textColor={textColor} duplicate />
            </div>
          ) : (
            <p className={`font-body-md text-[11px] text-center w-full ${textColor} opacity-80`}>
              Nenhum evento nos próximos 14 dias
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsTicker;
