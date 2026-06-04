import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CALENDAR_CACHE_TTL_MS,
  fetchICloudCalendar,
  readCalendarCache,
  writeCalendarCache,
} from '../services/icloudCalendarService';

const CalendarEventsContext = createContext(null);

export const REFRESH_INTERVAL_MS = CALENDAR_CACHE_TTL_MS;

const getInitialCalendarState = async () => {
  const cached = await readCalendarCache();
  if (cached) {
    return {
      events: cached.events,
      lastUpdated: cached.lastUpdated,
      isLoading: false,
    };
  }
  return { events: [], lastUpdated: null, isLoading: true };
};

export const CalendarEventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadEvents = useCallback(async ({ initial = false, force = false } = {}) => {
    if (!force) {
      const cached = await readCalendarCache();
      if (cached) {
        setEvents(cached.events);
        setLastUpdated(cached.lastUpdated);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
    }

    if (initial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const calendarEvents = await fetchICloudCalendar();
      setEvents(calendarEvents);
      setLastUpdated(await writeCalendarCache(calendarEvents));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => loadEvents({ force: true }), [loadEvents]);

  useEffect(() => {
    loadEvents({ initial: !lastUpdated });

    const interval = setInterval(() => {
      loadEvents();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadEvents]);

  return (
    <CalendarEventsContext.Provider
      value={{ events, isLoading, isRefreshing, lastUpdated, refresh, loadEvents }}
    >
      {children}
    </CalendarEventsContext.Provider>
  );
};

export const useCalendarEvents = () => {
  const context = useContext(CalendarEventsContext);
  if (!context) {
    throw new Error('useCalendarEvents must be used within a CalendarEventsProvider');
  }
  return context;
};
