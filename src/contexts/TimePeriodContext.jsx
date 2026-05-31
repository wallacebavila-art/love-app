import { createContext, useContext, useState, useEffect } from 'react';
import { getDayPeriod } from '../utils/dateUtils';

const TimePeriodContext = createContext();

export const useTimePeriod = () => {
  const context = useContext(TimePeriodContext);
  if (!context) {
    throw new Error('useTimePeriod must be used within a TimePeriodProvider');
  }
  return context;
};

export const TimePeriodProvider = ({ children }) => {
  const [period, setPeriod] = useState(getDayPeriod());

  const updateTimePeriod = () => {
    setPeriod(getDayPeriod());
  };

  // Atualizar o período a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimePeriod();
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <TimePeriodContext.Provider value={{ period }}>
      {children}
    </TimePeriodContext.Provider>
  );
};
