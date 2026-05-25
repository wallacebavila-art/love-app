const ICAL_URL = 'webcal://p53-caldav.icloud.com/published/2/MjEzNzMzMjM4NDIyMTM3M5EAdSTRxD1rffBLU84wLQGIjX5WKiOvBlRSnSfjgWZ-sN4vXdQ_gCoeoR_j7_xzsVmRLXKS25VrtuiAeMv7NeE';
const CORS_PROXY = 'https://corsproxy.io/?';

// Converter webcal para https
const getCalendarUrl = () => {
  const httpsUrl = ICAL_URL.replace('webcal://', 'https://');
  return CORS_PROXY + encodeURIComponent(httpsUrl);
};

// Parser ICS manual (sem bibliotecas externas)
const parseICS = (icsText) => {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let currentEvent = null;
  let currentKey = null;
  let currentValue = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Linhas continuadas (começam com espaço ou tab)
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (currentKey && currentEvent) {
        currentValue += line.trim();
      }
      continue;
    }

    // Finalizar o campo anterior
    if (currentKey && currentEvent) {
      currentEvent[currentKey] = currentValue;
    }

    // Começar novo evento
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
      currentKey = null;
      currentValue = '';
      continue;
    }

    // Finalizar evento
    if (line === 'END:VEVENT') {
      if (currentEvent) {
        // Converter datas
        if (currentEvent.DTSTART) {
          currentEvent.startDate = parseICalDate(currentEvent.DTSTART);
        }
        if (currentEvent.DTEND) {
          currentEvent.endDate = parseICalDate(currentEvent.DTEND);
        }
        // Verificar se é evento de dia todo
        currentEvent.isAllDay = !!(currentEvent.DTSTART && currentEvent.DTSTART.includes('VALUE=DATE'));
        // Mapear campos
        events.push({
          id: currentEvent.UID || Math.random().toString(36),
          title: currentEvent.SUMMARY || 'Evento sem título',
          startDate: currentEvent.startDate || new Date(),
          endDate: currentEvent.endDate || new Date(),
          location: currentEvent.LOCATION || '',
          description: currentEvent.DESCRIPTION || '',
          isAllDay: currentEvent.isAllDay
        });
      }
      currentEvent = null;
      currentKey = null;
      currentValue = '';
      continue;
    }

    // Parsear nova linha de campo
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      let keyPart = line.substring(0, colonIndex);
      let valuePart = line.substring(colonIndex + 1);

      // Extrair a chave (remover parâmetros como ;TZID=...)
      const semicolonIndex = keyPart.indexOf(';');
      if (semicolonIndex > 0) {
        keyPart = keyPart.substring(0, semicolonIndex);
      }

      currentKey = keyPart;
      currentValue = valuePart;
    }
  }

  return events;
};

// Parsear data do formato ICS (YYYYMMDD ou YYYYMMDDTHHMMSS)
const parseICalDate = (dateStr) => {
  // Remover parâmetros
  const cleanStr = dateStr.replace(/^.*?:/, '');
  
  let year, month, day, hours = 0, minutes = 0, seconds = 0;
  
  if (cleanStr.includes('T')) {
    // Formato com hora: YYYYMMDDTHHMMSS
    const [datePart, timePart] = cleanStr.split('T');
    year = parseInt(datePart.substring(0, 4));
    month = parseInt(datePart.substring(4, 6)) - 1; // Meses são 0-indexados
    day = parseInt(datePart.substring(6, 8));
    hours = parseInt(timePart.substring(0, 2));
    minutes = parseInt(timePart.substring(2, 4));
    seconds = parseInt(timePart.substring(4, 6));
  } else {
    // Formato sem hora (dia todo): YYYYMMDD
    year = parseInt(cleanStr.substring(0, 4));
    month = parseInt(cleanStr.substring(4, 6)) - 1;
    day = parseInt(cleanStr.substring(6, 8));
  }
  
  return new Date(year, month, day, hours, minutes, seconds);
};

export const getUpcomingEvents = (events, { daysAhead = 14, limit = 10 } = {}) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endDate = new Date(startOfToday);
  endDate.setDate(endDate.getDate() + daysAhead);
  endDate.setHours(23, 59, 59, 999);

  return events
    .filter((event) => event.startDate >= startOfToday && event.startDate <= endDate)
    .slice(0, limit);
};

export const formatEventForTicker = (event) => {
  const dateStr = event.startDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
  const timeStr = event.isAllDay
    ? 'Todo dia'
    : event.startDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
  return `${dateStr} ${timeStr} — ${event.title}`;
};

export const CALENDAR_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

const CALENDAR_EVENTS_CACHE_KEY = 'love-app-calendar-events';
const CALENDAR_UPDATED_CACHE_KEY = 'love-app-calendar-updated-at';

const serializeEventsForCache = (events) =>
  events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
  }));

const deserializeEventsFromCache = (events) =>
  events.map((event) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
  }));

export const readCalendarCache = () => {
  try {
    const updatedAtStr = sessionStorage.getItem(CALENDAR_UPDATED_CACHE_KEY);
    const eventsStr = sessionStorage.getItem(CALENDAR_EVENTS_CACHE_KEY);

    if (!updatedAtStr || !eventsStr) return null;

    const lastUpdated = new Date(updatedAtStr);
    if (Number.isNaN(lastUpdated.getTime())) return null;

    if (Date.now() - lastUpdated.getTime() > CALENDAR_CACHE_TTL_MS) {
      return null;
    }

    const parsed = JSON.parse(eventsStr);
    if (!Array.isArray(parsed)) return null;

    return {
      events: deserializeEventsFromCache(parsed),
      lastUpdated,
    };
  } catch {
    return null;
  }
};

export const writeCalendarCache = (events) => {
  const lastUpdated = new Date();
  sessionStorage.setItem(
    CALENDAR_EVENTS_CACHE_KEY,
    JSON.stringify(serializeEventsForCache(events))
  );
  sessionStorage.setItem(CALENDAR_UPDATED_CACHE_KEY, lastUpdated.toISOString());
  return lastUpdated;
};

export const fetchICloudCalendar = async () => {
  try {
    const response = await fetch(getCalendarUrl());
    if (!response.ok) throw new Error('Erro ao buscar calendário');
    
    const icsData = await response.text();
    const events = parseICS(icsData);
    
    // Ordenar eventos por data
    events.sort((a, b) => a.startDate - b.startDate);
    
    return events;
  } catch (error) {
    console.error('Erro ao carregar calendário iCloud:', error);
    return [];
  }
};
