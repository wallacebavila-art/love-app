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
  const [isManualMode, setIsManualMode] = useState(false);

  const updateTimePeriod = () => {
    if (!isManualMode) {
      setPeriod(getDayPeriod());
    }
  };

  const setManualPeriod = (newPeriod) => {
    setPeriod(newPeriod);
    setIsManualMode(true);
  };

  const resetToAuto = () => {
    setIsManualMode(false);
    setPeriod(getDayPeriod());
  };

  // Atualizar o período a cada minuto (apenas se não estiver em modo manual)
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimePeriod();
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [isManualMode]);

  return (
    <TimePeriodContext.Provider value={{ period, setManualPeriod, resetToAuto, isManualMode }}>
      {children}
    </TimePeriodContext.Provider>
  );
};
