/**
 * Serviço para integração com calendário iCloud
 * 
 * Este serviço permite buscar eventos de um calendário iCloud público,
 * parsear o formato ICS e fornecer funções utilitárias para manipulação de eventos.
 * 
 * @module icloudCalendarService
 */

import { ICLOUD_CALENDAR_URL, CORS_PROXY_URL } from '../constants/appConfig';
import { logger } from '../utils/logger';

const ICAL_URL = ICLOUD_CALENDAR_URL;
const CORS_PROXY = CORS_PROXY_URL;

// IndexedDB configuration para cache de calendário
const CALENDAR_DB_NAME = 'love-app-calendar';
const CALENDAR_DB_VERSION = 1;
const CALENDAR_STORE_NAME = 'calendar-cache';

/**
 * Abre o IndexedDB para cache de calendário
 */
const openCalendarDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CALENDAR_DB_NAME, CALENDAR_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(CALENDAR_STORE_NAME)) {
        db.createObjectStore(CALENDAR_STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Salva eventos no IndexedDB
 */
const saveCalendarCache = async (events) => {
  try {
    const db = await openCalendarDB();
    const tx = db.transaction(CALENDAR_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CALENDAR_STORE_NAME);

    await store.put({
      key: 'events',
      data: events,
      timestamp: Date.now()
    });

    await tx.done;
    db.close();
  } catch (error) {
    logger.error('Erro ao salvar cache de calendário:', error);
  }
};

/**
 * Lê eventos do IndexedDB (função interna)
 */
const readCalendarCacheInternal = async () => {
  try {
    const db = await openCalendarDB();
    const tx = db.transaction(CALENDAR_STORE_NAME, 'readonly');
    const store = tx.objectStore(CALENDAR_STORE_NAME);
    const result = await store.get('events');
    await tx.done;
    db.close();

    if (result) {
      // Verificar se o cache ainda é válido (24 horas)
      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
      if (Date.now() - result.timestamp < CACHE_TTL) {
        return result.data;
      }
    }
    return null;
  } catch (error) {
    logger.error('Erro ao ler cache de calendário:', error);
    return null;
  }
};

/**
 * Limpa o cache de calendário
 */
const clearCalendarCache = async () => {
  try {
    const db = await openCalendarDB();
    const tx = db.transaction(CALENDAR_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CALENDAR_STORE_NAME);
    await store.delete('events');
    await tx.done;
    db.close();
  } catch (error) {
    logger.error('Erro ao limpar cache de calendário:', error);
  }
};

/**
 * Converte URL webcal para HTTPS com proxy CORS
 * 
 * URLs webcal:// não funcionam diretamente no navegador, então usamos um proxy CORS
 * para contornar essa limitação.
 * 
 * @returns {string} URL HTTPS com proxy CORS
 */
const getCalendarUrl = () => {
  const httpsUrl = ICAL_URL.replace('webcal://', 'https://');
  return CORS_PROXY + encodeURIComponent(httpsUrl);
};

/**
 * Parser ICS manual (sem bibliotecas externas)
 * 
 * Parseia arquivos no formato iCalendar (.ics) e extrai eventos.
 * Suporta eventos com ou sem hora, localização e descrição.
 * 
 * @param {string} icsText - Conteúdo do arquivo ICS
 * @returns {Array} Lista de eventos parseados
 */
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

/**
 * Parsear data do formato ICS para objeto Date
 * 
 * Formatos suportados:
 * - YYYYMMDD (dia todo)
 * - YYYYMMDDTHHMMSS (com hora)
 * 
 * @param {string} dateStr - Data no formato ICS
 * @returns {Date} Objeto Date JavaScript
 */
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

/**
 * Filtra eventos para os próximos dias
 * 
 * @param {Array} events - Lista de eventos
 * @param {Object} options - Opções de filtro
 * @param {number} options.daysAhead - Número de dias à frente (padrão: 14)
 * @param {number} options.limit - Limite de eventos a retornar (padrão: 10)
 * @returns {Array} Lista de eventos filtrados
 */
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

/**
 * Formata evento para exibição no ticker
 * 
 * @param {Object} event - Evento do calendário
 * @returns {string} String formatada para exibição (ex: "31/05 14:00 — Título")
 */
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

/**
 * Tempo de vida do cache em milissegundos (2 horas)
 */
export const CALENDAR_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

/**
 * Chaves para armazenamento em cache
 */
const CALENDAR_EVENTS_CACHE_KEY = 'love-app-calendar-events';
const CALENDAR_UPDATED_CACHE_KEY = 'love-app-calendar-updated-at';

/**
 * Serializa eventos para armazenamento em cache
 * Converte objetos Date para strings ISO
 * 
 * @param {Array} events - Lista de eventos
 * @returns {Array} Eventos serializados
 */
const serializeEventsForCache = (events) =>
  events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
  }));

/**
 * Deserializa eventos do cache
 * Converte strings ISO de volta para objetos Date
 * 
 * @param {Array} events - Lista de eventos serializados
 * @returns {Array} Eventos deserializados
 */
const deserializeEventsFromCache = (events) =>
  events.map((event) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
  }));

/**
 * Lê eventos do cache do IndexedDB
 * 
 * @returns {Object|null} Objeto com eventos e data de atualização, ou null se cache inválido/expirado
 */
export const readCalendarCache = async () => {
  try {
    const cached = await readCalendarCacheInternal();
    if (cached) {
      return {
        events: cached,
        lastUpdated: new Date()
      };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Escreve eventos no cache do IndexedDB
 * 
 * @param {Array} events - Lista de eventos para armazenar
 * @returns {Date} Data de atualização
 */
export const writeCalendarCache = async (events) => {
  await saveCalendarCache(events);
  return new Date();
};

/**
 * Busca eventos do calendário iCloud
 * 
 * Faz uma requisição ao calendário iCloud público, parseia o formato ICS
 * e retorna a lista de eventos ordenados por data.
 * 
 * @returns {Promise<Array>} Lista de eventos ordenados por data
 * @throws {Error} Se houver erro na requisição
 */
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
    logger.error('Erro ao carregar calendário iCloud:', error);
    return [];
  }
};
